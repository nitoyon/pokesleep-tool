import pokemons from '../data/pokemons';
import { BonusEffects, emptyBonusEffects, getEventBonus, getEventBonusIfTarget } from '../data/events';
import { IngredientName, PokemonType, PokemonTypes
} from '../data/pokemons';
import fields, { isExpertField, getFavoriteBerries } from '../data/fields';
import events, { loadHelpEventBonus } from '../data/events';
import Energy, { EnergyParameter, EnergyResult } from './Energy';
import PokemonIv from './PokemonIv';
import PokemonRp, { ingredientStrength } from './PokemonRp';
import { getSkillValue, getSkillSubValue, getMaxSkillLevel, getLunarBlessingBerryCount } from './MainSkill';

/** Pseudo field index where all berries are favorites */
export const allFavoriteFieldIndex = -2;

/** Pseudo field index where no berries are favorites */
export const noFavoriteFieldIndex = -1;

/** Represents the period value for "whistle" calculations in StrengthParameter. */
export const whistlePeriod = 0;

/** Expert mode effects */
export type ExpertEffects = "berry"|"ing"|"skill";

/** Expert mode effects list */
const ExpertEffectsList:Readonly<ExpertEffects[]> = ["berry", "ing", "skill"];

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
 * Represents the parameter of PokemonStrength.calc.
 */
export interface StrengthParameter extends EnergyParameter {
    /** Field bonus */
    fieldBonus: number;

    /** Pokemon level (0: current level, Others: specified level) */
    level: 0|10|25|30|50|55|60|75|100;

    /** Calculate with evolved Pokemon */
    evolved: boolean;

    /** Calculate with max skill level */
    maxSkillLevel: boolean;

    /**
     * Recipe bonus, which increases as the number of ingredients increases.
     */
    recipeBonus: number;

    /**
     * Average recipe level (1 - 65).
     */
    recipeLevel: 1|10|20|30|40|50|55|60|65;

    /** Skill level of the 'Helper Boost' skill */
    helperBoostLevel: number;

    /** Number of different species of same type Pokémon on the team */
    helperBoostSpecies: number;

    /** Berry burst team configuration */
    berryBurstTeam: {
        /** Whether to calculate automatically using the default team */
        auto: boolean,
        /**
         * Number of different Pokémon species of the same type on the team.
         *
         * - Used only when the main skill is "Energy for Everyone S (Lunar Blessing)".
         * - Ignored if `auto` is set to true.
         */
        species: number,
        /** Custom team members (0 - 4) */
        members: BerryBurstTeamMember[];
    },
}

/** Custom team member to calculate berry burst */
interface BerryBurstTeamMember {
    /** Berry type */
    type: PokemonType;
    /** Pokemon's level */
    level: number;
}

/**
 * Respresents the result of ingredient strength calculation.
 */
export interface IngredientStrength {
    /** Ingredient name. */
    name: IngredientName;
    /** Ingredient count. */
    count: number;
    /** Ingredient count by single help */
    helpCount: number;
    /** Ingredient strength. */
    strength: number;
}

/**
 * Represents the result of strength calculation.
 */
export interface StrengthResult {
    /** The bonus effect that was used to calculate this result */
    bonus: BonusEffectsWithReason;
    /** energy and help count */
    energy: EnergyResult;
    /** Total strength (berry + ingredient + skill) */
    totalStrength: number;

    /** Normal help count (not sneaky snacking) */
    notFullHelpCount: number;
    /** Sneaky snacking help count */
    fullHelpCount: number;

    /** Berry ratio */
    berryRatio: number;
    /** Berry help count */
    berryHelpCount: number;
    /** Berry count per help */
    berryCount: number;
    /** Strength per 1 berry (area bonus not included) */
    berryRawStrength: number;
    /** Strength per 1 berry (area bonus included) */
    berryStrength: number;
    /** Total strength gained by berry */
    berryTotalStrength: number;

    /** Ingredient ratio */
    ingRatio: number;
    /** Ingredient help count */
    ingHelpCount: number;
    /** Ingredient strength */
    ingStrength: number;
    /** Ing1 name and count */
    ing1: IngredientStrength;
    /** Ing2 name and count */
    ing2: IngredientStrength;
    /** Ing3 name and count */
    ing3: IngredientStrength|undefined;
    /** Ing1 ~ Ing3 name, count, strength summary */
    ingredients: IngredientStrength[];

