import type { IngredientName } from "../../data/pokemons";
import { AlwaysTap, whistlePeriod } from "../Energy";
import { ingredientStrength } from "../PokemonRp";
import type { IngredientStrength, StrengthParameter } from "../PokemonStrength";
import {
	buildMemberProfiles,
	buildNightCapPikachuProfile,
} from "./MemberProfile";
import { runIteration } from "./SimulateIteration";
import {
	addSkillMetrics,
	avgSkillMetrics,
	zeroSkillMetrics,
} from "./SkillMetrics";
import { createTeamContext, resetTeamContext } from "./TeamContext";
import type {
	IterationResult,
	MemberProfile,
	TeamMemberInput,
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
	members: (TeamMemberInput | undefined)[],
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

	// Night Cap Pikachu alone is not simulated, since events rely on members
	const profiles = buildMemberProfiles(members, param);
	if (profiles.length === 0) {
		return createEmptyTeamStrengthResult(members);
	}
	const nightCapPikachuProfile: MemberProfile | undefined = param.ncp
		? buildNightCapPikachuProfile(param, param.ncpLevel)
		: undefined;

	const sim = createTeamContext(
		isWhistle,
		profiles,
		param,
		nightCapPikachuProfile,
	);
	const accumulated = initializeIterationResult(
		profiles,
		nightCapPikachuProfile,
	);
	for (let iter = 0; iter < iterations; iter++) {
		resetTeamContext(sim);
		const results = runIteration(sim);
		addResultToIterationResult(accumulated, results);
	}

	return {
		members: buildMemberStrengthResult(
			members,
			profiles,
			nightCapPikachuProfile,
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
	members: (TeamMemberInput | undefined)[],
): TeamStrengthResult {
	return { members: members.map(() => undefined) };
}

function initializeIterationResult(
	profiles: MemberProfile[],
	nightCapPikachuProfile?: MemberProfile,
): IterationResult[] {
	if (nightCapPikachuProfile) {
		profiles = [...profiles, nightCapPikachuProfile];
	}
	const accumulated: IterationResult[] = profiles.map(() => ({
		berryStrength: 0,
		bigBerryStrength: 0,
		bigBerryHelpCount: 0,
		bigBerryCount: 0,
		ingCounts: new Map<IngredientName, number>(),
		...zeroSkillMetrics(),
	}));

	return accumulated;
}

function addResultToIterationResult(
	accumulated: IterationResult[],
	results: IterationResult[],
) {
	for (let i = 0; i < results.length; i++) {
		const acc = accumulated[i];
		const result = results[i];

		acc.berryStrength += result.berryStrength;
		acc.bigBerryStrength += result.bigBerryStrength;
		acc.bigBerryHelpCount += result.bigBerryHelpCount;
		acc.bigBerryCount += result.bigBerryCount;
		addSkillMetrics(acc, result);

		for (const [name, count] of result.ingCounts) {
			acc.ingCounts.set(name, (acc.ingCounts.get(name) ?? 0) + count);
		}
	}
}

function buildMemberStrengthResult(
	members: (TeamMemberInput | undefined)[],
	profiles: MemberProfile[],
	nightCapPikachuProfile: MemberProfile | undefined,
	accumulated: IterationResult[],
	param: StrengthParameter,
	iterations: number,
): (TeamMemberStrengthResult | undefined)[] {
	let index = 0;
	const ret = members.map((member) => {
		if (!member) return undefined;
		const i = index++;
		const profile = profiles[i];
		if (!profile) return undefined;
		return buildStrengthResult(profile, accumulated[i], param, iterations);
	});

	if (nightCapPikachuProfile) {
		ret.push(
			buildStrengthResult(
				nightCapPikachuProfile,
				accumulated[index],
				param,
				iterations,
			),
		);
	}
	return ret;
}

function buildStrengthResult(
	profile: MemberProfile,
	acc: IterationResult,
	param: StrengthParameter,
	iterations: number,
): TeamMemberStrengthResult {
	const avgBerryStrength = acc.berryStrength / iterations;
	const avgBigBerryCount = acc.bigBerryCount / iterations;
	const bigBerryStrength = acc.bigBerryStrength / iterations;
	const berryTotalStrength = avgBerryStrength + bigBerryStrength;
	const avgMetrics = avgSkillMetrics(acc, iterations);

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
		(param.totalFlags[0] ? berryTotalStrength : 0) +
		(param.totalFlags[1] ? ingStrength : 0) +
		(param.totalFlags[2] ? avgMetrics.skillStrength : 0);

	return {
		iv: profile.iv,
		bonus: profile.bonus,
		berryStrength: avgBerryStrength,
		bigBerryStrength,
		berryTotalStrength,
		bigBerryHelpCount: acc.bigBerryHelpCount / iterations,
		bigBerryCount: avgBigBerryCount,
		ingStrength,
		ingredients,
		...avgMetrics,
		totalStrength: totalStrength,
	};
}
