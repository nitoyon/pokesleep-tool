import type { IngredientName } from "../../data/pokemons";
import type { MainSkillName } from "../../util/MainSkill";
import type PokemonIv from "../PokemonIv";
import type { BagUsagePerHelpDetailItem } from "../PokemonIv";
import type {
	BonusEffectsWithReason,
	IngredientStrength,
	StrengthParameter,
} from "../PokemonStrength";

/**
 * Common interface for all simulation events (tap events and energy events).
 * Both next() and apply() receive the full IterationState so events can read
 * or mutate any member's progress.
 */
export interface SimulationEvent {
	/** Returns the next event time in seconds after currentSec, or null if none. */
	next(currentSec: number, sim: IterationState): number | null;
	/** Apply the event effect at the given second. */
	apply(sec: number, sim: IterationState): void;
}

/**
 * Bundles a member's immutable profile with its mutable simulation progress.
 */
export interface TeamMember {
	/** Pre-built per-member profile (same order as the active members array). */
	readonly profile: MemberProfile;
	/** Mutable per-member simulation accumulators, updated in place. */
	progress: MemberProgress;
}

/**
 * Immutable bundle of per-iteration inputs threaded through simulateHelps and
 * advanceEnergy so they don't have to be passed individually.
 */
export interface IterationState {
	/** Per-member profile and progress bundles (same order as the active members array). */
	members: TeamMember[];
	/** Time within a day at which the team falls asleep, in seconds. */
	sleepTimeSec: number;
	/** Total day length in seconds (86400). */
	dayLengthSec: number;
	/** Strength calculation parameters shared by all members. */
	param: StrengthParameter;
}

/**
 * Strength calculation result for a single team member (or the whole team
 * when used as the `total` field of {@link TeamStrengthResult}).
 */
export interface TeamMemberStrengthResult {
	bonus: BonusEffectsWithReason;

	/** Berry strength per help, without field bonus. */
	berryRawStrength: number;
	/** Berry strength per help, including field bonus. */
	berryStrength: number;
	/** Total berry strength over the period (averaged across iterations). */
	berryTotalStrength: number;

	/** Total ingredient strength over the period. */
	ingStrength: number;
	/** Per-ingredient breakdown of counts and strengths. */
	ingredients: IngredientStrength[];

	/** Average number of skill triggers over the period. */
	skillCount: number;
	/** Strength contribution from primary skill effects (e.g. Charge Strength). */
	skillStrength: number;
	/** Strength contribution from secondary skill effects (e.g. Helper Boost). */
	skillStrength2: number;

	/** Strength contribution from Helping Bonus sub-skill (currently unused). */
	helpingBonusStrength: number;
	/** Combined total strength over the period, filtered by totalFlags. */
	totalStrength: number;
}

/**
 * Top-level result of {@link simulateTeam}: per-member results plus an
 * aggregated total across all active members.
 */
export interface TeamStrengthResult {
	/** Aggregated totals across all active team members. */
	total: TeamMemberStrengthResult;
	/** Per-slot results; undefined for empty slots. */
	members: (TeamMemberStrengthResult | undefined)[];
}

/**
 * Internal type for per-member simulation profile.
 */
export interface MemberProfile {
	/** index into members[] */
	index: number;
	iv: PokemonIv;
	bonus: BonusEffectsWithReason;
	baseFreq: number;
	wakeMax: 100 | 105;
	sleepRecovery: number;
	skillRate: number;
	pityProcHelpCount: number;
	bagUsageDetail: BagUsagePerHelpDetailItem[];
	carryLimit: number;
	berryRawStrength: number;
	/** berry strength including field bonus */
	berryStrength: number;
	/** berry strength including field bonus and favorite berry bonus */
	berryStrengthWithBonus: number;
	/** ingredient strength rate */
	ingStrengthRate: number;
	/** skill name */
	skillName: MainSkillName;
	/** skill level */
	skillLevel: number;
	/** nature energy recovery factor */
	energyRecoveryFactor: number;
	/** true if specialty is Skills or All (enables 0/1/2 skill trigger split) */
	isSkillSpecialty: boolean;
	/** Pre-computed per-trigger skill strength for self. */
	skillValue: number;
	/** Pre-computed per-trigger skill strength applied to all members (e.g. Helper Boost). */
	skillValue2: number;
}

/**
 * Internal type for per-member simulation progress that gets updated during the simulation loop.
 */
export interface MemberProgress {
	/** Current energy level (0–150). */
	energy: number;
	/** Absolute time (seconds) of the last energy recovery. */
	lastRecoverySec: number;
	/** Whether the member is currently sleeping. */
	sleeping: boolean;
	/**
	 * Absolute time (seconds) when the next help will complete.
	 * -1 is a sentinel meaning "not yet scheduled"; it is computed lazily
	 * from energy at time 0 the first time help count is calculated.
	 */
	nextHelpSec: number;
	/** Number of helps since the last skill trigger (used for pity-proc logic). */
	helpsSinceSkill: number;
	/** Accumulated berry strength over the iteration so far. */
	berryTotalStrength: number;
	/** Accumulated ingredient counts by name over the iteration so far. */
	ingCounts: Map<IngredientName, number>;
	/** Number of skill triggers accumulated this iteration. */
	skillCount: number;
	/** Accumulated primary skill strength this iteration. */
	skillStrength: number;
	/** Accumulated secondary skill strength this iteration. */
	skillStrength2: number;
	/** Pending energy amount queued by addPendingEnergy, applied atomically by applyPendingEnergy. */
	pendingEnergy: number;
}

/**
 * Per-member result returned by a single iteration of the simulation.
 * Contains only the accumulated output fields, not the internal simulation state.
 */
export interface IterationResult {
	berryTotalStrength: number;
	ingCounts: Map<IngredientName, number>;
	skillCount: number;
	skillStrength: number;
	skillStrength2: number;
}
