import { AlwaysTap, NoTap, type TapFrequency } from "../../Energy";
import { applyHelp } from "../Help/Help";
import { applyPendingExtraHelp } from "../Help/PendingExtraHelp";
import { applyPendingMainSkillActivation } from "../Help/PendingMainSkillActivation";
import { applyPendingEnergy } from "../TeamEnergy";
import type { SimulationEvent, TeamContext } from "../Types";
import { phaseBoundarySec } from "./SleepBoundary";

/**
 * Tap event whose cadence switches between tapFrequencyAwake and
 * tapFrequencyAsleep depending on the team's current sleep state, and which
 * always fires exactly at each sleep/wake boundary so nothing accumulated is
 * left uncollected across the transition.
 */
export class PhaseAwareTapEvent implements SimulationEvent {
	private lastTapSec = 0;

	constructor(
		private readonly tapFreqAwakeMin: TapFrequency,
		private readonly tapFreqAsleepMin: TapFrequency,
		private readonly sleepTimeSec: number,
		private readonly dayLengthSec: number,
		private readonly periodSec: number,
	) {}

	next(currentSec: number, sim: TeamContext): number | null {
		// skip loop
		if (this.lastTapSec === this.periodSec) {
			return null;
		}

		const sleeping = sim.members[0].progress.sleeping;
		const boundarySec = phaseBoundarySec(
			currentSec,
			sleeping,
			this.sleepTimeSec,
			this.dayLengthSec,
		);
		const tapFreq = sleeping ? this.tapFreqAsleepMin : this.tapFreqAwakeMin;

		let candidateSec: number;
		if (tapFreq === NoTap) {
			candidateSec = boundarySec;
		} else if (tapFreq === AlwaysTap) {
			const minHelp = Math.min(
				...sim.members.map((m) => m.progress.nextHelpSec),
			);
			candidateSec = Math.ceil(minHelp / 60) * 60;
		} else {
			candidateSec = this.lastTapSec + tapFreq * 60;
		}

		return Math.min(candidateSec, boundarySec, this.periodSec);
	}

	apply(tapSec: number, sim: TeamContext): void {
		this.lastTapSec = tapSec;
		applyHelp(tapSec, sim);
		applyPendingMainSkillActivation(sim, tapSec);
		applyPendingExtraHelp(sim);
		applyPendingEnergy(sim, tapSec);
	}
}
