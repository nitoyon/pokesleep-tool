import type { IngredientName } from "../../data/pokemons";
import { getBerryStrength } from "../Berry";
import type { StrengthParameter } from "../PokemonStrength";
import { zeroSkillMetrics } from "./SkillMetrics";
import type {
	MemberProfile,
	MemberProgress,
	TeamMember,
	TeamProgress,
} from "./Types";

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
		...calcBerry1Strength(profile, param, {}),
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

/**
 * Recalculate berry1Strength / bigBerry1Strength of a member in place,
 * reflecting the current Berry Zone rate (e.g. after Berry Zone triggers).
 *
 * @param member Member whose progress is updated.
 * @param param Strength calculation parameters shared by all members.
 * @param berryZoneRate Accumulated Berry Zone rate by berry type.
 */
export function updateBerryStrength(
	member: TeamMember,
	param: StrengthParameter,
	berryZoneRate: TeamProgress["berryZoneRate"],
): void {
	const { berry1Strength, bigBerry1Strength } = calcBerry1Strength(
		member.profile,
		param,
		berryZoneRate,
	);
	member.progress.berry1Strength = berry1Strength;
	member.progress.bigBerry1Strength = bigBerry1Strength;
}

/**
 * Calculate the per-berry strength of a member, including field bonus,
 * favorite berry bonus and the current Berry Zone rate.
 */
function calcBerry1Strength(
	profile: MemberProfile,
	param: StrengthParameter,
	berryZoneRate: TeamProgress["berryZoneRate"],
): Pick<MemberProgress, "berry1Strength" | "bigBerry1Strength"> {
	const { iv, bonus, berryStrengthBonus } = profile;
	const type = iv.pokemon.type;
	// TODO: assume only psychic big berry
	const bigType = "psychic";
	return {
		berry1Strength: getBerryStrength(
			type,
			iv.level,
			param.fieldBonus,
			berryStrengthBonus,
			false,
			berryZoneRate[type] ?? 0,
		),
		bigBerry1Strength:
			bonus.bigBerryCount === 0
				? 0
				: getBerryStrength(
						bigType,
						iv.level,
						param.fieldBonus,
						berryStrengthBonus,
						true,
						berryZoneRate[bigType] ?? 0,
					),
	};
}
