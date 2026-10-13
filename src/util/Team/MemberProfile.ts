import { isExpertField } from "../../data/fields";
import { whistlePeriod } from "../../util/Energy";
import { bonusEffectToInventoryBonus } from "../InventoryBonus";
import { getMaxSkillLevel } from "../MainSkill";
import type { StrengthParameter } from "../PokemonStrength";
import PokemonStrength, { recipeLevelBonus } from "../PokemonStrength";
import { createSkill } from "./Skill/SkillFactory";
import { initializeSkillValue } from "./Skill/SkillInitializer";
import type { MemberProfile, TeamMemberInput } from "./Types";

export function buildMemberProfiles(
	members: (TeamMemberInput | undefined)[],
	param: StrengthParameter,
): MemberProfile[] {
	const activeMembers = members.filter(
		(m): m is TeamMemberInput => m !== undefined,
	);
	const helpBonusCount = activeMembers.filter(
		(m) => m.iv.hasHelpingBonusInActiveSubSkills,
	).length;

	const profiles: MemberProfile[] = activeMembers.map((m, index) => {
		const profile = buildMemberProfile(m, param, helpBonusCount);
		profile.index = index;
		profile.sneakySnacking = m.sneakySnacking;
		return profile;
	});
	initializeSkillValue(profiles, param);
	return profiles;
}

/**
 * Build the {@link MemberProfile} for a single team member.
 *
 * Computes all derived values (frequency, energy caps, skill rate, carry
 * limit, berry/ingredient strengths, skill level) from the IV and
 * shared parameters so the simulation loop can read them without
 * re-calculating.
 *
 * @param member - The team member input containing the IV and other properties.
 * @param param - Strength calculation parameters (field bonus, recipe bonus, etc.).
 * @param helpBonusCount - Number of active members with Helping Bonus sub-skill.
 * @returns A fully populated MemberProfile (index is set to -1; caller must assign it).
 */
export function buildMemberProfile(
	member: TeamMemberInput,
	param: StrengthParameter,
	helpBonusCount: number,
): MemberProfile {
	const strength = new PokemonStrength(member.iv, param);
	const iv = strength.pokemonIv;
	const bonus = strength.bonusEffects;

	// Base frequency
	const isWhistle = param.period === whistlePeriod;
	const isExpertMode = isExpertField(param.fieldIndex) && !isWhistle;
	const isFavoriteBerry =
		isExpertMode && param.favoriteType.includes(iv.pokemon.type);
	const isMainBerry = isExpertMode && param.favoriteType[0] === iv.pokemon.type;
	const isNonFavoriteBerry = isExpertMode && !isFavoriteBerry;
	const isGoodCamp = param.isGoodCampTicketSet;
	const baseFreq = iv.getBaseFrequency(
		helpBonusCount,
		isGoodCamp,
		isMainBerry,
		isNonFavoriteBerry,
		param.fieldIndex,
	);

	// wakeMax
	const wakeMax: 100 | 105 = iv.hasEnergyRecoveryBonusInActiveSubSkills
		? 105
		: 100;

	// sleepRecovery
	const sleepMinutes = (param.sleepScore * 510) / 100;
	const recoveryFactor = iv.nature.energyRecoveryFactor;
	const sleepRecovery = Math.min(
		wakeMax,
		Math.ceil(
			Math.round((sleepMinutes / 510) * 100) *
				recoveryFactor *
				(1 + 0.14 * param.recoveryBonusCount),
		),
	);

	// Skill rate with pity proc
	const skillRate = iv.skillRate * bonus.skillTrigger;

	// carryLimit
	const carryLimit = Math.ceil(
		(iv.carryLimit + bonus.carryLimitAdd) *
			(bonus.carryLimitMul ?? 1) *
			(isGoodCamp ? 1.2 : 1),
	);

	// bagUsage
	const normalBagUsage = iv.getBagUsagePerHelpDetail(
		bonusEffectToInventoryBonus(bonus),
	);
	const extraBagUsage = iv.getBagUsagePerHelpDetail({});

	// ingStrengthRate
	const ingInRecipeStrengthRate =
		param.recipeBonus === 0
			? 1
			: (1 + param.recipeBonus / 100) *
				(1 + recipeLevelBonus[param.recipeLevel] / 100);
	const ingStrengthRate =
		(ingInRecipeStrengthRate * 0.8 + 0.2) *
		(1 + param.fieldBonus / 100) *
		bonus.dish;

	// Skill level
	const maxSkillLevel = getMaxSkillLevel(iv.pokemon.skill);
	let skillLevel = Math.min(maxSkillLevel, iv.skillLevel + bonus.skillLevel);
	if (param.maxSkillLevel) {
		skillLevel = maxSkillLevel;
	}

	// Keep "Versatile" here; VersatileSkill resolves iv.versatileSkill and
	// forwards to the chosen skill's handler.
	const skillName = iv.pokemon.skill;
	const isSkillSpecialty =
		iv.pokemon.specialty === "Skills" || iv.pokemon.specialty === "All";

	return {
		index: -1, // will be set by caller
		iv,
		bonus,
		baseFreq,
		wakeMax,
		sleepRecovery,
		skillRate,
		pityProcHelpCount: iv.pityProcHelpCount,
		normalBagUsage,
		extraBagUsage,
		carryLimit,
		ingStrengthRate,
		berryStrengthBonus: strength.berryStrengthBonus,
		skillName,
		skillLevel,
		energyRecoveryFactor: recoveryFactor,
		maxSkillCount: isSkillSpecialty ? 2 : 1,
		isEnergyAlwaysFull: param.isEnergyAlwaysFull,
		sneakySnacking: member.sneakySnacking,
		skill: createSkill("unknown"),
	};
}
