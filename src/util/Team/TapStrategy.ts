import type { MemberSimulationState } from "./Types";

export interface TapStrategy {
	/** Returns the next tap time in seconds, or null when the period is over. */
	next(currentSec: number, states: MemberSimulationState[]): number | null;
}

/**
 * AlwaysTap: each tap fires at the next whole-minute boundary after the
 * earliest pending help, so items are collected as soon as possible.
 */
export class AlwaysTapStrategy implements TapStrategy {
	next(_currentSec: number, states: MemberSimulationState[]): number | null {
		const minHelp = Math.min(...states.map((s) => s.nextHelpSec));
		const tapSec = Math.ceil(minHelp / 60) * 60;
		return tapSec;
	}
}

/**
 * PeriodicTap: taps fire at fixed intervals (tapFreqSec) throughout the period.
 */
export class PeriodicTapStrategy implements TapStrategy {
	constructor(
		private readonly tapFreqSec: number,
		private readonly periodSec: number,
	) {}

	next(currentSec: number, _states: MemberSimulationState[]): number | null {
		const tapSec = currentSec + this.tapFreqSec;
		return tapSec > this.periodSec ? null : tapSec;
	}
}