    /** Skill ratio */
    skillRatio: number;
    /** Total skill count */
    skillCount: number;
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
     * If the skill is 'Dream Shard Magnet S', this value represents
     * the strength provided by the skill.
     * For other skills, this value is 0.
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
export const recipeLevelBonus = {
    1: 0,
    10: 18,
    20: 35,
    30: 61,
    40: 96,
    50: 142,
    55: 171,
    60: 203,
    65: 234,
};

/**
 * Represents BonusEffects and the source of each bonus.
 */
export interface BonusEffectsWithReason extends BonusEffects {
    /** The source of the skill trigger bonus (event or expert mode). */
    skillTriggerReason: 'event'|'ex'|'none';
    /** The source of the skill level bonus (event or expert mode). */
    skillLevelReason: 'event'|'ex'|'event+ex'|'none';
    /** The source of the ingredient bonus (event or expert mode). */
    ingredientReason: 'event'|'ex'|'none';
};

/**
 * Strength calculator
 */
class PokemonStrength {
    private iv: PokemonIv;
    private param: StrengthParameter;
    private isWhistle: boolean;

    constructor(iv: PokemonIv, param: StrengthParameter, decendantId?: number) {
        this.param = param;
        this.isWhistle = false;
        if (param.period === whistlePeriod) {
            this.isWhistle = true;
            this.param = {
                ...param,
                period: 3,
                isEnergyAlwaysFull: true,
                isGoodCampTicketSet: false,
                tapFrequency: 'always',
                tapFrequencyAsleep: 'always',
            };
        }

        this.iv = this.changePokemonIv(iv, decendantId);
        const pokemon = pokemons.find(x => x.name === iv.pokemonName);
        if (pokemon === undefined) {
            throw new Error(`Unknown name: ${iv.pokemonName}`);
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
        const settings =this.param;
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
        let showingPokemon = decendants.find(x => x.id === pokemonIv.pokemon.id);
        if (showingPokemon !== undefined) {
            // already evolved
            return pokemonIv;
        }

        // decendantId is given, select the pokemon
        showingPokemon = decendants.find(x => x.id === decendantId);
        if (showingPokemon === undefined) {
            // otherwise, use the first decendant
            showingPokemon = decendants[0];
        }
        if (showingPokemon.id !== pokemonIv.pokemon.id) {
            pokemonIv = pokemonIv.clone(showingPokemon.name);
        }
        return pokemonIv;
    }

    calculate(): StrengthResult {
        const param = this.param;
        const rp = new PokemonRp(this.iv);
        const level = rp.level;
        const countRatio = Math.ceil(param.period / 24);
        const bonus = this.bonusEffects;
        const energy = new Energy(this.iv).calculate(param, bonus, this.isWhistle);
        const notFullHelpCount = param.period < 0 ? -param.period :
            param.tapFrequency === 'none' ? 0 :
            (energy.helpCount.awake + energy.helpCount.asleepNotFull) * countRatio;
        const fullHelpCount = param.period < 0 ? 0 :
            param.tapFrequency === 'none' ?
            (energy.helpCount.awake + energy.helpCount.asleepNotFull + energy.helpCount.asleepFull) * countRatio :
            energy.helpCount.asleepFull * countRatio;

        // calc ingredient
        const ingInRecipeStrengthRatio = param.recipeBonus === 0 ? 1 :
            (1 + param.recipeBonus / 100) * (1 + recipeLevelBonus[param.recipeLevel] / 100);
        const ingStrengthRatio = (ingInRecipeStrengthRatio * 0.8 + 0.2) *
            (1 + param.fieldBonus / 100) * bonus.dish;
        const ingRatio = rp.ingredientRatio;
        const ingHelpCount = notFullHelpCount * ingRatio;
        const ingUnlock = 1 +
            (level >= 30 && rp.ingredient2.count > 0 ? 1 : 0) +
            (level >= 60 && rp.ingredient3.count > 0 ? 1 : 0);
        const ingEventAdd: number = (param.period !== whistlePeriod ? bonus.ingredient : 0);

        const ing1: IngredientStrength = {...rp.ingredient1, strength: 0,
            helpCount: rp.ingredient1.count + ingEventAdd};
        ing1.count = ingHelpCount * (1 / ingUnlock) * ing1.helpCount;
        ing1.strength = ingredientStrength[ing1.name] * ing1.count * ingStrengthRatio;

        const ing2 = {...rp.ingredient2, strength: 0,
            helpCount: rp.ingredient2.count + ingEventAdd};
        ing2.count = level < 30 || ing2.count === 0 ? 0 :
            ingHelpCount * (1 / ingUnlock) * ing2.helpCount;
            ing2.strength = ingredientStrength[ing2.name] * ing2.count * ingStrengthRatio;
        let ing3 = undefined;
        ing3 = {...rp.ingredient3, strength: 0,
            helpCount: rp.ingredient3.count + ingEventAdd};
        ing3.count = level < 60 || ing3.count === 0 ? 0 :
            ingHelpCount * (1 / ingUnlock) * ing3.helpCount;
        ing3.strength = ingredientStrength[ing3.name] * ing3.count * ingStrengthRatio;
        const ingStrength = ing1.strength + ing2.strength + ing3.strength;

        const ing: {[name: string]: IngredientStrength} = {};
        const ingNames: IngredientName[] = [];
        ing[ing1.name] = {...ing1};
        ingNames.push(ing1.name);
        if (ing2.count > 0) {
            if (!(ing2.name in ing)) {
                ing[ing2.name] = {name: ing2.name, count: 0, helpCount: 0, strength: 0};
                ingNames.push(ing2.name);
            }
            ing[ing2.name].count += ing2.count;
            ing[ing2.name].helpCount += ing2.helpCount;
            ing[ing2.name].strength += ing2.strength;
        }
        if (ing3 !== undefined && ing3.count > 0) {
            if (!(ing3.name in ing)) {
                ing[ing3.name] = {name: ing3.name, count: 0, helpCount: 0, strength: 0};
                ingNames.push(ing3.name);
            }
            ing[ing3.name].count += ing3.count;
            ing[ing3.name].helpCount += ing3.helpCount;
            ing[ing3.name].strength += ing3.strength;
        }
        const ingredients = ingNames.map(x => ing[x]);
    
        // calc berry
        const berryRatio = (this.iv.pokemon.frequency > 0 ? 1 - ingRatio : 0);
        const berryHelpCount = (notFullHelpCount + fullHelpCount) - ingHelpCount;
        const berryCount = rp.berryCount + bonus.berry;
        const berryRawStrength = rp.berryStrength;
        const berryStrength = Math.ceil(berryRawStrength * (1 + param.fieldBonus / 100));
        const berryTotalStrength = berryHelpCount * berryCount *
            Math.ceil(berryStrength * this.berryStrengthBonus);

        // calc skill
        const skillRatio = energy.skillRatio;
        let skillCount = 0, skillValue = 0, skillStrength = 0, skillValuePerTrigger = 0;
        let skillValue2 = 0, skillStrength2 = 0, skillValuePerTrigger2 = 0;
        if (param.period > whistlePeriod && param.tapFrequency !== 'none') {
            if (param.tapFrequencyAsleep === 'always') {
                const helpCount = energy.helpCount.awake + energy.helpCount.asleepNotFull;
                skillCount = helpCount * skillRatio * countRatio;
            }
            else {
                const skillCountAwake = energy.helpCount.awake * skillRatio;
                const skillCountSleeping = energy.skillProbabilityAfterWakeup.once +
                    energy.skillProbabilityAfterWakeup.twice * 2;
                skillCount = (skillCountAwake + skillCountSleeping) * countRatio;
            }
            ({skillValue, skillStrength, skillValuePerTrigger,
                skillValue2, skillStrength2, skillValuePerTrigger2} =
                this.getSkillValueAndStrength(skillCount, param, bonus));
        }

        const totalStrength = ingStrength + berryTotalStrength + skillStrength + skillStrength2;

        return {
            bonus, energy, totalStrength, notFullHelpCount, fullHelpCount,
            ingRatio, ingHelpCount, ingStrength, ing1, ing2, ing3, ingredients,
            berryRatio, berryHelpCount, berryCount, berryStrength, berryRawStrength, berryTotalStrength,
            skillRatio, skillCount, skillValue, skillStrength, skillValuePerTrigger,
            skillValue2, skillStrength2, skillValuePerTrigger2,
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
    getSkillValueAndStrength(skillCount: number,
        param: StrengthParameter,
        bonus: BonusEffects
    ): {
        skillValue: number,
        skillStrength: number,
        skillValuePerTrigger: number,
        skillValue2: number,
        skillStrength2: number,
        skillValuePerTrigger2: number,
     }
     {
        const mainSkill = this.iv.pokemon.skill;
        const skillLevel = this.getSkillLevel();
        const days = Math.ceil(param.period / 24);

        let mainSkillBase = getSkillValue(mainSkill, skillLevel);
        if (mainSkill.startsWith("Ingredient Magnet S")) {
            // This event bonus is floored.
            // (ref) https://pbs.twimg.com/media/GtEYoG3bEAACPG6?format=jpg&name=large
            mainSkillBase = Math.floor(mainSkillBase * bonus.ingredientMagnet);
        }
        if (mainSkill.startsWith("Ingredient Draw S")) {
            // This event bonus is floored(?)
            mainSkillBase = Math.floor(mainSkillBase * bonus.ingredientDraw);
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
        const strengthPerHelp = 300 * (1 + param.fieldBonus / 100);

        switch (mainSkill) {
            case "Charge Energy S":
            case "Charge Energy S (Moonlight)":
            case "Energizing Cheer S":
            case "Energy for Everyone S":
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };
            case "Energy for Everyone S (Lunar Blessing)": {
                const ret = calculateBerryBurstStrength(this.iv, param,
                    bonus.berryBurst, skillLevel);
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: ret.total * skillCount,
                    skillStrength2: ret.total * skillCount,
                    skillValuePerTrigger2: ret.total,
                };
            }
            case "Dream Shard Magnet S":
            case "Dream Shard Magnet S (Random)":
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };

            case "Charge Strength M":
            case "Charge Strength M (Bad Dreams)":
            case "Charge Strength S":
            case "Charge Strength S (Random)":
            case "Charge Strength S (Stockpile)":
                const strength = skillValue * (1 + param.fieldBonus / 100);
                return {
                    skillValue: strength,
                    skillStrength: strength,
                    skillValuePerTrigger: mainSkillBase * (1 + param.fieldBonus / 100),
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };

            case "Extra Helpful S":
                return {
                    skillValue,
                    skillStrength: skillValue * strengthPerHelp,
                    skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };

            case "Helper Boost":
                return {
                    skillValue,
                    skillStrength: skillValue * strengthPerHelp * 5,
                    skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };

            case "Berry Burst (Disguise)": {
                const ret = calculateBerryBurstStrength(this.iv, param,
                    bonus.berryBurst, skillLevel);

                // Calculate great success
                // https://pks.raenonx.cc/en/docs/view/calc/main-skill#disguise
                const successRate = 1 - Math.pow(1 - 0.18, skillCount / days);

                const strength = ret.total * skillCount + ret.total * successRate * 2;
                return {
                    skillValue: strength,
                    skillStrength: strength,
                    skillValuePerTrigger: ret.total, // great success is not included
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };
            }
            case "Berry Burst": {
                const ret = calculateBerryBurstStrength(this.iv, param,
                    bonus.berryBurst, skillLevel);
                return {
                    skillValue: ret.total * skillCount,
                    skillStrength: ret.total * skillCount,
                    skillValuePerTrigger: ret.total,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };
            }

            case "Ingredient Magnet S (Plus)":
                let ingCount = getSkillSubValue(mainSkill, skillLevel,
                    this.pokemonIv.pokemon.ing1.name);
                ingCount = Math.floor(ingCount * bonus.ingredientMagnet);
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: ingCount * skillCount,
                    skillStrength2: 0,
                    skillValuePerTrigger2: ingCount,
                };

            case "Cooking Power-Up S (Minus)":
                const energy = getSkillSubValue(mainSkill, skillLevel);
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: energy * skillCount,
                    skillStrength2: 0,
                    skillValuePerTrigger2: energy,
                };

            case "Ingredient Magnet S":
            case "Ingredient Draw S":
            case "Ingredient Draw S (Super Luck)":
            case "Ingredient Draw S (Hyper Cutter)":
            case "Cooking Power-Up S":
            case "Tasty Chance S":
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };
            case "Metronome":
            case "Skill Copy":
            case "Skill Copy (Transform)":
            case "Skill Copy (Mimic)":
                // returns skillCount as skillValue.
                return {
                    skillValue: skillCount, skillStrength: 0, skillValuePerTrigger: 1,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
                };
            default:
                return {
                    skillValue, skillStrength: 0, skillValuePerTrigger,
                    skillValue2: 0, skillStrength2: 0, skillValuePerTrigger2: 0,
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
        let skillLevel = Math.min(maxSkillLevel,
            this.iv.skillLevel + bonus.skillLevel);
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
                skillTriggerReason: 'none',
                skillLevelReason: 'none',
                ingredientReason: 'none',
            };
        }

