import {
	type BonusEffects,
	emptyBonusEffects,
	getEventBonus,
	getEventBonusIfTarget,
} from "../data/events";
import { getFavoriteBerries, isExpertField } from "../data/fields";
import type { PokemonType } from "../data/pokemons";
import { getBerryStrength } from "./Berry";
import Energy, { AlwaysTap, type EnergyResult, whistlePeriod } from "./Energy";
import {
	calculateHelpCount,
	type HelpCountResult,
	type IngredientHelp,
} from "./HelpCount";
import type { MainSkillName } from "./MainSkill";
import {
	getDracoMeteorBerryCount,
	getIngredientDrawIngredients,
	getLunarBlessingBerryCount,
	getMaxSkillLevel,
	getSkillSubValue,
	getSkillValue,
	hyperCutterSuccess,
	presentCandyRate,
	superLuckIngRate,
	superLuckShard5Rate,
	superLuckShardRate,
} from "./MainSkill";
import type PokemonIv from "./PokemonIv";
import type { IngredientSlot } from "./PokemonIv";
import PokemonRp, {
	averageIngredientStrength,
	ingredientStrength,
} from "./PokemonRp";
import {
	allFavoriteFieldIndex,
	type BerryBurstTeam,
	type BerryBurstTeamMember,
	type MewParameter,
	noFavoriteFieldIndex,
	type StrengthParameter,
} from "./StrengthParameter";

export {
	allFavoriteFieldIndex,
	type BerryBurstTeam,
	createStrengthParameter,
	type ExpertEffects,
	loadStrengthParameter,
	type MewParameter,
	noFavoriteFieldIndex,
	normalizeStrengthParameter,
	type StrengthParameter,
	saveStrengthParameter,
} from "./StrengthParameter";

/** Helping speed bonus for the main berry in Expert Mode */
export const expertMainBerrySpeedBonus = 0.1;

/** Skill level bonus for the main berry in Expert Mode */
export const expertMainSkillLevelBonus = 1;

/** Favorite berry bonus for the favorite berry in Expert Mode */
export const expertFavoriteBerryBonus = 2.4;

/** Ingredient bonus for the favorite berry in Expert Mode */
export const expertFavoriteIngredientBonus = 1;

/**
 * Additional ingredient bonus probability for favorite berry
 * (Specialty: Ingredients) in Expert Mode
 *
 * (ref) Fix at 50%
 * https://discord.com/channels/1138701819464392744/1139000897574289468/1404846527033114767
 * https://x.com/ao_wasabi28/status/1955088349145993551
 */
export const expertFavoriteIngredientAdditionalBonus = 0.5;

/** Ingredient bonus for the favorite berry in Expert Mode */
export const expertFavoriteSkillTriggerBonus = 1.25;

/** Helping speed penalty for non-favorite berries in Expert Mode */
export const expertNonFavoriteBerrySpeedPenalty = 0.15;

/**
 * Respresents the result of ingredient strength calculation.
 * IngredientHelp with strength.
 */
export type IngredientStrength = IngredientHelp & {
	/** Ingredient strength. */
	strength: number;
};

/**
 * Represents the result of strength calculation.
 */
export interface StrengthResult
	extends Omit<HelpCountResult, "ing1" | "ing2" | "ing3" | "ingredients"> {
	/** The bonus effect that was used to calculate this result */
	bonus: BonusEffectsWithReason;
	/** energy and help count */
	energy: EnergyResult;
	/** Total strength (berry + ingredient + skill + helpingBonusStrength) */
	totalStrength: number;
	/**
	 * Additional strength that other Pokémon gain from this Pokémon's
	 * Helping Bonus
	 */
	helpingBonusStrength: number;

	/** Strength per 1 berry (area bonus not included) */
	berryRawStrength: number;
	/** Strength per 1 berry (area bonus included) */
	berryStrength: number;
	/** Total strength gained by berry */
	berryTotalStrength: number;

	/** Ingredient strength */
	ingStrength: number;
	/** Ing1 name and count */
	ing1: IngredientSlot;
	/** Ing2 name and count */
	ing2: IngredientSlot;
	/** Ing3 name and count */
	ing3: IngredientSlot;
	/** Ing1 ~ Ing3 name, count, strength summary */
	ingredients: IngredientStrength[];
	/**
	 * Skill value got from the skillCount skill occurance
	 * If the skill is 'Dream Shard Magnet S', this value represents the number of Dream Shards.
	 * If the skill is 'Metronome' or 'Skill Copy', this value is equal to the skillCount.
	 * If the skill is 'Ingredient Magnet S', this value represents the number of ingredients.
	 */
	skillValue: number;
	/** Strength got from the skillCount skill occurance */
	skillStrength: number;
	/**
	 * Represents the skill value per trigger.
	 *
	 * For most skills, this is equal to `skillValue / skillCount`.
	 * However, for "Berry Burst (Disguise)", this excludes the
	 * extra strength gained from great success.
	 */
	skillValuePerTrigger: number;
	/**
	 * Skill value got from the second skill effect.
	 */
	skillValue2: number;
	/** Strength got from the second skill effect */
	skillStrength2: number;
	/**
	 * Represents the skillValue2 per trigger (equal to `skillValue2 / skillCount2`).
	 */
	skillValuePerTrigger2: number;
}

