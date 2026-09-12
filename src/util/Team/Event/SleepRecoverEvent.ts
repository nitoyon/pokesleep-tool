import { clamp } from "../../../util/NumberUtil";
import { advanceHelpSchedule } from "../Help/Help";
import { getEnergy, setEnergy } from "../TeamEnergy";
import type { SimulationEvent, TeamContext } from "../Types";
import { phaseBoundarySec } from "./SleepBoundary";

/**
 * Fires at each sleep/wake boundary for all members simultaneously.
 * All members share the same sleep schedule; sleepRecovery is read per-member
 * from sim.members at apply time.
 */
export class SleepRecoverEvent implements SimulationEvent {
	constructor(
		private readonly sleepTimeSec: number,
		private readonly dayLengthSec: number,
		private readonly periodSec: number,
	) {}

	private get isShorterThanSleepSession(): boolean {
		return this.periodSec < this.dayLengthSec - this.sleepTimeSec;
	}

	next(currentSec: number, sim: TeamContext): number {
		if (this.isShorterThanSleepSession) {
			return currentSec < this.periodSec
				? this.periodSec
				: Number.POSITIVE_INFINITY;
		}

		const sleeping = sim.members[0].progress.sleeping;
		return phaseBoundarySec(
			currentSec,
			sleeping,
			this.sleepTimeSec,
			this.dayLengthSec,
		);
	}

	apply(sec: number, sim: TeamContext): void {
		for (let i = 0; i < sim.members.length; i++) {
			const { profile, progress } = sim.members[i];

			// entering sleep
			if (!this.isShorterThanSleepSession && !progress.sleeping) {
				progress.sleeping = true;
				continue;
			}

			// waking up
			progress.pendingHelp += advanceHelpSchedule(progress, profile, sec);
			const energy = getEnergy(sim, i, sec);
			progress.sleeping = false;

			// New day: Berry Burst (Disguise) may Great Success again.
			progress.disguiseGreatSuccess = false;

			// Already be above wakeMax upon waking, don't apply
			if (profile.wakeMax < energy) {
				setEnergy(sim, i, sec, energy);
				continue;
			}

			// Apply sleep recovery
			const newEnergy = clamp(
				0,
				energy + profile.sleepRecovery,
				profile.wakeMax,
			);
			setEnergy(sim, i, sec, newEnergy);
		}
	}
}
