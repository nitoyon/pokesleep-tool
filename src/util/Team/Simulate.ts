import { emptyBonusEffects } from "../../data/events";
import type { IngredientName } from "../../data/pokemons";
import type { PokemonBoxItem } from "../PokemonBox";
import { ingredientStrength } from "../PokemonRp";
import type { IngredientStrength, StrengthParameter } from "../PokemonStrength";
import { buildMemberProfile } from "./MemberProfile";
import { runIteration } from "./SimulateIteration";
import { initializeSkillValue } from "./Skill/SkillInitializer";
import type {
	MemberProfile,
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

interface TeamSimContext {
	profiles: (MemberProfile | null)[];
	activeProfiles: MemberProfile[];
	accumulated: AccumulatedResult[];
}

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

	const periodSec = Math.abs(param.period) * 3600;
	const dayLengthSec = 1440 * 60;
	const sleepMinutes = (param.sleepScore * 510) / 100;
	const sleepTimeSec = (1440 - sleepMinutes) * 60;

	const teamCtx = initializeTeamContext(members, param);
	if (teamCtx.activeProfiles.length === 0) {
		return { total: emptyTotal, members: members.map(() => undefined) };
	}

	runSimulationLoop(
		teamCtx.activeProfiles,
		teamCtx.accumulated,
		param,
		periodSec,
		dayLengthSec,
		sleepTimeSec,
		iterations,
	);

	return buildTeamStrengthResult(members, teamCtx, param, iterations);
}

function initializeTeamContext(
	members: (PokemonBoxItem | undefined)[],
	param: StrengthParameter,
): TeamSimContext {
	const activeMembers = members.filter(
		(m): m is PokemonBoxItem => m !== undefined,
	);
	const helpBonusCount = activeMembers.filter(
		(m) => m.iv.hasHelpingBonusInActiveSubSkills,
	).length;

	const profiles: (MemberProfile | null)[] = members.map((m) => {
		if (!m) return null;
		const profile = buildMemberProfile(m, param, helpBonusCount);
		profile.index = members.indexOf(m);
		return profile;
	});

	const activeProfiles: MemberProfile[] = profiles.filter(
		(c): c is MemberProfile => c !== null,
	);

	const accumulated: AccumulatedResult[] = activeProfiles.map(() => ({
		berryTotalStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillCount: 0,
		skillStrength: 0,
		skillStrength2: 0,
	}));

	return { profiles, activeProfiles, accumulated };
}

function runSimulationLoop(
	activeProfiles: MemberProfile[],
	accumulated: AccumulatedResult[],
	param: StrengthParameter,
	periodSec: number,
	dayLengthSec: number,
	sleepTimeSec: number,
	iterations: number,
): void {
	initializeSkillValue(activeProfiles, param);

	for (let iter = 0; iter < iterations; iter++) {
		const results = runIteration(
			activeProfiles,
			param,
			periodSec,
			dayLengthSec,
			sleepTimeSec,
		);

		for (let j = 0; j < activeProfiles.length; j++) {
			const acc = accumulated[j];
			const result = results[j];

			acc.berryTotalStrength += result.berryTotalStrength;
			acc.skillCount += result.skillCount;
			acc.skillStrength += result.skillStrength;
			acc.skillStrength2 += result.skillStrength2;

			for (const [name, count] of result.ingCounts) {
				acc.ingCounts.set(name, (acc.ingCounts.get(name) ?? 0) + count);
			}
		}
	}
}

function buildTeamStrengthResult(
	members: (PokemonBoxItem | undefined)[],
	{ profiles, activeProfiles, accumulated }: TeamSimContext,
	param: StrengthParameter,
	iterations: number,
): TeamStrengthResult {
	const memberResults = members.map((member, i) => {
		if (!member) return undefined;
		const profile = profiles[i];
		if (!profile) return undefined;

		const acc = accumulated[activeProfiles.indexOf(profile)];
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
