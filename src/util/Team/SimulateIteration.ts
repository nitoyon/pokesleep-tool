import type { IngredientName } from "../../data/pokemons";
import { AlwaysTap, getFrequencyRateByEnergy } from "../Energy";
import type { StrengthParameter } from "../PokemonStrength";
import { CookEvent } from "./Event/CookEvent";
import { SleepRecoverEvent } from "./Event/SleepRecoverEvent";
import { AlwaysTapEvent, PeriodicTapEvent } from "./Event/TapEvent";
import type {
	IterationResult,
	IterationState,
	MemberContext,
	MemberSimulationState,
	SimulationEvent,
} from "./Types";

/**
 * Run a single iteration of the team simulation.
 * Returns per-member accumulators.
 */
export function runIteration(
	contexts: MemberContext[],
	param: StrengthParameter,
	periodSec: number,
	dayLengthSec: number,
	sleepTimeSec: number,
): IterationResult[] {
	const states: MemberSimulationState[] = contexts.map((ctx) => {
		const energy = ctx.wakeMax;
		return {
			energy,
			lastRecoverySec: 0,
			sleeping: false,
			nextHelpSec: ctx.baseFreq * getFrequencyRateByEnergy(energy),
			helpsSinceSkill: 0,
			berryTotalStrength: 0,
			ingCounts: new Map<IngredientName, number>(),
			skillCount: 0,
			skillStrength: 0,
			skillStrength2: 0,
			pendingEnergy: 0,
		};
	});

	const sim: IterationState = {
		contexts,
		states,
		sleepTimeSec,
		dayLengthSec,
		param,
	};

	// Energy events (sleep/wake and cooking) applied to all members at once.
	// Listed before the tap event so they take priority at equal times.
	const energyEvents: SimulationEvent[] = [
		new SleepRecoverEvent(sleepTimeSec, dayLengthSec),
		new CookEvent(sleepTimeSec, dayLengthSec),
	];

	// Choose tap strategy (NoTap uses AlwaysTap timing; items are dropped inside apply)
	const tapEvent: SimulationEvent =
		param.tapFrequencyAwake <= AlwaysTap
			? new AlwaysTapEvent()
			: new PeriodicTapEvent(param.tapFrequencyAwake * 60, periodSec);

	const events: SimulationEvent[] = [...energyEvents, tapEvent];

	// Main event loop: always fire the earliest upcoming event.
	// When multiple events share the same time, all fire in array order
	// (energy events before the tap event).
	let currentSec = 0;
	while (true) {
		let minSec = Number.POSITIVE_INFINITY;
		const toFire: SimulationEvent[] = [];

		for (const event of events) {
			const t = event.next(currentSec, sim);
			if (t === null) continue;
			if (t < minSec) {
				minSec = t;
				toFire.length = 0;
				toFire.push(event);
			} else if (t === minSec) {
				toFire.push(event);
			}
		}

		if (minSec > periodSec) break;

		for (const event of toFire) {
			event.apply(minSec, sim);
		}
		currentSec = minSec;
	}

	return states.map((s) => ({
		berryTotalStrength: s.berryTotalStrength,
		ingCounts: s.ingCounts,
		skillCount: s.skillCount,
		skillStrength: s.skillStrength,
		skillStrength2: s.skillStrength2,
	}));
}
