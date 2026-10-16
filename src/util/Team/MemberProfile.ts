import { isExpertField } from "../../data/fields";
import { whistlePeriod } from "../../util/Energy";
import { bonusEffectToInventoryBonus } from "../InventoryBonus";
import { getMaxSkillLevel } from "../MainSkill";
import PokemonIv, { type BagUsagePerHelpDetailItem } from "../PokemonIv";
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

/**
 * Build the {@link MemberProfile} for Night Cap Pikachu.
 *
 * @param param - Strength calculation parameters (field bonus, recipe bonus, etc.).
 * @param level - Level of Night Cap Pikachu.
 * @returns A fully populated MemberProfile (index is set to -1; caller must assign it).
 */
export function buildNightCapPikachuProfile(
	param: StrengthParameter,
	level: number,
): MemberProfile {
	// (NOTE) Use `Pikachu (Low Key)` for Night Cap
	const iv = new PokemonIv({
		pokemonName: "Pikachu (Low Key)",
		level,
	});
	const strength = new PokemonStrength(iv, param);
	const bonus = strength.bonusEffects;

	// Base frequency
	const baseFreq =
		level <= 4
			? 4920 - level * 120
			: level <= 17
				? 4380 - (level - 5) * 60
				: 3600 - (level - 18) * 30;

	// carryLimit
	const carryLimit = 7 + Math.ceil(level / 2);

	// bagUsage
	const normalBagUsage: BagUsagePerHelpDetailItem[] = [
		{
			name: "berry",
			count: level <= 10 ? 1 : 2,
			p: level <= 2 ? 1 : level <= 18 ? 0.6667 : 0.5834,
			ingKindIndex: -1,
			ingSlotIndex: -1,
		},
	];
	if (level >= 3) {
		normalBagUsage.push({
			name: "apple",
			count: level <= 12 ? 1 : 2,
			p: level <= 8 ? 0.3333 : 0.2222,
			ingKindIndex: 0,
			ingSlotIndex: 0,
		});
	}
	if (level >= 9) {
		normalBagUsage.push({
			name: "cacao",
			count: level <= 16 ? 1 : 2,
			p: 0.1111,
			ingKindIndex: 1,
			ingSlotIndex: 1,
		});
	}
	if (level >= 19) {
		normalBagUsage.push({
			name: "honey",
			count: 2,
			p: 0.0833,
			ingKindIndex: 2,
			ingSlotIndex: 2,
		});
	}
	const extraBagUsage = normalBagUsage;

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

	return {
		index: -1,
		iv,
		bonus,
		baseFreq,
		wakeMax: 100,
		sleepRecovery: 100,
		skillRate: 0,
		pityProcHelpCount: 0,
		normalBagUsage,
		extraBagUsage,
		carryLimit,
		ingStrengthRate,
		berryStrengthBonus: strength.berryStrengthBonus,
		skillName: "unknown",
		skillLevel: 1,
		energyRecoveryFactor: 1,
		maxSkillCount: 1,
		isEnergyAlwaysFull: false,
		sneakySnacking: false,
		skill: createSkill("unknown"),
	};
}
