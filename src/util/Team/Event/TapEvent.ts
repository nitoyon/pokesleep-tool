import { applyHelp } from "../Help";
import type { IterationState, SimulationEvent } from "../Types";

/**
 * AlwaysTap: each tap fires at the next whole-minute boundary after the
 * earliest pending help, so items are collected as soon as possible.
 */
export class AlwaysTapEvent implements SimulationEvent {
	next(_currentSec: number, sim: IterationState): number | null {
		const minHelp = Math.min(...sim.members.map((m) => m.progress.nextHelpSec));
		const tapSec = Math.ceil(minHelp / 60) * 60;
		return tapSec;
	}

	apply(tapSec: number, sim: IterationState): void {
		applyHelp(tapSec, sim);
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

	next(currentSec: number, _sim: IterationState): number | null {
		const tapSec = currentSec + this.tapFreqSec;
		return tapSec > this.periodSec ? null : tapSec;
	}

	apply(tapSec: number, sim: IterationState): void {
		applyHelp(tapSec, sim);
	}
}