/** Recipe level bonus table  */
export const recipeLevelBonus: { [key: number]: number } = {
	1: 0,
	2: 2,
	3: 4,
	4: 6,
	5: 8,
	6: 9,
	7: 11,
	8: 13,
	9: 16,
	10: 18,
	11: 19,
	12: 21,
	13: 23,
	14: 24,
	15: 26,
	16: 28,
	17: 30,
	18: 31,
	19: 33,
	20: 35,
	21: 37,
	22: 40,
	23: 42,
	24: 45,
	25: 47,
	26: 50,
	27: 52,
	28: 55,
	29: 58,
	30: 61,
	31: 64,
	32: 67,
	33: 70,
	34: 74,
	35: 77,
	36: 81,
	37: 84,
	38: 88,
	39: 92,
	40: 96,
	41: 100,
	42: 104,
	43: 108,
	44: 113,
	45: 117,
	46: 122,
	47: 127,
	48: 132,
	49: 137,
	50: 142,
	51: 148,
	52: 153,
	53: 159,
	54: 165,
	55: 171,
	56: 177,
	57: 183,
	58: 190,
	59: 197,
	60: 203,
	61: 209,
	62: 215,
	63: 221,
	64: 227,
	65: 234,
	66: 239,
	67: 243,
	68: 247, // estimated
	69: 251, // estimated
	70: 256, // estimated
};

/**
 * Represents BonusEffects and the source of each bonus.
 */
export interface BonusEffectsWithReason extends BonusEffects {
	/** The source of the skill trigger bonus (event or expert mode). */
	skillTriggerReason: "event" | "ex" | "none";
	/** The source of the skill level bonus (event or expert mode). */
	skillLevelReason: "event" | "ex" | "event+ex" | "none";
	/** The source of the ingredient bonus (event or expert mode). */
	ingredientReason: "event" | "ex" | "none";
}

/**
 * Cache for values that are derived solely from `StrengthParameter.teamMember`
 * and therefore identical across every PokemonStrength calculation that
 * shares the same StrengthParameter.
 */
export interface StrengthCache {
	/** Cached strength per help of the team member. */
	teamMemberPerHelp?: number;
	/** Cached total strength of the team member. */
	teamMemberStrength?: number;
}

function getMewSkillRate(
	versatileSkill: MainSkillName,
	mew: MewParameter,
): number {
	if (
		versatileSkill === "Charge Strength S (Random)" ||
		versatileSkill === "Charge Energy S"
	) {
		return mew.skill1;
	} else if (
		versatileSkill === "Energy for Everyone S" ||
		versatileSkill === "Berry Burst"
	) {
		return mew.skill3;
	}
	return mew.skill2;
}

/**
 * Strength calculator
 */
class PokemonStrength {
	private iv: PokemonIv;
	private param: StrengthParameter;
	private isWhistle: boolean;
	private cache: StrengthCache;

	constructor(
		iv: PokemonIv,
		param: StrengthParameter,
		decendantId?: number,
		cache?: StrengthCache,
	) {
		this.param = param;
		this.isWhistle = false;
		this.cache = cache ?? {};
		if (param.period === whistlePeriod) {
			this.isWhistle = true;
			this.param = {
				...param,
				period: 3,
				isEnergyAlwaysFull: true,
				isGoodCampTicketSet: false,
				tapFrequencyAwake: AlwaysTap,
				tapFrequencyAsleep: AlwaysTap,
			};
		}

		this.iv = this.changePokemonIv(iv, decendantId);

		// Apply Mew overrides
		if (this.iv.pokemon.name === "Mew") {
			this.iv = this.iv.clone({
				baseIngRate: param.mew.ing,
				baseSkillRate: getMewSkillRate(this.iv.versatileSkill, param.mew),
			});
		}
	}

	/** Get the PokemonIv to be calculated. */
	get pokemonIv(): PokemonIv {
		return this.iv;
	}

	/** Get the StrengthParameter to be used. */
	get parameter(): StrengthParameter {
		return this.param;
	}

	/**
	 * Update PokemonIv as specified by param.
	 * @param pokemonIv    The PokmeonIv object to be modified.
	 * @param decendantId  Optional evolved pokemon ID.
	 * @returns The updated PokemonIv object.
	 */
	changePokemonIv(pokemonIv: PokemonIv, decendantId?: number): PokemonIv {
		// change level if `level` is specified
		const settings = this.param;
		if (settings.level !== 0) {
			pokemonIv = pokemonIv.changeLevel(settings.level);
		}

		// evolve the pokemon if `evolved` is specified
		if (!settings.evolved) {
			return pokemonIv;
		}

		// Change pokemon
		const decendants = pokemonIv.decendants;
		if (decendants.length === 0) {
			return pokemonIv;
		}
		let showingPokemon = decendants.find((x) => x.id === pokemonIv.pokemon.id);
		if (showingPokemon !== undefined) {
			// already evolved
			return pokemonIv;
		}

		// decendantId is given, select the pokemon
		showingPokemon = decendants.find((x) => x.id === decendantId);
		if (showingPokemon === undefined) {
			// otherwise, use the first decendant
			showingPokemon = decendants[0];
		}
		if (showingPokemon.id !== pokemonIv.pokemon.id) {
			pokemonIv = pokemonIv.clone({ pokemonName: showingPokemon.name });
		}
		return pokemonIv;
	}

