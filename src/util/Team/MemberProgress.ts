import type { IngredientName } from "../../data/pokemons";
import { getBerryStrength } from "../Berry";
import type { StrengthParameter } from "../PokemonStrength";
import { zeroSkillMetrics } from "./SkillMetrics";
import type { MemberProfile, MemberProgress, TeamMember } from "./Types";

/**
 * Build the initial {@link MemberProgress} for a single team member at the
 * start of a simulation iteration.
 *
 * @param profile Profile of the member.
 * @param param Strength calculation parameters shared by all members.
 * @returns A fully populated MemberProgress with all accumulators reset.
 */
export function createMemberProgress(
	profile: MemberProfile,
	param: StrengthParameter,
): MemberProgress {
	const { iv, bonus, berryStrengthBonus } = profile;
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
		berry1Strength: getBerryStrength(
			iv.pokemon.type,
			iv.level,
			param.fieldBonus,
			berryStrengthBonus,
		),
		// TODO: assume only psychic big berry
		bigBerry1Strength:
			bonus.bigBerryCount === 0
				? 0
				: getBerryStrength(
						"psychic",
						iv.level,
						param.fieldBonus,
						berryStrengthBonus,
						true,
					),
		berryStrength: 0,
		bigBerryHelpCount: 0,
		bigBerryCount: 0,
		bigBerryStrength: 0,
		ingCounts: new Map<IngredientName, number>(),
		skillStockCount: 0,
		...zeroSkillMetrics(),
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
export function createTeamMembers(
	profiles: MemberProfile[],
	param: StrengthParameter,
): TeamMember[] {
	return profiles.map((profile) => ({
		profile,
		progress: createMemberProgress(profile, param),
	}));
}
