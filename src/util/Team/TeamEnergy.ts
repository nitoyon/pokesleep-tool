import { clamp } from "../../util/NumberUtil";
import type { IterationState, MemberSimulationState } from "./Types";

/**
 * Add energy to a member by decaying it from lastRecoverySec to timeTo.
 *
 * @param sim - Full iteration state.
 * @param memberIdx - Index of the member to advance.
 * @param timeTo - Target time in seconds to advance to.
 * @param diff - Amount of energy to add (can be negative).
 */
export function addEnergy(
	sim: IterationState,
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
	sim: IterationState,
	memberIdx: number,
	timeTo: number,
): number {
	const state = sim.states[memberIdx];
	return getEnergyByState(state, timeTo);
}

/**
 * Get a member's energy by decaying it from lastRecoverySec to timeTo.
 *
 * @param state - Member simulation state.
 * @param timeTo - Target time in seconds to advance to.
 */
export function getEnergyByState(
	state: MemberSimulationState,
	timeTo: number,
): number {
	if (timeTo < state.lastRecoverySec) {
		throw new Error(
			`getEnergy called with timeTo ${timeTo} < lastRecoverySec ${state.lastRecoverySec}`,
		);
	}
	return Math.max(
		0,
		state.energy - Math.floor((timeTo - state.lastRecoverySec) / 600),
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
	sim: IterationState,
	memberIdx: number,
	timeTo: number,
	energy: number,
): void {
	const state = sim.states[memberIdx];
	if (timeTo < state.lastRecoverySec) {
		throw new Error(
			`setEnergy called with timeTo ${timeTo} < lastRecoverySec ${state.lastRecoverySec}`,
		);
	}
	state.energy = clamp(0, energy, 150);
	state.lastRecoverySec = timeTo;
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
	sim: IterationState,
	memberIdx: number,
	diff: number,
): void {
	sim.states[memberIdx].pendingEnergy += diff;
}

/**
 * Apply all pending energy diffs for every member at timeTo,
 * then clear the pending values.
 *
 * @param sim - Full iteration state.
 * @param timeTo - Target time in seconds.
 */
export function applyPendingEnergy(sim: IterationState, timeTo: number): void {
	for (let i = 0; i < sim.states.length; i++) {
		const state = sim.states[i];
		if (state.pendingEnergy === 0) continue;
		const current = getEnergy(sim, i, timeTo);
		setEnergy(sim, i, timeTo, current + state.pendingEnergy);
		state.pendingEnergy = 0;
	}
}
