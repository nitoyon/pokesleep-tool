/**
 * Shared fixtures for the `src/util/Team/Skill/*.test.ts` suites.
 *
 * This file has no `describe`/`test` of its own, so the vitest runner ignores
 * it; the skill specs import the builders below to construct a minimal team
 * without duplicating ~40 lines of boilerplate each.
 */
import type { MainSkillName } from "../../MainSkill";
import PokemonIv from "../../PokemonIv";
import PokemonStrength, {
	createStrengthParameter,
	type StrengthParameter,
} from "../../PokemonStrength";
import type {
	MemberProfile,
	MemberProgress,
	Skill,
	TeamContext,
	TeamMember,
} from "../Types";

/**
 * Call `skill.initialize` through the wide {@link Skill} signature.
 *
 * Many handlers narrow their `initialize`/`apply` overrides to just the
 * parameters they use (e.g. `initialize(profile)`), which makes a direct
 * `skill.initialize(profile, profiles, param)` a type error when `skill` has
 * the concrete class type. Routing through these helpers keeps the call sites
 * uniform.
 */
export function initSkill(
	skill: Skill,
	profile: MemberProfile,
	profiles: MemberProfile[],
	param: StrengthParameter,
): void {
	skill.initialize(profile, profiles, param);
}

/** Call `skill.apply` through the wide {@link Skill} signature. */
export function applySkill(
	skill: Skill,
	member: TeamMember,
	tapSec: number,
	sim: TeamContext,
): void {
	skill.apply(member, tapSec, sim);
}

/**
 * Build a deterministic rng that yields `values` in order and throws once
 * they run out, so a test that consumes an unexpected number of random draws
 * fails loudly instead of silently falling back to a real random value.
 */
export function createRandomQueue(values: number[]): () => number {
	let i = 0;
	return () => {
		if (i >= values.length) {
			throw new Error("random queue exhausted");
		}
		return values[i++];
	};
}

/** An rng that always returns the same value (handy for single-draw skills). */
export function createConstRng(value: number): () => number {
	return () => value;
}

/** {@link createStrengthParameter} with pity-proc disabled by default. */
export function testParam(
	overrides: Partial<StrengthParameter> = {},
): StrengthParameter {
	return createStrengthParameter({ pityProc: false, ...overrides });
}

/** Create a {@link MemberProgress} with sensible defaults. */
export function createTestProgress(
	overrides: Partial<MemberProgress> = {},
): MemberProgress {
	return {
		energy: 100,
		lastRecoverySec: 0,
		sleeping: false,
		nextHelpSec: -1,
		helpsSinceSkill: 0,
		berryTotalStrength: 0,
		ingCounts: new Map(),
		skillCount: 0,
		skillStockCount: 0,
		skillStrength: 0,
		skillStrength2: 0,
		skillDreamShards: 0,
		pendingEnergy: 0,
		pendingExtraHelp: 0,
		hasMainSkillActivationBonus: false,
		disguiseGreatSuccess: false,
		...overrides,
	};
}

/**
 * Create a {@link MemberProfile} with sensible defaults.
 *
 * `pokemonName` picks the underlying {@link PokemonIv}; `skillName` overrides
 * only the profile's skill identity, so tests can point any Pokémon at any
 * skill handler. Pass `iv` in `overrides` for full control.
 */
export function createTestProfile(
	overrides: Partial<MemberProfile> & {
		pokemonName?: string;
		level?: number;
	} = {},
): MemberProfile {
	const { pokemonName = "Raichu", level = 30, ...rest } = overrides;
	const iv = rest.iv ?? new PokemonIv({ pokemonName, level });
	const bonus =
		rest.bonus ??
		new PokemonStrength(iv, createStrengthParameter({})).bonusEffects;

	return {
		index: 0,
		iv,
		bonus,
		baseFreq: 2200,
		wakeMax: 100,
		sleepRecovery: 0,
		skillRate: 0,
		pityProcHelpCount: 100,
		normalBagUsage: [
			{ name: "berry", count: 2, p: 1, ingSlotIndex: -1, ingKindIndex: -1 },
		],
		extraBagUsage: [
			{ name: "berry", count: 2, p: 1, ingSlotIndex: -1, ingKindIndex: -1 },
		],
		carryLimit: 21,
		berryRawStrength: 10,
		berryStrength: 10,
		berryStrengthWithBonus: 10,
		ingStrengthRate: 1,
		skillName: "Charge Strength S",
		skillLevel: 1,
		energyRecoveryFactor: 1,
		maxSkillCount: 1,
		skill: { initialize() {}, apply() {} },
		...rest,
	};
}

/** Bundle a profile and progress into a {@link TeamMember}. */
export function createTestMember(
	profileOverrides: Partial<MemberProfile> & {
		pokemonName?: string;
		level?: number;
	} = {},
	progressOverrides: Partial<MemberProgress> = {},
): TeamMember {
	return {
		profile: createTestProfile(profileOverrides),
		progress: createTestProgress(progressOverrides),
	};
}

/**
 * Wrap already-built members (or member profiles) in a {@link TeamContext}.
 * Bare profiles are given a fresh default progress.
 */
export function createTestSim(
	membersOrProfiles: (TeamMember | MemberProfile)[],
	paramOverrides: Partial<StrengthParameter> = {},
): TeamContext {
	const members: TeamMember[] = membersOrProfiles.map((m) =>
		"progress" in m ? m : { profile: m, progress: createTestProgress() },
	);
	return {
		members,
		teamProfile: {
			sleepTimeSec: 86400,
			dayLengthSec: 86400,
			param: testParam(paramOverrides),
		},
		teamProgress: { potExtended: 0, extraTastyRate: 0 },
	};
}

/** Convenience: a Mew profile whose Versatile skill is `versatileSkill`. */
export function createMewProfile(
	versatileSkill: MainSkillName,
	overrides: Partial<MemberProfile> = {},
): MemberProfile {
	const iv = new PokemonIv({ pokemonName: "Mew", level: 30, versatileSkill });
	return createTestProfile({ iv, skillName: "Versatile", ...overrides });
}
