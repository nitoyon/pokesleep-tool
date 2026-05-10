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
	next(currentSec: number, sim: TeamContext): number | null;
	/** Apply the event effect at the given second. */
	apply(sec: number, sim: TeamContext): void;
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
 * Simulation state.
 */
export interface TeamContext {
	/** Per-member profile and progress bundles (same order as the active members array). */
	readonly members: TeamMember[];
	/** Immutable team-level configuration. */
	readonly teamProfile: TeamProfile;
	/** Mutable team-level simulation state, updated in place. */
	teamProgress: TeamProgress;
}

/**
 * Immutable team-level configuration (analogous to MemberProfile).
 */
export interface TeamProfile {
	/** Time within a day at which the team falls asleep, in seconds. */
	readonly sleepTimeSec: number;
	/** Total day length in seconds (86400). */
	readonly dayLengthSec: number;
	/** Strength calculation parameters shared by all members. */
	readonly param: StrengthParameter;
}

/**
 * Mutable team-level simulation state, updated in place during the simulation loop
 */
export interface TeamProgress {
	/** Extended pot size */
	potExtended: number;
	/** Accumulated Extra Tasty rate bonus (percentage points) */
	extraTastyRate: number;
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
 * Common interface for all per-skill-family handlers, mirroring the
 * SimulationEvent pattern used in src/util/Team/Event/*.ts.
 *
 * Some skills only participate in one phase (e.g. Helper Boost only
 * computes its skillValue in initialize() but has no apply() effect, while
 * Charge Energy S only has an apply() effect and never sets skillValue in
 * initialize()). Implementations that don't need a phase simply omit it by
 * extending BaseSkill (see src/util/Team/Skill/BaseSkill.ts), which supplies
 * a no-op default.
 */
export interface Skill {
	/**
	 * Called once per member before the iteration loop starts, to
	 * pre-compute this skill instance's skillValue / skillValue2 fields.
	 */
	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void;

	/**
	 * Called each time the skill triggers, to apply its effect to the
	 * member's progress and/or the rest of the team via sim.
	 */
	apply(member: TeamMember, tapSec: number, sim: TeamContext): void;

	/**
	 * Swap the handler's RNG source. Implemented by {@link BaseSkill}; optional
	 * here so bare test stubs ({@code { initialize() {}, apply() {} }}) still
	 * satisfy the interface.
	 */
	setRng?(rng: () => number): void;
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
	normalBagUsage: BagUsagePerHelpDetailItem[];
	extraBagUsage: BagUsagePerHelpDetailItem[];
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
	/** Max skill count (2 if specialty is Skills or All) */
	maxSkillCount: 1 | 2;
	/** Per-family skill handler instance, holding any pre-computed per-trigger skill state. */
	skill: Skill;
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
	/** Number of skills currently stocked (0, 1, or 2). */
	skillStockCount: 0 | 1 | 2;
	/** Accumulated primary skill strength in this iteration. */
	skillStrength: number;
	/** Accumulated secondary skill strength in this iteration. */
	skillStrength2: number;
	/** Accumulated Dream Shards in this iteration. */
	skillDreamShards: number;
	/** Pending energy amount queued by addPendingEnergy, applied atomically by applyPendingEnergy. */
	pendingEnergy: number;
	/** Pending help by Extra Helpful, Helper Boost and Heal Pulse */
	pendingExtraHelp: number;
	/** Wheather main skill activation bonus is granted */
	hasMainSkillActivationBonus: boolean;
	/**
	 * Whether Berry Burst (Disguise) has already scored a Great Success on the
	 * current day. Disguise can Great Success at most once per day, so this is
	 * checked in the skill's apply() and reset each morning on wake-up.
	 */
	disguiseGreatSuccess: boolean;
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
