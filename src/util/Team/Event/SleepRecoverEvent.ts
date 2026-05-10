import { clamp } from "../../../util/NumberUtil";
import { getEnergy, setEnergy } from "../TeamEnergy";
import type { IterationState, SimulationEvent } from "../Types";

/**
 * Fires at each sleep/wake boundary for all members simultaneously.
 * All members share the same sleep schedule; sleepRecovery is read per-member
 * from sim.contexts at apply time.
 */
export class SleepRecoverEvent implements SimulationEvent {
	constructor(
		private readonly sleepTimeSec: number,
		private readonly dayLengthSec: number,
	) {}

	next(currentSec: number, sim: IterationState): number {
		const sleeping = sim.states[0].sleeping;
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
		for (let i = 0; i < sim.contexts.length; i++) {
			// entering sleep
			const state = sim.states[i];
			if (!state.sleeping) {
				state.sleeping = true;
				continue;
			}

			// waking up
			const ctx = sim.contexts[i];
			const energy = getEnergy(sim, i, sec);
			state.sleeping = false;

			// Already be above wakeMax upon waking, don't apply
			if (ctx.wakeMax < energy) {
				setEnergy(sim, i, sec, energy);
				continue;
			}

			// Apply sleep recovery
			const newEnergy = clamp(0, energy + ctx.sleepRecovery, ctx.wakeMax);
			setEnergy(sim, i, sec, newEnergy);
		}
	}
}