	/**
	 * Calculate the full strength result for this Pokémon, including the
	 * helping-bonus effect gained by the other 4 team members when this
	 * Pokémon has an active "Helping Bonus" sub-skill.
	 */
	calculate(): StrengthResult {
		const result = this.calculateImpl();
		const param = this.param;

		if (
			!(
				param.addHelpingBonusEffect &&
				this.pokemonIv.hasHelpingBonusInActiveSubSkills
			)
		) {
			return result;
		}

		const teamMemberStrength = this.teamMemberStrength;

		// current factor (ex: if helpBonusCount is 1, factor is 0.95)
		const currentHelpingBonusEffect = 1 - 0.05 * param.helpBonusCount;
		// new factor (ex: if helpBonusCount is 1, factor is 0.9)
		const newHelpingBonusEffect = 1 - 0.05 * (param.helpBonusCount + 1);
		// Increased strength rate (ex: helpBonusCount is 1, factor is 0.055...)
		const rate = currentHelpingBonusEffect / newHelpingBonusEffect - 1;
		// Strength gained by the other 4 team members based on the team
		// member's own totalStrength
		const helpingBonusStrength = teamMemberStrength * rate * 4;

		return {
			...result,
			helpingBonusStrength,
			totalStrength: result.totalStrength + helpingBonusStrength,
		};
	}

	/**
	 * Calculate the strength result for this Pokémon.
	 *
	 * This excludes the helping-bonus effect gained by other team members
	 * (`helpingBonusStrength` is always 0 here). Use {@link calculate} to
	 * get the full result including the helping-bonus contribution.
	 */
	calculateImpl(): StrengthResult {
		const param = this.param;
		const rp = new PokemonRp(this.iv);
		const bonus = this.bonusEffects;
		const energy = new Energy(this.iv).calculate(param, bonus);
		const helpCount: HelpCountResult = calculateHelpCount(
			this.iv,
			param,
			energy,
			bonus,
			this.isWhistle,
		);

		// calc ingredient
		const ingInRecipeStrengthRate =
			param.recipeBonus === 0
				? 1
				: (1 + param.recipeBonus / 100) *
					(1 + recipeLevelBonus[param.recipeLevel] / 100);
		const ingStrengthRate =
			(ingInRecipeStrengthRate * 0.8 + 0.2) *
			(1 + param.fieldBonus / 100) *
			bonus.dish;

		const ingredients = helpCount.ingredients.map((x) => ({
			...x,
			strength: x.count * ingredientStrength[x.name] * ingStrengthRate,
		}));
		const ingStrength = ingredients.reduce((p, c) => p + c.strength, 0);

		// calc berry
		const berryCountWithBonus = this.iv.berryCount + bonus.berry;
		const berryRawStrength = rp.berryStrength;
		const berryStrength = getBerryStrength(
			this.iv.pokemon.type,
			this.iv.level,
			param.fieldBonus,
		);
		const berryStrengthWithBonus = getBerryStrength(
			this.iv.pokemon.type,
			this.iv.level,
			param.fieldBonus,
			this.berryStrengthBonus,
		);
		const berryTotalStrength =
			berryStrengthWithBonus *
				berryCountWithBonus *
				helpCount.berryNormalHelpCount +
			berryStrengthWithBonus *
				this.iv.berryCount *
				helpCount.total.sneakySnacking;

		// calc skill
		let skillValue = 0,
			skillStrength = 0,
			skillValuePerTrigger = 0;
		let skillValue2 = 0,
			skillStrength2 = 0,
			skillValuePerTrigger2 = 0;
		if (helpCount.skillCount > 0) {
			({
				skillValue,
				skillStrength,
				skillValuePerTrigger,
				skillValue2,
				skillStrength2,
				skillValuePerTrigger2,
			} = this.getSkillValueAndStrength(
				helpCount.skillCount,
				param,
				bonus,
				(berryTotalStrength + ingStrength) / helpCount.total.all,
			));
		}

		const totalStrength =
			(param.totalFlags[1] ? ingStrength : 0) +
			(param.totalFlags[0] ? berryTotalStrength : 0) +
			(param.totalFlags[2] ? skillStrength + skillStrength2 : 0);
		const helpingBonusStrength = 0;

		return {
			...helpCount,
			bonus,
			energy,
			totalStrength,
			helpingBonusStrength,
			ingStrength,
			ingredients,
			berryStrength,
			berryRawStrength,
			berryTotalStrength,
			skillValue,
			skillStrength,
			skillValuePerTrigger,
			skillValue2,
			skillStrength2,
			skillValuePerTrigger2,
		};
	}

	/**
	 * Get skill value and skill strength.
	 * @param skillCount Skill count.
	 * @param param Strength paramter.
	 * @param bonus BonusEffects for this pokemon and StrengthParameter.
	 * @returns {skillValue, skillStrength, skillValuePerTrigger,
	 *     skillValue2, skillStrength2, skillValuePerTrigger2}.
	 */
	getSkillValueAndStrength(
		skillCount: number,
		param: StrengthParameter,
		bonus: BonusEffects,
		ownStrengthPerHelp: number,
	): {
		skillValue: number;
		skillStrength: number;
		skillValuePerTrigger: number;
		skillValue2: number;
		skillStrength2: number;
		skillValuePerTrigger2: number;
	} {
		const skillLevel = this.getSkillLevel();

		// Handle non-Versatile skills
		if (this.iv.pokemon.skill !== "Versatile") {
			return this.getSkillValueAndStrengthImpl(
				skillCount,
				param,
				bonus,
				this.iv.pokemon.skill,
				skillLevel,
				ownStrengthPerHelp,
			);
		}

		// Handle Versatile
		const mainSkill = this.iv.versatileSkill;
		const maxSkillLevel = getMaxSkillLevel(mainSkill);
		const ret = this.getSkillValueAndStrengthImpl(
			skillCount,
			param,
			bonus,
			mainSkill,
			Math.min(skillLevel, maxSkillLevel),
			ownStrengthPerHelp,
		);

		const successCount = getSkillSubValue("Versatile", skillLevel);
		ret.skillValuePerTrigger2 = 1 + (successCount * param.mew.success) / 100;
		ret.skillValue2 = ret.skillValuePerTrigger2 * skillCount;
		return ret;
	}

