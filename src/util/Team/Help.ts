import type { IngredientName } from "../../data/pokemons";
import { getFrequencyRateByEnergy, NoTap } from "../Energy";
import type { StrengthParameter } from "../PokemonStrength";
import { applySkillEffect } from "./Skill/SkillApplier";
import { applyPendingEnergy, getEnergyByState } from "./TeamEnergy";
import type {
	IterationState,
	MemberProfile,
	MemberProgress,
	TeamMember,
} from "./Types";

/**
 * Simulate all helps for all members up to tapSec, then resolve skill triggers
 * at tap time.
 *
 * Energy decay is applied per help. Skill effects (including energy recovery)
 * are applied only after all helps have been processed, at tapSec.
 */
export function applyHelp(
	tapSec: number,
	sim: IterationState,
	rng: () => number = Math.random,
): void {
	for (const member of sim.members) {
		applyHelpForMember(member, sim.param, tapSec, sim, rng);
	}
	applyPendingEnergy(sim, tapSec);
}

function applyHelpForMember(
	member: TeamMember,
	param: StrengthParameter,
	tapSec: number,
	sim: IterationState,
	rng: () => number,
): void {
	const { profile, progress } = member;

	// Determine total help count during the tapSec interval
	const helpCount = calculateHelpCount(progress, profile, tapSec);
	if (helpCount === 0) {
		return;
	}

	// Gather berries and ingredients
	const normalHelpCount = applySpecificHelpCount(
		helpCount,
		profile,
		progress,
		param,
		rng,
	);

	// Skill lottery at tap time
	const skillCount = drawSkillCount(
		param.pityProc,
		progress,
		profile,
		normalHelpCount,
		rng,
	);

	// Apply skill effects
	progress.skillCount += skillCount;
	for (let s = 0; s < skillCount; s++) {
		applySkillEffect(member, tapSec, sim);
	}
}

/**
 * Calculate help count for a member up to tapSec,
 * updating progress.nextHelpSec for each help.
 * @param progress Current simulation progress for the member.
 * @param profile Profile for the member.
 * @param tapSec Target tap time in seconds.
 * @returns The number of helps.
 */
function calculateHelpCount(
	progress: MemberProgress,
	profile: MemberProfile,
	tapSec: number,
): number {
	// -1 is a sentinel meaning "not yet scheduled"; compute the first help
	// time from energy at time 0.
	if (progress.nextHelpSec === -1) {
		scheduleNextHelp(progress, profile, 0);
	}

	let ret = 0;
	while (progress.nextHelpSec <= tapSec) {
		const helpSec = progress.nextHelpSec;
		scheduleNextHelp(progress, profile, helpSec);
		ret++;
	}
	return ret;
}

/**
 * Schedule a member's next help time based on their energy at the given
 * second.
 * @param progress Current simulation progress for the member.
 * @param profile Profile for the member.
 * @param sec The second at which to evaluate energy and schedule from.
 */
function scheduleNextHelp(
	progress: MemberProgress,
	profile: MemberProfile,
	sec: number,
): void {
	const energy = getEnergyByState(progress, sec);
	const freqRate = getFrequencyRateByEnergy(energy);
	progress.nextHelpSec = sec + profile.baseFreq * freqRate;
}

/**
 * Collect berries and ingredients for each help, handling sneaky snacking
 * when the carry limit is exhausted.
 * Returns the number of normal (non-sneaky-snacking) helps.
 */
function applySpecificHelpCount(
	helpCount: number,
	profile: MemberProfile,
	progress: MemberProgress,
	param: StrengthParameter,
	rng: () => number,
): number {
	let normalHelpCount = 0;
	let carryLimitLeft = profile.carryLimit;
	if (param.tapFrequencyAwake === NoTap) {
		carryLimitLeft = 0;
	}
	for (let i = 0; i < helpCount; i++) {
		const result = applySingleHelp(profile, progress, carryLimitLeft, rng);
		carryLimitLeft = result.carryLimitLeft;
		if (result.isNormalHelp) {
			normalHelpCount++;
		}
	}
	return normalHelpCount;
}

/**
 * Apply a single help: sneaky snacking if the carry limit is exhausted,
 * otherwise draw an outcome from the bag usage distribution and apply the
 * resulting berry or ingredient to progress.
 * @param profile Profile for the member.
 * @param progress Current simulation progress for the member.
 * @param carryLimitLeft Remaining carry limit before this help.
 * @returns The updated carryLimitLeft and whether this was a normal
 * (non-sneaky-snacking) help.
 */
function applySingleHelp(
	profile: MemberProfile,
	progress: MemberProgress,
	carryLimitLeft: number,
	rng: () => number,
): { carryLimitLeft: number; isNormalHelp: boolean } {
	// Sneaky snacking
	if (carryLimitLeft === 0) {
		progress.berryTotalStrength +=
			profile.berryStrengthWithBonus * profile.iv.berryCount;
		return { carryLimitLeft, isNormalHelp: false };
	}

	// Normal help: draw from bag usage distribution
	const rand = rng();
	let cumulative = 0;
	let outcome = profile.bagUsageDetail[0];
	for (const item of profile.bagUsageDetail) {
		cumulative += item.p;
		if (rand < cumulative) {
			outcome = item;
			break;
		}
	}

	if (outcome.name === "berry") {
		progress.berryTotalStrength +=
			profile.berryStrengthWithBonus * outcome.count;
		carryLimitLeft = Math.max(0, carryLimitLeft - outcome.count);
	} else {
		const ingName = outcome.name as IngredientName;
		const count = Math.min(outcome.count, carryLimitLeft);
		carryLimitLeft -= count;
		progress.ingCounts.set(
			ingName,
			(progress.ingCounts.get(ingName) ?? 0) + count,
		);
	}
	return { carryLimitLeft, isNormalHelp: true };
}

/**
 * Draw the number of skill triggers for k helps using probability
 *
 * Non-specialty: 0 or 1 triggers.
 * Specialty (Skills / All): 0, 1, or 2 triggers.
 */
function drawSkillCount(
	pityProc: boolean,
	progress: MemberProgress,
	profile: MemberProfile,
	helpCount: number,
	rng: () => number,
): number {
	// No pity proc
	if (!pityProc) {
		const p = profile.skillRate;
		const noneProb = (1 - p) ** helpCount;
		const r = rng();
		if (r < noneProb) return 0;
		if (!profile.isSkillSpecialty) return 1;
		const onceProb = helpCount * p * (1 - p) ** (helpCount - 1);
		return r < noneProb + onceProb ? 1 : 2;
	}

	// With pity proc
	let skillCount = 0;
	for (let i = 0; i < helpCount; i++) {
		progress.helpsSinceSkill++;
		let triggered = false;
		if (progress.helpsSinceSkill >= profile.pityProcHelpCount) {
			triggered = true;
		} else if (rng() < profile.skillRate) {
			triggered = true;
		}
		if (triggered) {
			skillCount++;
			progress.helpsSinceSkill = 0;
		}

		if (profile.isSkillSpecialty && skillCount >= 2) {
			return skillCount;
		}
		if (!profile.isSkillSpecialty && skillCount >= 1) {
			return skillCount;
		}
	}

	return skillCount;
}
