import { CookEvent } from "./Event/CookEvent";
import { SleepRecoverEvent } from "./Event/SleepRecoverEvent";
import { PhaseAwareTapEvent } from "./Event/TapEvent";
import { applyPendingExtraHelp } from "./Help/PendingExtraHelp";
import { pickSkillMetrics } from "./SkillMetrics";
import type { IterationResult, SimulationEvent, TeamContext } from "./Types";

/**
 * Run a single iteration of the team simulation.
 * Returns per-member accumulators.
 */
export function runIteration(sim: TeamContext): IterationResult[] {
	if (sim.teamProfile.param.period < 0) {
		// help count
		const helpCount = -sim.teamProfile.param.period;
		for (const member of sim.members) {
			member.progress.pendingExtraHelp = helpCount;
		}
		applyPendingExtraHelp(sim);
	} else {
		// initialize event
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
	}

	return sim.members.map(({ progress }) => ({
		berryStrength: progress.berryStrength,
		bigBerryHelpCount: progress.bigBerryHelpCount,
		bigBerryCount: progress.bigBerryCount,
		ingCounts: progress.ingCounts,
		...pickSkillMetrics(progress),
	}));
}

function createEvents(sim: TeamContext): SimulationEvent[] {
	const { param, dayLengthSec, sleepTimeSec } = sim.teamProfile;
	const periodSec = Math.abs(sim.teamProfile.param.period) * 3600;

	// Initialize events
	const energyEvents: SimulationEvent[] = [
		new SleepRecoverEvent(sleepTimeSec, dayLengthSec, periodSec),
		new CookEvent(sleepTimeSec, dayLengthSec),
	];

	const tapEvent: SimulationEvent = new PhaseAwareTapEvent(
		param.tapFrequencyAwake,
		param.tapFrequencyAsleep,
		sleepTimeSec,
		dayLengthSec,
		periodSec,
	);

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