	/**
	 * Get skill value and skill strength.
	 * @param skillCount Skill count.
	 * @param param Strength paramter.
	 * @param bonus BonusEffects for this pokemon and StrengthParameter.
	 * @param mainSkill Main skill name.
	 * @param skillLevel Skill level.
	 * @returns {skillValue, skillStrength, skillValuePerTrigger,
	 *     skillValue2, skillStrength2, skillValuePerTrigger2}.
	 */
	getSkillValueAndStrengthImpl(
		skillCount: number,
		param: StrengthParameter,
		bonus: BonusEffects,
		mainSkill: MainSkillName,
		skillLevel: number,
		ownStrengthPerHelp: number,
	): {
		skillValue: number;
		skillStrength: number;
		skillValuePerTrigger: number;
		skillValue2: number;
		skillStrength2: number;
		skillValuePerTrigger2: number;
	} {
		const days = Math.ceil(param.period / 24);

		let mainSkillBase = getSkillValue(mainSkill, skillLevel);
		if (mainSkill.startsWith("Ingredient Magnet S")) {
			// This event bonus is floored.
			// (ref) https://x.com/nitoyon/status/1995228758182383941
			mainSkillBase = Math.floor(
				mainSkillBase * Math.max(bonus.ingredientMagnet, bonus.skillIngredient),
			);
		}
		if (mainSkill.startsWith("Ingredient Draw S")) {
			// This event bonus is floored
			mainSkillBase = Math.floor(
				mainSkillBase * Math.max(bonus.ingredientDraw, bonus.skillIngredient),
			);
		}
		if (mainSkill.startsWith("Dream Shard Magnet S")) {
			mainSkillBase *= bonus.dreamShard;
		}

		let mainSkillFactor = 1;
		if (mainSkill === "Charge Energy S") {
			mainSkillFactor = this.iv.nature.energyRecoveryFactor;
		}
		const skillValuePerTrigger = mainSkillBase * mainSkillFactor;
		const skillValue = skillValuePerTrigger * skillCount;
		const computeStrengthPerHelp = (): number => {
			return (ownStrengthPerHelp + 4 * this.teamMemberPerHelp) / 5;
		};

		const ingInRecipeStrengthRate =
			param.recipeBonus === 0
				? 1
				: (1 + param.recipeBonus / 100) *
					(1 + recipeLevelBonus[param.recipeLevel] / 100);
		const rawIngFactor = (1 + param.fieldBonus / 100) * bonus.dish;
		const ingFactor = (ingInRecipeStrengthRate * 0.8 + 0.2) * rawIngFactor;

		switch (mainSkill) {
			case "Charge Energy S":
			case "Charge Energy S (Moonlight)":
			case "Energizing Cheer S":
			case "Energy for Everyone S":
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			case "Energizing Cheer S (Heal Pulse)": {
				const bonus = skillLevel <= 2 ? 1 : skillLevel <= 5 ? 2 : 3;
				const helpCount =
					getSkillSubValue(mainSkill, skillLevel) +
					(param.latiTwins ? bonus : 0);
				const skillValuePerTrigger2 = helpCount;
				const skillValue2 = helpCount * skillCount;
				const skillStrength2 = skillValue2 * computeStrengthPerHelp() * 2;
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2,
					skillStrength2,
					skillValuePerTrigger2,
				};
			}
			case "Energy for Everyone S (Berry Juice)":
				// Use probability 20% at RaenonX
				// https://pks.raenonx.cc/en/mainskill/info/32
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: 0.2 * skillCount,
					skillStrength2: 0,
					skillValuePerTrigger2: 0.2,
				};
			case "Energy for Everyone S (Lunar Blessing)": {
				const ret = calculateBerryBurstStrength(
					this.iv,
					getBerryBurstTeam(this.iv, param),
					param,
					bonus.berryBurst,
					skillLevel,
				);
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: ret.total * skillCount,
					skillStrength2: ret.total * skillCount,
					skillValuePerTrigger2: ret.total,
				};
			}
			case "Dream Shard Magnet S":
			case "Dream Shard Magnet S (Random)":
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};

			case "Charge Strength M":
			case "Charge Strength M (Bad Dreams)":
			case "Charge Strength S":
			case "Charge Strength S (Random)":
			case "Charge Strength S (Stockpile)": {
				const strength = skillValue * (1 + param.fieldBonus / 100);
				return {
					skillValue: strength,
					skillStrength: strength,
					skillValuePerTrigger: mainSkillBase * (1 + param.fieldBonus / 100),
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			}

			case "Extra Helpful S":
				return {
					skillValue,
					skillStrength: skillValue * computeStrengthPerHelp(),
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};

			case "Helper Boost":
				return {
					skillValue,
					skillStrength: skillValue * computeStrengthPerHelp() * 5,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};

			case "Berry Burst (Disguise)": {
				const ret = calculateBerryBurstStrength(
					this.iv,
					getBerryBurstTeam(this.iv, param),
					param,
					bonus.berryBurst,
					skillLevel,
				);

				// Calculate great success
				// https://pks.raenonx.cc/en/docs/view/calc/main-skill#disguise
				const successRate = 1 - (1 - 0.18) ** (skillCount / days);

				const strength = ret.total * skillCount + ret.total * successRate * 2;
				return {
					skillValue: strength,
					skillStrength: strength,
					skillValuePerTrigger: ret.total, // great success is not included
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			}
			case "Berry Burst":
			case "Berry Burst (Draco Meteor)": {
				const ret = calculateBerryBurstStrength(
					this.iv,
					getBerryBurstTeam(this.iv, param),
					param,
					bonus.berryBurst,
					skillLevel,
				);
				return {
					skillValue: ret.total * skillCount,
					skillStrength: ret.total * skillCount,
					skillValuePerTrigger: ret.total,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			}

			case "Ingredient Magnet S (Plus)": {
				let ingCount = getSkillSubValue(
					mainSkill,
					skillLevel,
					this.pokemonIv.pokemon.ing1.name,
				);
				ingCount = Math.floor(
					ingCount * Math.max(bonus.ingredientMagnet, bonus.skillIngredient),
				);
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: ingCount * skillCount,
					skillStrength2:
						ingCount *
						ingredientStrength[this.iv.pokemon.ing1.name] *
						rawIngFactor *
						skillCount,
					skillValuePerTrigger2: ingCount,
				};
			}

			case "Ingredient Magnet S (Present)": {
				let candyCount = getSkillSubValue(mainSkill, skillLevel);
				candyCount =
					Math.floor(candyCount * bonus.ingredientMagnet) * presentCandyRate;
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: candyCount * skillCount,
					skillStrength2: 0,
					skillValuePerTrigger2: candyCount,
				};
			}

			case "Cooking Power-Up S (Minus)": {
				const energy = getSkillSubValue(mainSkill, skillLevel);
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: energy * skillCount,
					skillStrength2: 0,
					skillValuePerTrigger2: energy,
				};
			}

			case "Ingredient Magnet S":
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			case "Ingredient Draw S": {
				const averageStrength = getAverageIngredientDrawStrength(this.iv);
				return {
					skillValue: skillValue,
					skillStrength: skillValue * averageStrength * ingFactor,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			}
			case "Ingredient Draw S (Super Luck)": {
				const averageStrength = getAverageIngredientDrawStrength(this.iv);
				const baseShards = getSkillSubValue(mainSkill, skillLevel);
				const shardsPerSkill =
					(baseShards * superLuckShardRate +
						baseShards * 5 * superLuckShard5Rate) *
					bonus.ingredientDraw *
					bonus.dreamShard;
				return {
					skillValue: skillValue * superLuckIngRate,
					skillStrength:
						skillValue * superLuckIngRate * averageStrength * ingFactor,
					skillValuePerTrigger, // Dream shard is not included
					skillValue2: shardsPerSkill * skillCount,
					skillStrength2: 0,
					skillValuePerTrigger2: shardsPerSkill,
				};
			}
			case "Ingredient Draw S (Hyper Cutter)": {
				const averageStrength = getAverageIngredientDrawStrength(this.iv);
				return {
					skillValue: skillValue * (1 + hyperCutterSuccess),
					skillStrength:
						skillValue * averageStrength * ingFactor * (1 + hyperCutterSuccess),
					skillValuePerTrigger, // Additional ingredients are not included
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			}
			case "Cooking Power-Up S":
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			case "Tasty Chance S":
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			case "Metronome":
			case "Skill Copy":
			case "Skill Copy (Transform)":
			case "Skill Copy (Mimic)":
				// returns skillCount as skillValue.
				return {
					skillValue: skillCount,
					skillStrength: 0,
					skillValuePerTrigger: 1,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
			case "Cooking Assist S (Bulk Up)": {
				const skillValuePerTrigger2 = getSkillSubValue(mainSkill, skillLevel);
				return {
					skillValue,
					skillStrength: skillValue * averageIngredientStrength * rawIngFactor,
					skillValuePerTrigger,
					skillValue2: skillValuePerTrigger2 * skillCount,
					skillStrength2: 0,
					skillValuePerTrigger2,
				};
			}
			default:
				return {
					skillValue,
					skillStrength: 0,
					skillValuePerTrigger,
					skillValue2: 0,
					skillStrength2: 0,
					skillValuePerTrigger2: 0,
				};
		}
	}

	/**
	 * Calculates the current skill level based on the event bonus and parameters.
	 * @returns Current skill level.
	 */
	getSkillLevel(): number {
		const param = this.param;
		const maxSkillLevel = getMaxSkillLevel(this.iv.pokemon.skill);
		const bonus = this.bonusEffects;
		let skillLevel = Math.min(
			maxSkillLevel,
			this.iv.skillLevel + bonus.skillLevel,
		);
		if (param.maxSkillLevel) {
			skillLevel = maxSkillLevel;
		}
		return skillLevel;
	}

	/**
	 * Gets the BonusEffects for the current PokemonIv and StrengthParameter.
	 */
	get bonusEffects(): BonusEffectsWithReason {
		const param = this.param;

		if (this.isWhistle) {
			return {
				...emptyBonusEffects,
				skillTriggerReason: "none",
				skillLevelReason: "none",
				ingredientReason: "none",
			};
		}

		// event bonus
		const eventBonus = getEventBonus(param.event, param.customEventBonus);
		const targetEventBonus = getEventBonusIfTarget(
			param.event,
			param.customEventBonus,
			this.iv.pokemon,
		);

		// expert bonus
		const isExpertMode = isExpertField(param.fieldIndex);
		const isMainBerry =
			isExpertMode && param.favoriteType[0] === this.iv.pokemon.type;
		const isFavoriteBerry =
			isExpertMode && param.favoriteType.includes(this.iv.pokemon.type);
		const expertSkillLevel =
			isExpertMode && isMainBerry ? expertMainSkillLevelBonus : 0;
		const expertIngredientAdditionalEffect: 0 | 0.5 =
			isExpertMode &&
			isFavoriteBerry &&
			this.param.expertEffect === "ing" &&
			(this.iv.pokemon.specialty === "Ingredients" ||
				this.iv.pokemon.specialty === "All")
				? expertFavoriteIngredientAdditionalBonus
				: 0;
		const expertIngredient: 0 | 1 | 1.5 =
			isExpertMode && isFavoriteBerry && this.param.expertEffect === "ing"
				? ((expertFavoriteIngredientBonus + expertIngredientAdditionalEffect) as
						| 1
						| 1.5)
				: 0;
		const expertSkillTrigger =
			isExpertMode && isFavoriteBerry && this.param.expertEffect === "skill"
				? expertFavoriteSkillTriggerBonus
				: 1;

		// event bonus
		const eventSkillTrigger = targetEventBonus.skillTrigger;
		const eventSkillLevel = targetEventBonus.skillLevel;
		const eventIngredient = targetEventBonus.ingredient;

		return {
			skillTrigger: Math.max(expertSkillTrigger, eventSkillTrigger) as
				| 1
				| 1.25
				| 1.5,
			skillTriggerReason:
				expertSkillTrigger > eventSkillTrigger ? "ex" : "event",
			skillLevel: (expertSkillLevel + eventSkillLevel) as 0 | 1 | 2 | 3 | 5,
			skillLevelReason:
				expertSkillLevel * eventSkillLevel !== 0
					? "event+ex"
					: expertSkillLevel > 0
						? "ex"
						: "event",
			berry: targetEventBonus.berry,
			ingredient:
				expertIngredient > eventIngredient ? expertIngredient : eventIngredient,
			carryLimitAdd: targetEventBonus.carryLimitAdd,
			carryLimitMul: targetEventBonus.carryLimitMul,
			ingredientReason: expertIngredient > eventIngredient ? "ex" : "event",
			dreamShard: eventBonus.dreamShard,
			ingredientMagnet: eventBonus.ingredientMagnet,
			ingredientDraw: eventBonus.ingredientDraw,
			skillIngredient: eventBonus.skillIngredient,
			berryBurst: eventBonus.berryBurst,
			dish: eventBonus.dish,
			energyFromDish: eventBonus.energyFromDish,
			fixedBerries: targetEventBonus.fixedBerries,
			fixedAreas: targetEventBonus.fixedAreas,
		};
	}

	/**
	 * Gets the team member's total strength, computed via `param.teamMember`.
	 * The result is cached in `this.cache` so that it's calculated only once
	 * per shared cache object.
	 */
	private get teamMemberStrength(): number {
		if (this.cache.teamMemberStrength === undefined) {
			const result = new PokemonStrength(this.param.teamMember, {
				...this.param,
				addHelpingBonusEffect: false,
			}).calculateImpl();

			this.cache.teamMemberStrength = result.totalStrength;
		}
		return this.cache.teamMemberStrength ?? 0;
	}

	/**
	 * Gets the team member's strength per help, computed via
	 * `param.teamMember`. The result is cached in `this.cache` so that it's
	 * calculated only once per shared cache object.
	 */
	private get teamMemberPerHelp(): number {
		if (this.cache.teamMemberPerHelp === undefined) {
			const result = new PokemonStrength(this.param.teamMember, {
				...this.param,
				period: -1,
				addHelpingBonusEffect: false,
			}).calculateImpl();

			this.cache.teamMemberPerHelp = result.totalStrength;
		}
		return this.cache.teamMemberPerHelp ?? 0;
	}

	/**
	 * Gets the multiplier for berry strength.
	 */
	get berryStrengthBonus(): number {
		return calcBerryStrengthBonus(this.iv.pokemon.type, this.param);
	}

	/**
	 * Returns whether the Pokémon's berry is a favorite
	 * for the current field.
	 */
	get isFavoriteBerry(): boolean {
		if (this.param.fieldIndex === noFavoriteFieldIndex) {
			return false;
		}
		if (this.param.fieldIndex === allFavoriteFieldIndex) {
			return true;
		}

		const { types } = getCurrentFavoriteBerries(this.param);
		return types.includes(this.iv.pokemon.type);
	}
}

