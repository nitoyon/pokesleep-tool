import { AlwaysTap } from "../Energy";
import { CookEvent } from "./Event/CookEvent";
import { SleepRecoverEvent } from "./Event/SleepRecoverEvent";
import { AlwaysTapEvent, PeriodicTapEvent } from "./Event/TapEvent";
import type { IterationResult, SimulationEvent, TeamContext } from "./Types";

/**
 * Run a single iteration of the team simulation.
 * Returns per-member accumulators.
 */
export function runIteration(sim: TeamContext): IterationResult[] {
	const events: SimulationEvent[] = createEvents(sim);
	const periodSec = Math.abs(sim.teamProfile.param.period) * 3600;

	// Main event loop
	let currentSec = 0;
	while (true) {
		const { sec, firedEvents } = findNextEvents(events, currentSec, sim);
		if (sec > periodSec) {
			break;
		}

		for (const event of firedEvents) {
			event.apply(sec, sim);
		}
		currentSec = sec;
	}

	return sim.members.map(({ progress }) => ({
		berryTotalStrength: progress.berryTotalStrength,
		ingCounts: progress.ingCounts,
		skillCount: progress.skillCount,
		skillStrength: progress.skillStrength,
		skillStrength2: progress.skillStrength2,
	}));
}

function createEvents(sim: TeamContext): SimulationEvent[] {
	const { param, dayLengthSec, sleepTimeSec } = sim.teamProfile;
	const periodSec = Math.abs(sim.teamProfile.param.period) * 3600;

	// Initialize events
	const energyEvents: SimulationEvent[] = [
		new SleepRecoverEvent(sleepTimeSec, dayLengthSec),
		new CookEvent(sleepTimeSec, dayLengthSec),
	];

	const tapEvent: SimulationEvent =
		param.tapFrequencyAwake <= AlwaysTap
			? new AlwaysTapEvent()
			: new PeriodicTapEvent(param.tapFrequencyAwake * 60, periodSec);

	return [...energyEvents, tapEvent];
}

/**
 * Find the earliest upcoming event time among the given events and all
 * events scheduled to fire at that time (ties fire together, in array order).
 */
function findNextEvents(
	events: SimulationEvent[],
	currentSec: number,
	sim: TeamContext,
): { sec: number; firedEvents: SimulationEvent[] } {
	let sec = Number.POSITIVE_INFINITY;
	const firedEvents: SimulationEvent[] = [];

	for (const event of events) {
		const t = event.next(currentSec, sim);
		if (t === null) {
			continue;
		}

		if (t < sec) {
			sec = t;
			firedEvents.length = 0;
			firedEvents.push(event);
		} else if (t === sec) {
			firedEvents.push(event);
		}
	}

	return { sec, firedEvents };
}
