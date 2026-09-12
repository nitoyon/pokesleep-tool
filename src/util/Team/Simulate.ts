import { emptyBonusEffects } from "../../data/events";
import type { IngredientName } from "../../data/pokemons";
import { AlwaysTap, whistlePeriod } from "../Energy";
import type { PokemonBoxItem } from "../PokemonBox";
import PokemonIv from "../PokemonIv";
import { ingredientStrength } from "../PokemonRp";
import type { IngredientStrength, StrengthParameter } from "../PokemonStrength";
import { buildMemberProfiles } from "./MemberProfile";
import { runIteration } from "./SimulateIteration";
import { createTeamContext, resetTeamContext } from "./TeamContext";
import type {
	IterationResult,
	MemberProfile,
	TeamContext,
	TeamMemberStrengthResult,
	TeamStrengthResult,
} from "./Types";

const emptyTotal: TeamMemberStrengthResult = {
	iv: new PokemonIv({ pokemonName: "Bulbasaur" }),
	bonus: {
		...emptyBonusEffects,
		skillTriggerReason: "none",
		skillLevelReason: "none",
		ingredientReason: "none",
	},
	berryRawStrength: 0,
	berryStrength: 0,
	berryTotalStrength: 0,
	ingStrength: 0,
	ingredients: [],
	skillCount: 0,
	skillStrength: 0,
	skillExtraHelp: 0,
	skillHelperBoost: 0,
	skillEnergizingCheer: 0,
	skillEnergyForEveryone: 0,
	skillDreamShards: 0,
	skillPotExtended: 0,
	skillExtraTastyRate: 0,
	totalStrength: 0,
};

/**
 * Simulate team strength using Monte Carlo simulation.
 *
 * @param members Array of up to 5 team members; undefined entries are empty slots.
 * @param param Strength calculation parameters shared by all members.
 * @param iterations Number of Monte Carlo iterations (default 100).
 * @returns Per-member strength results plus an aggregated team total.
 */
/**
 * Build the placeholder result used when there is nothing to simulate
 * (zero-length period, or no active members), and as the initial value
 * shown while a background simulation is still in progress.
 * @param members Array of up to 5 team members; undefined entries are empty slots.
 * @returns A result with an empty total and no per-member results.
 */
export function createEmptyTeamStrengthResult(
	members: (PokemonBoxItem | undefined)[],
): TeamStrengthResult {
	return { total: emptyTotal, members: members.map(() => undefined) };
}

export function simulateTeam(
	members: (PokemonBoxItem | undefined)[],
	param: StrengthParameter,
	iterations = 3000,
): TeamStrengthResult {
	const isWhistle = param.period === whistlePeriod;
	if (isWhistle) {
		param = {
			...param,
			period: 3,
			isEnergyAlwaysFull: true,
			isGoodCampTicketSet: false,
			tapFrequencyAwake: AlwaysTap,
			tapFrequencyAsleep: AlwaysTap,
		};
	}

	const profiles = buildMemberProfiles(members, param);
	if (profiles.length === 0) {
		return createEmptyTeamStrengthResult(members);
	}
	const sim = createTeamContext(isWhistle, profiles, param);
	const accumulated = initializeIterationResult(profiles);
	for (let iter = 0; iter < iterations; iter++) {
		resetTeamContext(sim);
		const results = runIteration(sim);
		addResultToIterationResult(sim, accumulated, results);
	}

	return buildTeamStrengthResult(
		members,
		profiles,
		accumulated,
		param,
		iterations,
	);
}

function initializeIterationResult(
	profiles: MemberProfile[],
): IterationResult[] {
	const accumulated: IterationResult[] = profiles.map(() => ({
		berryTotalStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillCount: 0,
		skillStrength: 0,
		skillExtraHelp: 0,
		skillHelperBoost: 0,
		skillEnergizingCheer: 0,
		skillEnergyForEveryone: 0,
		skillDreamShards: 0,
		skillPotExtended: 0,
		skillExtraTastyRate: 0,
	}));

	return accumulated;
}

function addResultToIterationResult(
	sim: TeamContext,
	accumulated: IterationResult[],
	results: IterationResult[],
) {
	for (let i = 0; i < sim.members.length; i++) {
		const acc = accumulated[i];
		const result = results[i];

		acc.berryTotalStrength += result.berryTotalStrength;
		acc.skillCount += result.skillCount;
		acc.skillStrength += result.skillStrength;
		acc.skillEnergizingCheer += result.skillEnergizingCheer;
		acc.skillEnergyForEveryone += result.skillEnergyForEveryone;
		acc.skillExtraHelp += result.skillExtraHelp;
		acc.skillHelperBoost += result.skillHelperBoost;
		acc.skillDreamShards += result.skillDreamShards;
		acc.skillPotExtended += result.skillPotExtended;
		acc.skillExtraTastyRate += result.skillExtraTastyRate;

		for (const [name, count] of result.ingCounts) {
			acc.ingCounts.set(name, (acc.ingCounts.get(name) ?? 0) + count);
		}
	}
}

