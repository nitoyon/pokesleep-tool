import type { IngredientName } from "../../data/pokemons";
import { AlwaysTap, whistlePeriod } from "../Energy";
import type { PokemonBoxItem } from "../PokemonBox";
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

/**
 * Simulate team strength using Monte Carlo simulation.
 *
 * @param members Array of up to 5 team members; undefined entries are empty slots.
 * @param param Strength calculation parameters shared by all members.
 * @param iterations Number of Monte Carlo iterations (default 100).
 * @returns Per-member strength results plus an aggregated team total.
 */
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

	return {
		members: buildMemberStrengthResult(
			members,
			profiles,
			accumulated,
			param,
			iterations,
		),
	};
}

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
	return { members: members.map(() => undefined) };
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
		skillCandy: 0,
		skillBerryZone: 0,
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
		acc.skillCandy += result.skillCandy;
		acc.skillBerryZone += result.skillBerryZone;

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
			skillCandy: acc.skillCandy / iterations,
			skillBerryZone: acc.skillBerryZone / iterations,
			totalStrength: totalStrength,
		};
	});
}
