import type { IngredientName } from "../../data/pokemons";
import { AlwaysTap } from "../Energy";
import type { StrengthParameter } from "../PokemonStrength";
import { CookEvent } from "./Event/CookEvent";
import { SleepRecoverEvent } from "./Event/SleepRecoverEvent";
import { AlwaysTapEvent, PeriodicTapEvent } from "./Event/TapEvent";
import type {
	IterationResult,
	IterationState,
	MemberProfile,
	SimulationEvent,
	TeamMember,
} from "./Types";

/**
 * Run a single iteration of the team simulation.
 * Returns per-member accumulators.
 */
export function runIteration(
	profiles: MemberProfile[],
	param: StrengthParameter,
	periodSec: number,
	dayLengthSec: number,
	sleepTimeSec: number,
): IterationResult[] {
	// Initialize sim
	const members: TeamMember[] = createTeamMembers(profiles);
	const sim: IterationState = {
		members,
		sleepTimeSec,
		dayLengthSec,
		param,
	};

	// Initialize events
	const energyEvents: SimulationEvent[] = [
		new SleepRecoverEvent(sleepTimeSec, dayLengthSec),
		new CookEvent(sleepTimeSec, dayLengthSec),
	];

	const tapEvent: SimulationEvent =
		param.tapFrequencyAwake <= AlwaysTap
			? new AlwaysTapEvent()
			: new PeriodicTapEvent(param.tapFrequencyAwake * 60, periodSec);

	const events: SimulationEvent[] = [...energyEvents, tapEvent];

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

	return members.map(({ progress }) => ({
		berryTotalStrength: progress.berryTotalStrength,
		ingCounts: progress.ingCounts,
		skillCount: progress.skillCount,
		skillStrength: progress.skillStrength,
		skillStrength2: progress.skillStrength2,
	}));
}

/**
 * Create the initial team member states for a simulation iteration.
 */
function createTeamMembers(profiles: MemberProfile[]): TeamMember[] {
	return profiles.map((profile) => {
		return {
			profile,
			progress: {
				energy: profile.wakeMax,
				lastRecoverySec: 0,
				sleeping: false,
				nextHelpSec: -1, // not yet scheduled
				helpsSinceSkill: 0,
				berryTotalStrength: 0,
				ingCounts: new Map<IngredientName, number>(),
				skillCount: 0,
				skillStrength: 0,
				skillStrength2: 0,
				pendingEnergy: 0,
			},
		};
	});
}

/**
 * Find the earliest upcoming event time among the given events and all
 * events scheduled to fire at that time (ties fire together, in array order).
 */
function findNextEvents(
	events: SimulationEvent[],
	currentSec: number,
	sim: IterationState,
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