        // event bonus
        const eventBonus = getEventBonus(param.event, param.customEventBonus);
        const targetEventBonus = getEventBonusIfTarget(param.event, param.customEventBonus,
            this.iv.pokemon);

        // expert bonus
        const isExpertMode = isExpertField(param.fieldIndex);
        const isMainBerry = isExpertMode &&
            (param.favoriteType[0] === this.iv.pokemon.type);
        const isFavoriteBerry = isExpertMode &&
            param.favoriteType.includes(this.iv.pokemon.type);
        const expertSkillLevel = (isExpertMode && isMainBerry ?
            expertMainSkillLevelBonus : 0);
        const expertIngredientAdditionalEffect = (isExpertMode && isFavoriteBerry &&
            this.param.expertEffect === "ing" &&
            this.iv.pokemon.specialty === "Ingredients" ?
            expertFavoriteIngredientAdditionalBonus : 0
        );
        const expertIngredient = (isExpertMode && isFavoriteBerry &&
            this.param.expertEffect === "ing" ?
            expertFavoriteIngredientBonus + expertIngredientAdditionalEffect :
            0);
        const expertSkillTrigger = (isExpertMode && isFavoriteBerry &&
            this.param.expertEffect === "skill" ?
            expertFavoriteSkillTriggerBonus : 1
        );

