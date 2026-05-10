import { applyHelp } from "../Help/Help";
import { applyPendingExtraHelp } from "../Help/PendingExtraHelp";
import { applyPendingMainSkillActivation } from "../Help/PendingMainSkillActivation";
import { applyPendingEnergy } from "../TeamEnergy";
import type { SimulationEvent, TeamContext } from "../Types";

/**
 * AlwaysTap: each tap fires at the next whole-minute boundary after the
 * earliest pending help, so items are collected as soon as possible.
 */
export class AlwaysTapEvent implements SimulationEvent {
	next(_currentSec: number, sim: TeamContext): number | null {
		const minHelp = Math.min(...sim.members.map((m) => m.progress.nextHelpSec));
		const tapSec = Math.ceil(minHelp / 60) * 60;
		return tapSec;
	}

	apply(tapSec: number, sim: TeamContext): void {
		applyHelp(tapSec, sim);
		applyPendingMainSkillActivation(sim, tapSec);
		applyPendingExtraHelp(sim);
		applyPendingEnergy(sim, tapSec);
	}
}

/**
 * PeriodicTap: taps fire at fixed intervals (tapFreqSec) throughout the period.
 */
export class PeriodicTapEvent implements SimulationEvent {
	constructor(
		private readonly tapFreqSec: number,
		private readonly periodSec: number,
	) {}

	next(currentSec: number, _sim: TeamContext): number | null {
		const tapSec = currentSec + this.tapFreqSec;
		return tapSec > this.periodSec ? null : tapSec;
	}

	apply(tapSec: number, sim: TeamContext): void {
		applyHelp(tapSec, sim);
		applyPendingMainSkillActivation(sim, tapSec);
		applyPendingExtraHelp(sim);
		applyPendingEnergy(sim, tapSec);
	}
}
