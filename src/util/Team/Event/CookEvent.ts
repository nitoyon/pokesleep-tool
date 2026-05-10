import { getEnergyRecoveryForCook } from "../../Energy";
import { addEnergy } from "../TeamEnergy";
import type { IterationState, SimulationEvent } from "../Types";

/** Cook event offsets from day start (seconds): 10:00, 14:00, 20:00 */
const COOK_OFFSETS_SEC = [7200, 21600, 43200];

/**
 * Fires at each cooking time (10:00, 14:00, 20:00) during the awake period
 * for all members simultaneously. cookBonus is read per-member from sim.members
 * at apply time.
 */
export class CookEvent implements SimulationEvent {
	constructor(
		private readonly sleepTimeSec: number,
		private readonly dayLengthSec: number,
	) {}

	next(currentSec: number, _sim: IterationState): number | null {
		const day = Math.floor(currentSec / this.dayLengthSec);
		const dayStart = day * this.dayLengthSec;
		const sleepAt = this.sleepTimeSec + dayStart;
		for (const offset of COOK_OFFSETS_SEC) {
			const cookSec = dayStart + offset;
			if (cookSec > currentSec && cookSec < sleepAt) {
				return cookSec;
			}
		}
		return null;
	}

	apply(sec: number, sim: IterationState): void {
		for (let i = 0; i < sim.members.length; i++) {
			const { profile, progress } = sim.members[i];
			const diff =
				getEnergyRecoveryForCook(progress.energy) +
				profile.bonus.energyFromDish;
			addEnergy(sim, i, sec, diff);
		}
	}
}