        // event bonus
        const eventSkillTrigger = targetEventBonus?.skillTrigger ?? 1;
        const eventSkillLevel = targetEventBonus?.skillLevel ?? 0;
        const eventIngredient = targetEventBonus?.ingredient ?? 0;

        return {
            skillTrigger: Math.max(expertSkillTrigger, eventSkillTrigger),
            skillTriggerReason: expertSkillTrigger > eventSkillTrigger ?
                'ex' : 'event',
            skillLevel: expertSkillLevel + eventSkillLevel,
            skillLevelReason: expertSkillLevel * eventSkillLevel !== 0 ? "event+ex" :
                expertSkillLevel > 0 ? "ex" : "event",
            berry: targetEventBonus?.berry ?? 0,
            ingredient: Math.max(expertIngredient, eventIngredient),
            ingredientReason: expertIngredient > eventIngredient ?
                'ex' : 'event',
            dreamShard: eventBonus?.dreamShard ?? 1,
            ingredientMagnet: eventBonus?.ingredientMagnet ?? 1,
            ingredientDraw: eventBonus?.ingredientDraw ?? 1,
            berryBurst: eventBonus?.berryBurst ?? 1,
            dish: eventBonus?.dish ?? 1,
            energyFromDish: eventBonus?.energyFromDish ?? 0,
        } as BonusEffectsWithReason;
    }

    /**
     * Gets the multiplier for berry strength.
     */
    get berryStrengthBonus(): number {
        const isExpertMode = isExpertField(this.param.fieldIndex);
        if(isExpertMode &&
            this.param.expertEffect === "berry" &&
            this.param.favoriteType.includes(this.iv.pokemon.type)) {
            return expertFavoriteBerryBonus;
        }

        return this.isFavoriteBerry ? 2 : 1;
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

        const {types} = getCurrentFavoriteBerries(this.param);
        return types.includes(this.iv.pokemon.type);
    }
}

