import type { BagUsagePerHelpDetailItem } from "../../PokemonIv";
import type {
	MemberProfile,
	MemberProgress,
	TeamContext,
	TeamMember,
} from "../Types";

/**
 * Resolve every member's pending extra helps (queued by Extra Helpful,
 * Helper Boost and Energizing Cheer / Heal Pulse), then clear the counter.
 *
 * Unlike normal helps, extra helps ignore the carry limit and sneaky
 * snacking: each one simply draws an outcome from `profile.extraBagUsage`
 * and adds the resulting berry strength or ingredient count to progress.
 */
export function applyPendingExtraHelp(
	sim: TeamContext,
	rng: () => number = Math.random,
): void {
	for (const member of sim.members) {
		applyPendingExtraHelpForMember(member, rng);
	}
}

export function applyPendingExtraHelpForMember(
	member: TeamMember,
	rng: () => number = Math.random,
): void {
	const { profile, progress } = member;

	const helpCount = progress.pendingExtraHelp;
	if (helpCount === 0) {
		return;
	}

	for (let i = 0; i < helpCount; i++) {
		applySingleExtraHelp(profile, progress, rng);
	}

	progress.pendingExtraHelp = 0;
}

/**
 * Apply a single extra help: draw an outcome from the extra bag usage
 * distribution and add the resulting berry or ingredient to progress.
 * @param profile Profile for the member.
 * @param progress Current simulation progress for the member.
 */
function applySingleExtraHelp(
	profile: MemberProfile,
	progress: MemberProgress,
	rng: () => number,
): void {
	const outcome = drawExtraBagUsage(profile.extraBagUsage, rng());

	if (outcome.name === "berry") {
		progress.berryTotalStrength +=
			profile.berryStrengthWithBonus * outcome.count;
	} else {
		progress.ingCounts.set(
			outcome.name,
			(progress.ingCounts.get(outcome.name) ?? 0) + outcome.count,
		);
	}
}

/**
 * Draw a single outcome from the given bag usage distribution.
 */
function drawExtraBagUsage(
	bagUsage: BagUsagePerHelpDetailItem[],
	rand: number,
): BagUsagePerHelpDetailItem {
	let cumulative = 0;
	for (const item of bagUsage) {
		cumulative += item.p;
		if (rand < cumulative) {
			return item;
		}
	}
	return bagUsage[0];
}