/**
 * Calculates the berry strength bonus multiplier for a given Pokémon type.
 */
export function calcBerryStrengthBonus(
	type: PokemonType,
	param: StrengthParameter,
): number {
	const isExpertMode = isExpertField(param.fieldIndex);
	if (
		isExpertMode &&
		param.expertEffect === "berry" &&
		param.favoriteType.includes(type)
	) {
		return expertFavoriteBerryBonus;
	}

	if (param.fieldIndex === noFavoriteFieldIndex) {
		return 1;
	}
	if (param.fieldIndex === allFavoriteFieldIndex) {
		return 2;
	}
	const { types } = getCurrentFavoriteBerries(param);
	return types.includes(type) ? 2 : 1;
}

/**
 * Checks if the given skill's strength is zero or not.
 *
 * Skills that return true have indirect effects or provide benefits that cannot
 * be directly converted to strength points (e.g., energy recovery, dream shards).
 *
 * @param skillName The name of the main skill to check.
 * @returns True if the skill's strength is calculated as 0 in the strength calculation.
 */
export function isSkillStrengthZero(skillName: MainSkillName): boolean {
	if (
		skillName === "Charge Energy S" ||
		skillName === "Charge Energy S (Moonlight)" ||
		skillName === "Energizing Cheer S" ||
		skillName === "Energizing Cheer S (Nuzzle)" ||
		skillName === "Energy for Everyone S" ||
		skillName === "Dream Shard Magnet S" ||
		skillName === "Dream Shard Magnet S (Random)" ||
		skillName === "Tasty Chance S" ||
		skillName === "Metronome" ||
		skillName === "Skill Copy" ||
		skillName === "Skill Copy (Transform)" ||
		skillName === "Skill Copy (Mimic)"
	) {
		return true;
	}
	return false;
}

