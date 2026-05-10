import type { IngredientName } from "../../data/pokemons";
import type { MemberProfile, MemberProgress, TeamMember } from "./Types";

/**
 * Build the initial {@link MemberProgress} for a single team member at the
 * start of a simulation iteration.
 *
 * @param profile - The member's profile (used for the initial energy value).
 * @returns A fully populated MemberProgress with all accumulators reset.
 */
export function createMemberProgress(profile: MemberProfile): MemberProgress {
	return {
		energy: profile.wakeMax,
		lastRecoverySec: 0,
		sleeping: false,
		nextHelpSec: -1, // not yet scheduled
		helpsSinceSkill: 0,
		berryTotalStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillCount: 0,
		skillStockCount: 0,
		skillStrength: 0,
		skillStrength2: 0,
		skillDreamShards: 0,
		pendingEnergy: 0,
		pendingExtraHelp: 0,
		hasMainSkillActivationBonus: false,
		disguiseGreatSuccess: false,
	};
}

/**
 * Create the initial team member states for a simulation iteration.
 */
export function createTeamMembers(profiles: MemberProfile[]): TeamMember[] {
	return profiles.map((profile) => ({
		profile,
		progress: createMemberProgress(profile),
	}));
}