/** Reason why the berry was set */
export type BerryReason = "set for event"|"set for field"|"random";

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
export function getCurrentFavoriteBerries(parameter: StrengthParameter):
    {
        types: PokemonType[],
        reasons: BerryReason[],
    }
{
    const eventBonus = getEventBonus(parameter.event, parameter.customEventBonus);
    const eventFixedTypes = eventBonus?.fixedBerries ?? [];
    const eventFixedAreas = eventBonus?.fixedAreas ?? [];
    const defaultAreaBerries = getFavoriteBerries(parameter.fieldIndex);
    let types: PokemonType[] = [];
    let reasons: BerryReason[] = ["random", "random", "random"];
    if (eventFixedAreas.includes(parameter.fieldIndex) &&
        eventFixedTypes.length === 3
    ) {
        // type is fixed by the current selected event
        for (let i = 0; i < 3; i++) {
            if (eventFixedTypes[i] === null) {
                reasons[i] = "random";
            }
            else {
                reasons[i] = "set for event";
            }
        }
        types = [...parameter.favoriteType];
    }
    else if (defaultAreaBerries.length === 3) {
        // type is fixed by the current area
        reasons = ["set for field", "set for field", "set for field"];
        types = defaultAreaBerries;
    }
    else {
        // type is selectable
        types = parameter.favoriteType;
    }
    return {types, reasons};
}

