import type { IngredientName } from "../../../data/pokemons";
import { getFrequencyRateByEnergy, NoTap } from "../../Energy";
import { applySkillEffect } from "../SkillEffects";
import { applyPendingEnergy, getEnergyByState } from "../TeamEnergy";
import type {
	IterationState,
	MemberContext,
	MemberSimulationState,
	SimulationEvent,
} from "../Types";

/**
 * AlwaysTap: each tap fires at the next whole-minute boundary after the
 * earliest pending help, so items are collected as soon as possible.
 */
export class AlwaysTapEvent implements SimulationEvent {
	next(_currentSec: number, sim: IterationState): number | null {
		const minHelp = Math.min(...sim.states.map((s) => s.nextHelpSec));
		const tapSec = Math.ceil(minHelp / 60) * 60;
		return tapSec;
	}

	apply(tapSec: number, sim: IterationState): void {
		applyTap(tapSec, sim);
	}
}

/**
 * PeriodicTap: taps fire at fixed intervals (tapFreqSec) throughout the period.
 */
export class PeriodicTapEvent implements SimulationEvent {
	constructor(
		private readonly tapFreqSec: number,
		private readonly periodSec: number,
	) {}

	next(currentSec: number, _sim: IterationState): number | null {
		const tapSec = currentSec + this.tapFreqSec;
		return tapSec > this.periodSec ? null : tapSec;
	}

	apply(tapSec: number, sim: IterationState): void {
		applyTap(tapSec, sim);
	}
}

/**
 * Simulate all helps for all members up to tapSec, then resolve skill triggers
 * at tap time.
 *
 * Energy decay is applied per help. Skill effects (including energy recovery)
 * are applied only after all helps have been processed, at tapSec.
 */
function applyTap(tapSec: number, sim: IterationState): void {
	for (let memberIdx = 0; memberIdx < sim.contexts.length; memberIdx++) {
		applyTapForMember(memberIdx, tapSec, sim);
	}
	applyPendingEnergy(sim, tapSec);
}

function applyTapForMember(
	memberIdx: number,
	tapSec: number,
	sim: IterationState,
): void {
	const ctx = sim.contexts[memberIdx];
	const state = sim.states[memberIdx];
	const { param } = sim;

	// Determine total help count during the tapSec interval
	const helpCount = calculateHelpCount(state, ctx, tapSec);
	if (helpCount === 0) {
		return;
	}

	// Collect item (dropped when NoTap)
	const normalHelpCount = applyHelps(helpCount, ctx, param, state);

	// Skill lottery at tap time
	const skillCount = drawSkillCount(
		param.pityProc,
		state,
		ctx,
		normalHelpCount,
	);

	// Apply skill effects
	state.skillCount += skillCount;
	for (let s = 0; s < skillCount; s++) {
		applySkillEffect(memberIdx, tapSec, sim);
	}
}

/**
 * Calculate help count for a member up to tapSec,
 * updating state.nextHelpSec for each help.
 * @param state Current simulation state for the member.
 * @param ctx Context for the member.
 * @param tapSec Target tap time in seconds.
 * @returns The number of helps.
 */
function calculateHelpCount(
	state: MemberSimulationState,
	ctx: MemberContext,
	tapSec: number,
): number {
	let ret = 0;
	while (state.nextHelpSec <= tapSec) {
		const helpSec = state.nextHelpSec;

		// Schedule next help based on energy at this second
		const energy = getEnergyByState(state, helpSec);
		const freqRate = getFrequencyRateByEnergy(energy);
		state.nextHelpSec = helpSec + ctx.baseFreq * freqRate;
		ret++;
	}
	return ret;
}

/**
 * Collect berries and ingredients for each help, handling sneaky snacking
 * when the carry limit is exhausted.
 * Returns the number of normal (non-sneaky-snacking) helps.
 */
function applyHelps(
	helpCount: number,
	ctx: MemberContext,
	param: IterationState["param"],
	state: MemberSimulationState,
): number {
	let normalHelpCount = 0;
	let carryLimitLeft = ctx.carryLimit;
	if (param.tapFrequencyAwake === NoTap) {
		carryLimitLeft = 0;
	}
	for (let i = 0; i < helpCount; i++) {
		// Sneaky snacking
		if (carryLimitLeft === 0) {
			state.berryTotalStrength +=
				ctx.berryStrengthWithBonus * ctx.iv.berryCount;
			continue;
		}

		// Normal help: draw from bag usage distribution
		normalHelpCount++;
		const rand = Math.random();
		let cumulative = 0;
		let outcome = ctx.bagUsageDetail[0];
		for (const item of ctx.bagUsageDetail) {
			cumulative += item.p;
			if (rand < cumulative) {
				outcome = item;
				break;
			}
		}

		if (outcome.name === "berry") {
			state.berryTotalStrength += ctx.berryStrengthWithBonus * outcome.count;
			carryLimitLeft = Math.max(0, carryLimitLeft - outcome.count);
		} else {
			const ingName = outcome.name as IngredientName;
			const count = Math.min(outcome.count, carryLimitLeft);
			carryLimitLeft -= count;
			state.ingCounts.set(ingName, (state.ingCounts.get(ingName) ?? 0) + count);
		}
	}
	return normalHelpCount;
}

/**
 * Draw the number of skill triggers for k helps using probability
 *
 * Non-specialty: 0 or 1 triggers.
 * Specialty (Skills / All): 0, 1, or 2 triggers.
 */
function drawSkillCount(
	pityProc: boolean,
	state: MemberSimulationState,
	ctx: MemberContext,
	k: number,
): number {
	// No pity proc
	if (!pityProc) {
		const p = ctx.skillRate;
		const noneProb = (1 - p) ** k;
		const r = Math.random();
		if (r < noneProb) return 0;
		if (!ctx.isSkillSpecialty) return 1;
		const onceProb = k * p * (1 - p) ** (k - 1);
		return r < noneProb + onceProb ? 1 : 2;
	}

	// With pity proc
	let skillCount = 0;
	for (let i = 0; i < k; i++) {
		state.helpsSinceSkill++;
		let triggered = false;
		if (state.helpsSinceSkill >= ctx.pityProcHelpCount) {
			triggered = true;
		} else if (Math.random() < ctx.skillRate) {
			triggered = true;
		}
		if (triggered) {
			skillCount++;
			state.helpsSinceSkill = 0;
		}

		if (ctx.isSkillSpecialty && skillCount >= 2) {
			return skillCount;
		}
		if (!ctx.isSkillSpecialty && skillCount >= 1) {
			return skillCount;
		}
	}

	return skillCount;
}