/**
 * Get the average ingredient strength of the Pokémon's ingredients draw.
 * @param iv PokemonIv of the Pokémon.
 * @returns The average ingredient strength.
 */
export function getAverageIngredientDrawStrength(iv: PokemonIv): number {
	const ingredients = getIngredientDrawIngredients(iv.pokemon);
	const sum = ingredients.reduce(
		(sum, ing) => sum + ingredientStrength[ing],
		0,
	);
	return sum / ingredients.length;
}

/** Reason why the berry was set */
export type BerryReason = "set for event" | "set for field" | "random";

/**
 * Returns the current favorite berries and the reasons they were set.
 *
 * @param parameter - A StrengthParameter object.
 * @returns An object containing:
 *   - types: An array of Pokémon types.
 *   - reasons: An array of reasons explaining why each berry type was selected.
 *     Possible values:
 *       * "set for event" – Berry type was fixed by the current event.
 *       * "set for field" – Berry type was fixed based on the field index.
 *       * "random" – Berry type is randomly chosen (not fixed).
 */
export function getCurrentFavoriteBerries(parameter: StrengthParameter): {
	types: PokemonType[];
	reasons: BerryReason[];
} {
	const eventBonus = getEventBonus(parameter.event, parameter.customEventBonus);
	const eventFixedTypes = eventBonus.fixedBerries;
	const eventFixedAreas = eventBonus.fixedAreas;
	const defaultAreaBerries = getFavoriteBerries(parameter.fieldIndex);
	let types: PokemonType[] = [];
	let reasons: BerryReason[] = ["random", "random", "random"];
	if (
		eventFixedAreas.includes(parameter.fieldIndex) &&
		eventFixedTypes.length === 3
	) {
		// type is fixed by the current selected event
		for (let i = 0; i < 3; i++) {
			if (eventFixedTypes[i] === null) {
				reasons[i] = "random";
			} else {
				reasons[i] = "set for event";
			}
		}
		types = [...parameter.favoriteType];
	} else if (defaultAreaBerries.length === 3) {
		// type is fixed by the current area
		reasons = ["set for field", "set for field", "set for field"];
		types = defaultAreaBerries;
	} else {
		// type is selectable
		types = parameter.favoriteType;
	}
	return { types, reasons };
}