/**
 * Create a StrengthParameter from Partial<StrengthParameter>.
 * @param param The partial values to overwrite default values.
 * @returns The resulting StrengthParameter.
 */
export function createStrengthParameter(
    param: Partial<StrengthParameter>
): StrengthParameter {
    const defaultParameters: StrengthParameter = {
        period: 24,
        fieldBonus: 0,
        fieldIndex: noFavoriteFieldIndex,
        favoriteType: ["normal", "fire", "water"],
        helpBonusCount: 0,
        e4eEnergy: 18,
        e4eCount: 3,
        recoveryBonusCount: 0,
        isEnergyAlwaysFull: false,
        sleepScore: 100,
        isGoodCampTicketSet: false,
        expertEffect: "berry",
        event: 'none',
        level: 0,
        evolved: false,
        maxSkillLevel: false,
        tapFrequency: "always",
        tapFrequencyAsleep: "none",
        recipeBonus: 25,
        recipeLevel: 30,
        helperBoostLevel: 6,
        helperBoostSpecies: 4,
        berryBurstTeam: {
            auto: true,
            species: 3,
            members: [
                { type: "electric", level: 50 },
                { type: "water", level: 50 },
                { type: "bug", level: 50 },
                { type: "psychic", level: 50 },
            ],
        },
        customEventBonus: {
            target: {},
            effects: {
                berry: 0,
                skillTrigger: 1,
                skillLevel: 0,
                ingredient: 0,
                dreamShard: 1,
                ingredientMagnet: 1,
                ingredientDraw: 1,
                berryBurst: 1,
                dish: 1,
                energyFromDish: 0,
                fixedAreas: [],
                fixedBerries: [],
            }
        },
    };
    return { ...defaultParameters, ...param };
}

/**
 * Generates the Berry Burst team based on the current Pokémon and parameters.
 * @param iv The Pokémon with the Berry Burst skill.
 * @param param The strength parameters, including team settings.
 * @returns An array of Berry Burst team members.
 */
export function getBerryBurstTeam(
    iv: PokemonIv, param: StrengthParameter
): BerryBurstTeamMember[] {
    // Return custom team if auto is disabled
    if (!param.berryBurstTeam.auto) {
        return param.berryBurstTeam.members;
    }

    // Auto-generate team based on current Pokémon and preferences
    // 1. Use the same level as the current Pokémon
    const level = iv.level;

    // 2. Get the current favorite berry types
    const favoriteTypes = getCurrentFavoriteBerries(param).types;

    // 3. Exclude the current Pokémon's type from the favorite types
    const otherFavoriteTypes = favoriteTypes
        .filter(type => type !== iv.pokemon.type);

    // 4. Select a healer type from the favorites (fallback to "psychic")
    const healerType = favoriteTypes.find(type =>
        type === "psychic" || type === "electric" || type === "fairy"
    ) ?? "psychic";

    // Return the generated team
    return [
        // Member 1: Same type as the current Pokémon
        { type: iv.pokemon.type, level },

        // Member 2: First favorite type that isn't the same as the current type
        { type: otherFavoriteTypes.length > 0 ? otherFavoriteTypes[0] : favoriteTypes[0], level },

        // Member 3: Steel-type (Aggron for ingredients or Magnezone to expand pot)
        { type: "steel", level },

        // Member 4: Healer type
        { type: healerType, level },
    ];
}

