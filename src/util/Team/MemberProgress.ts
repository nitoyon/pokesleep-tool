import type { IngredientName } from "../../data/pokemons";
import type { MemberProfile, MemberProgress, TeamMember } from "./Types";

/**
 * Build the initial {@link MemberProgress} for a single team member at the
 * start of a simulation iteration.
 *
 * @returns A fully populated MemberProgress with all accumulators reset.
 */
export function createMemberProgress(): MemberProgress {
	const progress: MemberProgress = {
		energy: 100,
		lastRecoverySec: 0,
		sleeping: false,
		nextHelpSec: -1,
		helpsSinceSkill: 0,
		help: {
			all: 0,
			normal: 0,
			sneakySnacking: 0,
		},
		berryTotalStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillCount: 0,
		skillStockCount: 0,
		skillStrength: 0,
		skillExtraHelp: 0,
		skillHelperBoost: 0,
		skillEnergizingCheer: 0,
		skillEnergyForEveryone: 0,
		skillDreamShards: 0,
		skillPotExtended: 0,
		skillExtraTastyRate: 0,
		pendingHelp: 0,
		pendingEnergy: 0,
		pendingExtraHelp: 0,
		hasMainSkillActivationBonus: false,
		disguiseGreatSuccess: false,
	};
	return progress;
}

/**
 * Create the initial team member states for a simulation iteration.
 */
export function createTeamMembers(profiles: MemberProfile[]): TeamMember[] {
	return profiles.map((profile) => ({
		profile,
		progress: createMemberProgress(),
	}));
}
