import { clamp } from "../../../util/NumberUtil";
import { getEnergy, setEnergy } from "../TeamEnergy";
import type { IterationState, SimulationEvent } from "../Types";

/**
 * Fires at each sleep/wake boundary for all members simultaneously.
 * All members share the same sleep schedule; sleepRecovery is read per-member
 * from sim.members at apply time.
 */
export class SleepRecoverEvent implements SimulationEvent {
	constructor(
		private readonly sleepTimeSec: number,
		private readonly dayLengthSec: number,
	) {}

	next(currentSec: number, sim: IterationState): number {
		const sleeping = sim.members[0].progress.sleeping;
		const day = Math.floor(currentSec / this.dayLengthSec);
		const dayStart = day * this.dayLengthSec;
		const sleepAt = this.sleepTimeSec + dayStart;
		const wakeAt = (day + 1) * this.dayLengthSec;
		if (!sleeping && sleepAt > currentSec) {
			return sleepAt;
		}
		return wakeAt;
	}

	apply(sec: number, sim: IterationState): void {
		for (let i = 0; i < sim.members.length; i++) {
			const { profile, progress } = sim.members[i];

			// entering sleep
			if (!progress.sleeping) {
				progress.sleeping = true;
				continue;
			}

			// waking up
			const energy = getEnergy(sim, i, sec);
			progress.sleeping = false;

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