/**
 * Calculates the total Berry Burst strength for a Pokémon and its team.
 *
 * @param iv The Pokémon's IV and level information.
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
export function calculateBerryBurstStrength(iv: PokemonIv, param: StrengthParameter,
    bonus: number, skillLevel?: number
):
{
    total: number,
    members: { total: number, perBerry: number, count: number}[],
} {
    const _skillLevel = skillLevel ?? iv.skillLevel;

    // Get berry count
    // Assuming that event bonus is floored.
    const team = getBerryBurstTeam(iv, param);
    let myBerryCount: number, othersBerryCount: number;
    switch (iv.pokemon.skill) {
        case "Berry Burst":
        case "Berry Burst (Disguise)":
            myBerryCount = Math.floor(bonus *
                getSkillValue(iv.pokemon.skill, _skillLevel));
            othersBerryCount = Math.floor(bonus *
                getSkillSubValue(iv.pokemon.skill, _skillLevel));
            break;
        case "Energy for Everyone S (Lunar Blessing)":
            const cnt = getLunarBlessingBerryCount(_skillLevel,
                param.berryBurstTeam.auto ?
                    team.filter(x => x.type === iv.pokemon.type).length :
                    param.berryBurstTeam.species);
            // NOTE: berry burst bonus is not applied to Lunar Blessing
            myBerryCount = Math.floor(cnt.myBerryCount);
            othersBerryCount = Math.floor(cnt.othersBerryCount);
            break;
        default:
            throw new Error(`Invalid skill: ${iv.pokemon.skill}`);
    }

    // Get the Berry Burst team members (types and levels)
    const levels: number[] = [
        iv.level, team[0].level, team[1].level, team[2].level, team[3].level,
    ];
    const types: PokemonType[] = [
        iv.pokemon.type, team[0].type, team[1].type, team[2].type, team[3].type,
    ];
    const ret = { total: 0, members: [] as { total: number, perBerry: number, count: number}[] };
    for (let i = 0; i < 5; i++) {
        const ivMember = new PokemonIv(pokemons.find(x => x.type === types[i])?.name ?? "Bulbasaur");
        ivMember.level = levels[i];
        const berryRawStrength = new PokemonRp(ivMember).berryStrength;
        const perBerry = Math.ceil(
            Math.ceil(berryRawStrength * (1 + param.fieldBonus / 100)) *
            new PokemonStrength(ivMember, param).berryStrengthBonus);
        const count = (i === 0 ? myBerryCount : othersBerryCount);
        const total = perBerry * count;
        ret.total += total;
        ret.members.push({ total, perBerry, count });
    }
    return ret;
}

/**
 * Load StrengthParameter fron localStorage.
 * @returns Loaded parameter.
 */