/**
 * Generates the Berry Burst team based on the current Pokémon and parameters.
 * @param iv The Pokémon with the Berry Burst skill.
 * @param param The strength parameters, including team settings.
 * @returns An array of Berry Burst team members.
 */
export function getBerryBurstTeam(
	iv: PokemonIv,
	param: StrengthParameter,
): BerryBurstTeam {
	// Return custom team if auto is disabled
	if (!param.berryBurstTeam.auto) {
		return {
			species: param.berryBurstTeam.species,
			members: param.berryBurstTeam.members,
		};
	}

	// Auto-generate team based on current Pokémon and preferences
	// 1. Use the same level as the current Pokémon
	const level = iv.level;

	// 2. Get the current favorite berry types
	const favoriteTypes = getCurrentFavoriteBerries(param).types;

	// 3. Exclude the current Pokémon's type from the favorite types
	const otherFavoriteTypes = favoriteTypes.filter(
		(type) => type !== iv.pokemon.type,
	);

	// 4. Select a healer type from the favorites (fallback to "psychic")
	const healerType =
		favoriteTypes.find(
			(type) => type === "psychic" || type === "electric" || type === "fairy",
		) ?? "psychic";

	// Return the generated team
	const members: BerryBurstTeamMember[] = [
		// Member 1: Same type as the current Pokémon
		{ type: iv.pokemon.type, level },

		// Member 2: First favorite type that isn't the same as the current type
		{
			type:
				otherFavoriteTypes.length > 0
					? otherFavoriteTypes[0]
					: favoriteTypes[0],
			level,
		},

		// Member 3: Steel-type (Aggron for ingredients or Magnezone to expand pot)
		{ type: "steel", level },

		// Member 4: Healer type
		{ type: healerType, level },
	];
	const species = members.filter((x) => x.type === iv.pokemon.type).length;
	return { species, members };
}

