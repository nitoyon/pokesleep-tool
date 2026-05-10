import { emptyBonusEffects } from "../../data/events";
import type { IngredientName } from "../../data/pokemons";
import type { PokemonBoxItem } from "../PokemonBox";
import { ingredientStrength } from "../PokemonRp";
import type { IngredientStrength, StrengthParameter } from "../PokemonStrength";
import { buildMemberProfiles } from "./MemberProfile";
import { runIteration } from "./SimulateIteration";
import { createTeamContext } from "./TeamContext";
import type {
	IterationResult,
	MemberProfile,
	TeamContext,
	TeamMemberStrengthResult,
	TeamStrengthResult,
} from "./Types";

const emptyTotal: TeamMemberStrengthResult = {
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
	skillStrength2: 0,
	helpingBonusStrength: 0,
	totalStrength: 0,
};

type AccumulatedResult = {
	berryTotalStrength: number;
	ingCounts: Map<IngredientName, number>;
	skillCount: number;
	skillStrength: number;
	skillStrength2: number;
};

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
	iterations = 100,
): TeamStrengthResult {
	if (param.period <= 0) {
		return { total: emptyTotal, members: members.map(() => undefined) };
	}

	const profiles = buildMemberProfiles(members, param);
	if (profiles.length === 0) {
		return { total: emptyTotal, members: members.map(() => undefined) };
	}
	const sim = createTeamContext(profiles, param);

	const accumulated = initializeAccumulatedResult(profiles);
	for (let iter = 0; iter < iterations; iter++) {
		const results = runIteration(sim);
		addResultToAccumulatedResult(sim, accumulated, results);
	}

	return buildTeamStrengthResult(
		members,
		profiles,
		accumulated,
		param,
		iterations,
	);
}

function initializeAccumulatedResult(
	profiles: MemberProfile[],
): AccumulatedResult[] {
	const accumulated: AccumulatedResult[] = profiles.map(() => ({
		berryTotalStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillCount: 0,
		skillStrength: 0,
		skillStrength2: 0,
	}));

	return accumulated;
}

function addResultToAccumulatedResult(
	sim: TeamContext,
	accumulated: AccumulatedResult[],
	results: IterationResult[],
) {
	for (let i = 0; i < sim.members.length; i++) {
		const acc = accumulated[i];
		const result = results[i];

		acc.berryTotalStrength += result.berryTotalStrength;
		acc.skillCount += result.skillCount;
		acc.skillStrength += result.skillStrength;
		acc.skillStrength2 += result.skillStrength2;

		for (const [name, count] of result.ingCounts) {
			acc.ingCounts.set(name, (acc.ingCounts.get(name) ?? 0) + count);
		}
	}
}

function buildTeamStrengthResult(
	members: (PokemonBoxItem | undefined)[],
	profiles: MemberProfile[],
	accumulated: AccumulatedResult[],
	param: StrengthParameter,
	iterations: number,
): TeamStrengthResult {
	const memberResults = members.map((member, i) => {
		if (!member) return undefined;
		const profile = profiles.find((p) => p.index === i);
		if (!profile) return undefined;

		const acc = accumulated[profiles.indexOf(profile)];
		const avgBerryTotalStrength = acc.berryTotalStrength / iterations;
		const avgSkillCount = acc.skillCount / iterations;
		const avgSkillStrength = acc.skillStrength / iterations;
		const avgSkillStrength2 = acc.skillStrength2 / iterations;

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
			(param.totalFlags[2] ? avgSkillStrength + avgSkillStrength2 : 0);

		return {
			bonus: profile.bonus,
			berryRawStrength: profile.berryRawStrength,
			berryStrength: profile.berryStrength,
			berryTotalStrength: avgBerryTotalStrength,
			ingStrength,
			ingredients,
			skillCount: avgSkillCount,
			skillStrength: avgSkillStrength,
			skillStrength2: avgSkillStrength2,
			helpingBonusStrength: 0,
			totalStrength: totalStrength,
		};
	});

	const validMembers = memberResults.filter(
		(r): r is TeamMemberStrengthResult => r !== undefined,
	);

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
		skillStrength2: validMembers.reduce((s, m) => s + m.skillStrength2, 0),
		helpingBonusStrength: validMembers.reduce(
			(s, m) => s + m.helpingBonusStrength,
			0,
		),
		totalStrength: validMembers.reduce((s, m) => s + m.totalStrength, 0),
	};

	return { total, members: memberResults };
}