function buildMemberStrengthResult(
	members: (PokemonBoxItem | undefined)[],
	profiles: MemberProfile[],
	accumulated: IterationResult[],
	param: StrengthParameter,
	iterations: number,
): (TeamMemberStrengthResult | undefined)[] {
	let index = 0;
	return members.map((member) => {
		if (!member) return undefined;
		const profile = profiles[index++];
		if (!profile) return undefined;

		const acc = accumulated[profiles.indexOf(profile)];
		const avgBerryTotalStrength = acc.berryTotalStrength / iterations;
		const avgSkillStrength = acc.skillStrength / iterations;

		const ingredients: IngredientStrength[] = Array.from(
			acc.ingCounts.entries(),
		).map(([name, totalCount]) => {
			const count = totalCount / iterations;
			return {
				name,
				count,
				strength: count * ingredientStrength[name] * profile.ingStrengthRate,
				overflowCount: 0,
				helpCount: 0,
				countPerHelp: 0,
				slots: [],
			};
		});

		const ingStrength = ingredients.reduce((p, c) => p + c.strength, 0);

		const totalStrength =
			(param.totalFlags[0] ? avgBerryTotalStrength : 0) +
			(param.totalFlags[1] ? ingStrength : 0) +
			(param.totalFlags[2] ? avgSkillStrength : 0);

		return {
			iv: profile.iv,
			bonus: profile.bonus,
			berryRawStrength: profile.berryRawStrength,
			berryStrength: profile.berryStrength,
			berryTotalStrength: avgBerryTotalStrength,
			ingStrength,
			ingredients,
			skillCount: acc.skillCount / iterations,
			skillStrength: avgSkillStrength,
			skillExtraHelp: acc.skillExtraHelp / iterations,
			skillHelperBoost: acc.skillHelperBoost / iterations,
			skillEnergizingCheer: acc.skillEnergizingCheer / iterations,
			skillEnergyForEveryone: acc.skillEnergyForEveryone / iterations,
			skillDreamShards: acc.skillDreamShards / iterations,
			skillPotExtended: acc.skillPotExtended / iterations,
			skillExtraTastyRate: acc.skillExtraTastyRate / iterations,
			totalStrength: totalStrength,
		};
	});
}

function buildTeamStrengthResult(
	members: (PokemonBoxItem | undefined)[],
	profiles: MemberProfile[],
	accumulated: IterationResult[],
	param: StrengthParameter,
	iterations: number,
): TeamStrengthResult {
	const memberResults = buildMemberStrengthResult(
		members,
		profiles,
		accumulated,
		param,
		iterations,
	);
	const validMembers = memberResults.filter((r) => r !== undefined);

	// Merge ingredients by name
	const totalIngMap = new Map<string, IngredientStrength>();
	for (const m of validMembers) {
		for (const ing of m.ingredients) {
			const existing = totalIngMap.get(ing.name);
			if (existing) {
				existing.count += ing.count;
				existing.strength += ing.strength;
			} else {
				totalIngMap.set(ing.name, {
					name: ing.name,
					count: ing.count,
					strength: ing.strength,
					overflowCount: 0,
					helpCount: 0,
					countPerHelp: 0,
					slots: [],
				});
			}
		}
	}

	const total: TeamMemberStrengthResult = {
		iv: new PokemonIv({ pokemonName: "Bulbasaur" }),
		bonus: {
			...emptyBonusEffects,
			skillTriggerReason: "none",
			skillLevelReason: "none",
			ingredientReason: "none",
		},
		berryRawStrength: validMembers.reduce((s, m) => s + m.berryRawStrength, 0),
		berryStrength: validMembers.reduce((s, m) => s + m.berryStrength, 0),
		berryTotalStrength: validMembers.reduce(
			(s, m) => s + m.berryTotalStrength,
			0,
		),
		ingStrength: validMembers.reduce((s, m) => s + m.ingStrength, 0),
		ingredients: Array.from(totalIngMap.values()),
		skillCount: validMembers.reduce((s, m) => s + m.skillCount, 0),
		skillStrength: validMembers.reduce((s, m) => s + m.skillStrength, 0),
		skillExtraHelp: validMembers.reduce((s, m) => s + m.skillExtraHelp, 0),
		skillHelperBoost: validMembers.reduce((s, m) => s + m.skillHelperBoost, 0),
		skillEnergizingCheer: validMembers.reduce(
			(s, m) => s + m.skillEnergizingCheer,
			0,
		),
		skillEnergyForEveryone: validMembers.reduce(
			(s, m) => s + m.skillEnergyForEveryone,
			0,
		),
		skillDreamShards: validMembers.reduce((s, m) => s + m.skillDreamShards, 0),
		skillPotExtended: validMembers.reduce((s, m) => s + m.skillPotExtended, 0),
		skillExtraTastyRate: validMembers.reduce(
			(s, m) => s + m.skillExtraTastyRate,
			0,
		),
		totalStrength: validMembers.reduce((s, m) => s + m.totalStrength, 0),
	};

	return { total, members: memberResults };
}