/**
 * Calculates the total Berry Burst strength for a Pokémon and its team.
 *
 * @param iv The Pokémon's IV and level information.
 * @param team The team member information.
 * @param param Additional parameters including team composition and config flags.
 * @param bonus Berry burst effect bonus.
 * @param skillLevel The skill level to use, overriding the default if necessary.
 * @returns An object containing:
 *   - `total`: Total Berry Burst strength from all team members.
 *   - `members`: Breakdown of each member’s contribution with:
 *       - `total`: Member's total contribution.
 *       - `perBerry`: Strength per berry for that member.
 *       - `count`: Number of berries contributed.
 *
 * @throws Error if the Pokémon’s main skill is not one of the supported types.
 */
export function calculateBerryBurstStrength(
	iv: PokemonIv,
	team: BerryBurstTeam,
	param: StrengthParameter,
	bonus: number,
	skillLevel?: number,
): {
	total: number;
	members: { total: number; perBerry: number; count: number }[];
} {
	const _skillLevel = skillLevel ?? iv.skillLevel;
	const skill =
		iv.pokemon.skill === "Versatile" ? "Berry Burst" : iv.pokemon.skill;

	// Get berry count
	// Bonus is ceiled.
	let myBerryCount: number, othersBerryCount: number;
	switch (skill) {
		case "Berry Burst":
		case "Berry Burst (Disguise)":
			myBerryCount = Math.ceil(bonus * getSkillValue(skill, _skillLevel));
			othersBerryCount = Math.ceil(
				bonus * getSkillSubValue(skill, _skillLevel),
			);
			break;
		case "Energy for Everyone S (Lunar Blessing)": {
			const cnt = getLunarBlessingBerryCount(_skillLevel, team.species);
			// NOTE: berry burst bonus is not applied to Lunar Blessing
			// in buncha berries week part 1, but it was applied in part 2
			myBerryCount = Math.ceil(bonus * cnt.myBerryCount);
			othersBerryCount = Math.ceil(bonus * cnt.othersBerryCount);
			break;
		}
		case "Berry Burst (Draco Meteor)": {
			const cnt = getDracoMeteorBerryCount(
				_skillLevel,
				team.species,
				param.latiTwins,
			);
			myBerryCount = Math.ceil(bonus * cnt.myBerryCount);
			othersBerryCount = Math.ceil(bonus * cnt.othersBerryCount);
			break;
		}
		default:
			throw new Error(`Invalid skill: ${iv.pokemon.skill}`);
	}

	// Get the Berry Burst team members (types and levels)
	const levels: number[] = [
		iv.level,
		team.members[0].level,
		team.members[1].level,
		team.members[2].level,
		team.members[3].level,
	];
	const types: PokemonType[] = [
		iv.pokemon.type,
		team.members[0].type,
		team.members[1].type,
		team.members[2].type,
		team.members[3].type,
	];
	const ret = {
		total: 0,
		members: [] as { total: number; perBerry: number; count: number }[],
	};
	for (let i = 0; i < 5; i++) {
		const perBerry = getBerryStrength(
			types[i],
			levels[i],
			param.fieldBonus,
			calcBerryStrengthBonus(types[i], param),
		);
		const count = i === 0 ? myBerryCount : othersBerryCount;
		const total = perBerry * count;
		ret.total += total;
		ret.members.push({ total, perBerry, count });
	}
	return ret;
}

/**
 * Calculates the total yield per help action over a given help count.
 *
 * @param param The strength-related parameters, including the period.
 * @param strength The Pokémon's strength stats, including IV.
 * @param result The current strength result containing bonus data.
 * @returns The total help yield over the specified period.
 */
export function getHelpYield(
	param: StrengthParameter,
	strength: PokemonStrength,
): number {
	// Bonus is always empty because we calculate based on regular help
	const rp = new PokemonRp(strength.pokemonIv);
	const bagUsagePerHelp = rp.iv.getBagUsagePerHelp();
	return bagUsagePerHelp * Math.abs(param.period);
}

/**
 * Calculates the number of helps required to reach the carry cap (999).
 *
 * @param strength The Pokémon's strength stats, including IV.
 * @param result The current strength result containing bonus data.
 * @returns The number of helps until the carry cap is reached.
 */
export function getHelpsForCap(
	strength: PokemonStrength,
	result: StrengthResult,
): number {
	// Bonus is always empty because we calculate based on regular help
	const rp = new PokemonRp(strength.pokemonIv);
	const bagUsagePerHelp = rp.iv.getBagUsagePerHelp();
	return (999 - result.carryLimit) / bagUsagePerHelp;
}

/**
 * Calculates the required number of 'Helper Boost' triggers needed
 * to reach the carry cap (999).
 *
 * @param param The strength-related parameters, including helper boost info.
 * @param strength The Pokémon's strength stats, including IV.
 * @param result The current strength result containing bonus data.
 * @returns The required helper boost value to reach the cap.
 */
export function getRequiredHelperBoost(
	param: StrengthParameter,
	strength: PokemonStrength,
	result: StrengthResult,
): number {
	const helps = getHelpsForCap(strength, result);
	const helperBoost = getSkillValue(
		"Helper Boost",
		param.helperBoostLevel,
		param.helperBoostSpecies,
	);
	return helps / helperBoost;
}

export default PokemonStrength;
