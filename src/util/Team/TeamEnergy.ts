import { clamp } from "../../util/NumberUtil";
import type { MemberProgress, TeamContext } from "./Types";

/**
 * Add energy to a member by decaying it from lastRecoverySec to timeTo.
 *
 * @param sim - Full iteration state.
 * @param memberIdx - Index of the member to advance.
 * @param timeTo - Target time in seconds to advance to.
 * @param diff - Amount of energy to add (can be negative).
 */
export function addEnergy(
	sim: TeamContext,
	memberIdx: number,
	timeTo: number,
	diff: number,
): void {
	const current = getEnergy(sim, memberIdx, timeTo);
	setEnergy(sim, memberIdx, timeTo, current + diff);
}

/**
 * Get a member's energy by decaying it from lastRecoverySec to timeTo.
 *
 * @param sim - Full iteration state.
 * @param memberIdx - Index of the member to advance.
 * @param timeTo - Target time in seconds to advance to.
 */
export function getEnergy(
	sim: TeamContext,
	memberIdx: number,
	timeTo: number,
): number {
	const progress = sim.members[memberIdx].progress;
	return getEnergyByState(progress, timeTo);
}

/**
 * Get a member's energy by decaying it from lastRecoverySec to timeTo.
 *
 * @param progress - Member simulation progress.
 * @param timeTo - Target time in seconds to advance to.
 */
export function getEnergyByState(
	progress: MemberProgress,
	timeTo: number,
): number {
	if (timeTo < progress.lastRecoverySec) {
		throw new Error(
			`getEnergy called with timeTo ${timeTo} < lastRecoverySec ${progress.lastRecoverySec}`,
		);
	}
	return Math.max(
		0,
		progress.energy - Math.floor((timeTo - progress.lastRecoverySec) / 600),
	);
}

/**
 * Set a member's energy and update their last recovery time.
 *
 * @param sim - Full iteration state.
 * @param memberIdx - Index of the member to advance.
 * @param timeTo - Target time in seconds to advance to.
 * @param energy - New energy value to set (0-150).
 */
export function setEnergy(
	sim: TeamContext,
	memberIdx: number,
	timeTo: number,
	energy: number,
): void {
	const progress = sim.members[memberIdx].progress;
	if (timeTo < progress.lastRecoverySec) {
		throw new Error(
			`setEnergy called with timeTo ${timeTo} < lastRecoverySec ${progress.lastRecoverySec}`,
		);
	}
	progress.energy = clamp(0, energy, 150);
	progress.lastRecoverySec = timeTo;
}

/**
 * Queue an energy diff for a member without applying it immediately.
 * Call applyPendingEnergy to commit all queued diffs at once.
 *
 * @param sim - Full iteration state.
 * @param memberIdx - Index of the member.
 * @param diff - Amount of energy to add (can be negative).
 */
export function addPendingEnergy(
	sim: TeamContext,
	memberIdx: number,
	diff: number,
): void {
	sim.members[memberIdx].progress.pendingEnergy += diff;
}

/**
 * Add energy to a single member, scaled by that member's energy recovery
 * factor. General-purpose helper also used by ChargeEnergySkill,
 * ChargeEnergySMoonlightSkill, and LunarBlessingSkill.
 */
export function addEnergyTo(i: number, diff: number, sim: TeamContext): void {
	addPendingEnergy(sim, i, diff * sim.members[i].profile.energyRecoveryFactor);
}

/**
 * Add energy to every member, each scaled by their own energy recovery
 * factor. General-purpose helper also used by LunarBlessingSkill.
 */
export function addEnergyToAll(diff: number, sim: TeamContext): void {
	for (let i = 0; i < sim.members.length; i++) {
		addEnergyTo(i, diff * sim.members[i].profile.energyRecoveryFactor, sim);
	}
}

/**
 * Apply all pending energy diffs for every member at timeTo,
 * then clear the pending values.
 *
 * @param sim - Full iteration state.
 * @param timeTo - Target time in seconds.
 */
export function applyPendingEnergy(sim: TeamContext, timeTo: number): void {
	for (let i = 0; i < sim.members.length; i++) {
		const progress = sim.members[i].progress;
		if (progress.pendingEnergy === 0) continue;
		const current = getEnergy(sim, i, timeTo);
		setEnergy(sim, i, timeTo, current + progress.pendingEnergy);
		progress.pendingEnergy = 0;
	}
}
