import { IngredientName } from "../data/pokemons";
import PokemonIv from './PokemonIv';
import {
    EnergyParameter, EnergyResult, AlwaysTap, NoTap, whistlePeriod,
} from './Energy';
import { BonusEffects } from '../data/events';

/**
 * Represents help count split by normal and sneaky snacking.
 */
export type NormalAndSnackingHelpCount = {
    /** Total help count (normal + sneakySnacking) */
    all: number;
    /** Help count stored in Pokemon's inventory */
    normal: number;
    /** Help count directly granted to Snorlax (all berries) */
    sneakySnacking: number;
};

/**
 * Represents the result of ingredient help calculation.
 */
export interface IngredientHelp {
    /** Ingredient name. */
    name: IngredientName;
    /** Ingredient count. */
    count: number;
    /** Ingredient count by single help */
    countPerHelp: number;
}

/**
 * Represents the help count breakdown by berry, ingredient, and skill.
 */
export interface HelpCountResult {
    /** Total help count during the specified period */
    total: NormalAndSnackingHelpCount;

    /** Berry rate */
    berryRate: number;
    /** Berry help count */
    berryHelpCount: number;
    /** Berry count per help */
    berryCount: number;
    /** Ingredient rate */
    ingRate: number;
    /** Ingredient help count */
    ingHelpCount: number;
    /** Ing1 name and count */
    ing1: IngredientHelp;
    /** Ing2 name and count */
    ing2: IngredientHelp;
    /** Ing3 name and count */
    ing3: IngredientHelp;
    /** Ing1 ~ Ing3 name, count */
    ingredients: IngredientHelp[];
    /** Skill rate */
    skillRate: number;
    /** Overall skill rate (with pity proc) */
    overallSkillRate: number;
    /** Total skill count */
    skillCount: number;
}

/**
 * Calculate help count for the given condition.
 *
 * @param iv The Pokémon with the Berry Burst skill.
 * @param param The strength parameters, including team settings.
 * @param energy The energy calculation result.
 * @param bonus The help bonus.
 * @param isWhistle 
 * @returns Help count calculated.
 */
export function calculateHelpCount(
    iv: PokemonIv,
    param: EnergyParameter,
    energy: EnergyResult,
    bonus: BonusEffects,
    isWhistle: boolean
): HelpCountResult {
    const level = iv.level;
    const countRate = Math.ceil(param.period / 24);
    const normal = param.period < 0 ? -param.period :
        param.tapFrequencyAwake === NoTap ? 0 :
        (energy.helpCount.awake + energy.helpCount.asleepNotFull) * countRate;
    const sneakySnacking = param.period < 0 ? 0 :
        param.tapFrequencyAwake === NoTap ?
        (energy.helpCount.awake + energy.helpCount.asleepNotFull + energy.helpCount.asleepFull) * countRate :
        energy.helpCount.asleepFull * countRate;

    // calc ingredient
    const ingRate = iv.ingredientRate;
    const ingHelpCount = normal * ingRate;
    const ingUnlock = 1 +
        (level >= 30 && iv.ingredient2.count > 0 ? 1 : 0) +
        (level >= 60 && iv.ingredient3.count > 0 ? 1 : 0);
    const ingEventAdd: number = (param.period !== whistlePeriod ? bonus.ingredient : 0);

    const ing1: IngredientHelp = {
        ...iv.ingredient1,
        countPerHelp: iv.ingredient1.count + ingEventAdd,
    };
    ing1.count = ingHelpCount * (1 / ingUnlock) * ing1.countPerHelp;

    const ing2: IngredientHelp = {
        ...iv.ingredient2,
        countPerHelp: iv.ingredient2.count + ingEventAdd,
    };
    ing2.count = level < 30 || ing2.count === 0 ? 0 :
        ingHelpCount * (1 / ingUnlock) * ing2.countPerHelp;

    const ing3 = {
        ...iv.ingredient3,
        countPerHelp: iv.ingredient3.count + ingEventAdd,
    };
    ing3.count = level < 60 || ing3.count === 0 ? 0 :
        ingHelpCount * (1 / ingUnlock) * ing3.countPerHelp;

    const ing: {[name: string]: IngredientHelp} = {};
    const ingNames: IngredientName[] = [];
    ing[ing1.name] = {...ing1};
    ingNames.push(ing1.name);
    if (ing2.count > 0) {
        if (!(ing2.name in ing)) {
            ing[ing2.name] = {name: ing2.name, count: 0, countPerHelp: 0 };
            ingNames.push(ing2.name);
        }
        ing[ing2.name].count += ing2.count;
        ing[ing2.name].countPerHelp += ing2.countPerHelp;
    }
    if (ing3 !== undefined && ing3.count > 0) {
        if (!(ing3.name in ing)) {
            ing[ing3.name] = {name: ing3.name, count: 0, countPerHelp: 0 };
            ingNames.push(ing3.name);
        }
        ing[ing3.name].count += ing3.count;
        ing[ing3.name].countPerHelp += ing3.countPerHelp;
    }
    const ingredients = ingNames.map(x => ing[x]);

    // calc berry
    const berryRate = iv.berryRate;
    const berryHelpCount = (normal + sneakySnacking) - ingHelpCount;
    const berryCount = iv.berryCount;

    // calc skill
    const skillRate = energy.skillRate;
    const overallSkillRate = energy.overallSkillRate;
    let skillCount = 0;
    if (param.period > 0 && !isWhistle && param.tapFrequencyAwake !== NoTap) {
        if (param.tapFrequencyAsleep === AlwaysTap) {
            const helpCount = energy.helpCount.awake + energy.helpCount.asleepNotFull;
            skillCount = helpCount * overallSkillRate * countRate;
        }
        else {
            const skillCountAwake = energy.helpCount.awake * overallSkillRate;
            const skillCountSleeping = energy.skillProbabilityAfterWakeup.once +
                energy.skillProbabilityAfterWakeup.twice * 2;
            skillCount = (skillCountAwake + skillCountSleeping) * countRate;
        }
    }

    return {
        total: {
            all: normal + sneakySnacking,
            normal,
            sneakySnacking,
        },

        berryRate, berryHelpCount, berryCount,
        ingRate, ingHelpCount, ing1, ing2, ing3, ingredients,
        skillRate, overallSkillRate, skillCount,
    }
}