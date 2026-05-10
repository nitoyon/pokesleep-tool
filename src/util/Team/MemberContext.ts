import { getBerryStrength } from "../Berry";
import { getMaxSkillLevel } from "../MainSkill";
import type { PokemonBoxItem } from "../PokemonBox";
import type { StrengthParameter } from "../PokemonStrength";
import PokemonStrength, { recipeLevelBonus } from "../PokemonStrength";
import type { MemberContext } from "./Types";

/**
 * Build the {@link MemberContext} for a single team member.
 *
 * Computes all derived values (frequency, energy caps, skill rate, carry
 * limit, berry/ingredient strengths, skill level) from the box item and
 * shared parameters so the simulation loop can read them without
 * re-calculating.
 *
 * @param item - The Pokémon box item whose IV and sub-skills are used.
 * @param param - Strength calculation parameters (field bonus, recipe bonus, etc.).
 * @param helpBonusCount - Number of active members with Helping Bonus sub-skill.
 * @returns A fully populated MemberContext (index is set to -1; caller must assign it).
 */
export function buildMemberContext(
	item: PokemonBoxItem,
	param: StrengthParameter,
	helpBonusCount: number,
): MemberContext {
	const strength = new PokemonStrength(item.iv, param);
	const iv = strength.pokemonIv;
	const bonus = strength.bonusEffects;

	// Base frequency
	const isGoodCamp = param.isGoodCampTicketSet;
	const baseFreq = iv.getBaseFrequency(
		helpBonusCount,
		isGoodCamp,
		false,
		false,
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

	// bagUsageDetail
	const bagUsageDetail = iv.getBagUsagePerHelpDetail({
		berry: bonus.berry,
		ingredient: bonus.ingredient as 0 | 1,
		carryLimitAdd: bonus.carryLimitAdd,
		carryLimitMul: bonus.carryLimitMul,
		expertIng: false,
	});

	// Berry strengths
	const berryRawStrength = getBerryStrength(iv.pokemon.type, iv.level);
	const berryStrength = Math.ceil(
		berryRawStrength * (1 + param.fieldBonus / 100),
	);
	const berryStrengthWithBonus = Math.ceil(
		berryStrength * strength.berryStrengthBonus,
	);

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

	const skillName =
		iv.pokemon.skill === "Versatile" ? iv.versatileSkill : iv.pokemon.skill;

	return {
		index: -1, // will be set by caller
		iv,
		bonus,
		baseFreq,
		wakeMax,
		sleepRecovery,
		skillRate,
		pityProcHelpCount: iv.pityProcHelpCount,
		bagUsageDetail,
		carryLimit,
		berryRawStrength,
		berryStrength,
		berryStrengthWithBonus,
		ingStrengthRate,
		skillName,
		skillLevel,
		energyRecoveryFactor: recoveryFactor,
		isSkillSpecialty:
			iv.pokemon.specialty === "Skills" || iv.pokemon.specialty === "All",
		skillValue: 0,
		skillValue2: 0,
	};
}