export function loadStrengthParameter(): StrengthParameter {
    const ret: StrengthParameter = createStrengthParameter({});

    const settings = localStorage.getItem('PstStrenghParam');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.period) === "number" &&
        [1, 3, 8, 16, 24, 168, whistlePeriod, -10, -30, -100].includes(json.period)) {
        ret.period = json.period;
    }
    if (typeof(json.fieldBonus) === "number" &&
        Math.floor(json.fieldBonus / 5) === json.fieldBonus / 5 &&
        json.fieldBonus >= 0 && json.fieldBonus <= 100) {
        ret.fieldBonus = json.fieldBonus;
    }
    if (typeof(json.fieldIndex) === "number" &&
        Math.floor(json.fieldIndex) === json.fieldIndex &&
        json.fieldIndex >= allFavoriteFieldIndex && json.fieldIndex < fields.length) {
        ret.fieldIndex = json.fieldIndex;
    }
    if (Array.isArray(json.favoriteType) &&
        json.favoriteType.length === 3 &&
        json.favoriteType.every((x: PokemonType) => PokemonTypes.includes(x))) {
        ret.favoriteType = json.favoriteType;
    }
    if (typeof(json.helpBonusCount) === "number" &&
        Math.floor(json.helpBonusCount) === json.helpBonusCount &&
        json.helpBonusCount >= 0 && json.helpBonusCount <= 4) {
        ret.helpBonusCount = json.helpBonusCount;
    }
    if (typeof(json.isGoodCampTicketSet) === "boolean") {
        ret.isGoodCampTicketSet = json.isGoodCampTicketSet;
    }
    if (typeof(json.expertEffect) === "string" &&
        ExpertEffectsList.includes(json.expertEffect)) {
        ret.expertEffect = json.expertEffect;
    }

    if (typeof(json.level) === "number" &&
        [0, 10, 25, 30, 50, 55, 60, 75, 100].includes(json.level)) {
        ret.level = json.level;
    }
    if (typeof(json.evolved) === "boolean") {
        ret.evolved = json.evolved;
    }
    if (typeof(json.maxSkillLevel) === "boolean") {
        ret.maxSkillLevel = json.maxSkillLevel;
    }
    if (typeof(json.e4eEnergy) === "number" &&
        [5, 7, 9, 11, 15, 18].includes(json.e4eEnergy)) {
        ret.e4eEnergy = json.e4eEnergy;
    }
    if (typeof(json.e4eCount) === "number" &&
        json.e4eCount >= 0 && json.e4eCount <= 10) {
        ret.e4eCount = json.e4eCount;
    }
    if (typeof(json.recoveryBonusCount) === "number" &&
        json.recoveryBonusCount >= 0 && json.recoveryBonusCount <= 5) {
        ret.recoveryBonusCount = Math.min(json.recoveryBonusCount, 4) as 0|1|2|3|4;
    }
    if (typeof(json.isEnergyAlwaysFull) === "boolean") {
        ret.isEnergyAlwaysFull = json.isEnergyAlwaysFull;
    }
    if (typeof(json.sleepScore) === "number" &&
        0 <= json.sleepScore && json.sleepScore <= 100) {
        ret.sleepScore = json.sleepScore;
    }
    if (typeof(json.tapFrequency) === "string" &&
        ["always", "none"].includes(json.tapFrequency)) {
        ret.tapFrequency = json.tapFrequency;
    }
    if (typeof(json.tapFrequencyAsleep) === "string" &&
        ["always", "none"].includes(json.tapFrequencyAsleep)) {
        ret.tapFrequencyAsleep = json.tapFrequencyAsleep;
    }
    if (typeof(json.recipeBonus) === "number" &&
        [0, 6, 11, 17, 19, 20, 25, 35, 48, 61].includes(json.recipeBonus)) {
        if (json.recipeBonus === 6 || json.recipeBonus === 11) { json.recipeBonus = 19; }
        if (json.recipeBonus === 17) { json.recipeBonus = 21; }
        ret.recipeBonus = json.recipeBonus;
    }
    if (typeof(json.recipeLevel) === "number" &&
        [1, 10, 20, 30, 40, 50, 55, 60, 65].includes(json.recipeLevel)) {
        ret.recipeLevel = json.recipeLevel;
    }
    if (typeof(json.helperBoostLevel) === "number" &&
        json.helperBoostLevel > 0 &&
        json.helperBoostLevel <= getMaxSkillLevel('Helper Boost')
    ) {
        ret.helperBoostLevel = json.helperBoostLevel;
    }
    if (typeof(json.helperBoostSpecies) === "number" &&
        json.helperBoostSpecies > 0 &&
        json.helperBoostSpecies <= 6
    ) {
        ret.helperBoostSpecies = json.helperBoostSpecies;
    }
    if (typeof(json.recipeLevel) === "number" &&
        [1, 10, 20, 30, 40, 50, 55, 60, 65].includes(json.recipeLevel)) {
        ret.recipeLevel = json.recipeLevel;
    }

    if (typeof(json.berryBurstTeam) === "object") {
        if (typeof(json.berryBurstTeam.auto) === "boolean") {
            ret.berryBurstTeam.auto = json.berryBurstTeam.auto;
        }
        if (Array.isArray(json.berryBurstTeam.members)) {
            for (let i = 0; i < 4; i++) {
                if (typeof(json.berryBurstTeam.members[i]) !== "object") {
                    continue;
                }
                if (PokemonTypes.includes(json.berryBurstTeam.members[i].type)) {
                    ret.berryBurstTeam.members[i].type = json.berryBurstTeam.members[i].type;
                }
                if (json.berryBurstTeam.members[i].level > 0 &&
                    json.berryBurstTeam.members[i].level <= 100) {
                    ret.berryBurstTeam.members[i].level = json.berryBurstTeam.members[i].level;
                }
            }
        }
    }

    const eventNames = events.bonus.map(x => x.name);
    if (typeof(json.event) === "string" &&
        ["none", "custom", ...eventNames].includes(json.event)) {
        ret.event = json.event;
    }

    if (typeof(json.customEventBonus) === "object") {
        ret.customEventBonus = loadHelpEventBonus(json.customEventBonus);
    }
    return ret;
}

export default PokemonStrength;
