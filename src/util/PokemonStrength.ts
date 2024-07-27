import pokemons, {PokemonData} from '../data/pokemons';
import { IngredientName, PokemonType, PokemonTypes } from '../data/pokemons';
import fields from '../data/fields';
import Energy, { EnergyResult } from './Energy';
import PokemonIv from './PokemonIv';
import PokemonRp, { ingredientStrength } from './PokemonRp';
import { getSkillValue } from './MainSkill';

/**
 * Represents the parameter of PokemonStrength.calc.
 */
export interface CalculateParameter {
    /**
     * How many hours' worth of accumulated strength to calculate.
     *
     * 3: 3 hours, 24: one day, 168: one week
     */
    period: number;

    /** Field bonus */
    fieldBonus: number;

    /** Index of the current research area */
    fieldIndex: number;

    /** Snorlax's favorite berry on Greengrass Isle */
    favoriteType: PokemonType[];

    /**
     * The number of pokemon which has helping bonus sub-skill
     * in the team.
     */
    helpBonusCount: 0|1|2|3|4|5;

    /**
     * Energy restored by 'energy for all' main skill.
     */
    e4eEnergy: number;

    /**
     * Triggered count of 'Energy for all' main skill.
     */
    e4eCount: number;

    /**
     * The number of pokemon which has energy recovery bonus sub-skill
     * in the team.
     */
    recoveryBonusCount: 0|1|2|3|4|5;

    /**
     * If true, we assume that energy is always 100.
     */
    isEnergyAlwaysFull: boolean;

    /**
     * Sleep score of the sleep.
     */
    sleepScore: number;

    /** Whether good camp ticket is set or not */
    isGoodCampTicketSet: boolean;

    /** Pokemon level (0: current level, Others: specified level) */
    level: 0|10|25|30|50|55|60|75|100;

    /** Calculate with evolved Pokemon */
    evolved: boolean;

    /** Calculate with max skill level */
    maxSkillLevel: boolean;

    /** How often tap the pokemon */
    tapFrequency: "always"|"none";

    /**
     * Recipe bonus, which increases as the number of ingredients increases.
     */
    recipeBonus: number;

    /**
     * Average recipe level (1 - 55).
     */
    recipeLevel: 1|10|20|30|40|50|55;
}

/**
 * Represents the result of strength calculation.
 */
export interface CalculateResult {
    /** energy and help count */
    energy: EnergyResult;
    /** Total strength (berry + ingredient + skill) */
    totalStrength: number;

    /** Berry ratio */
    berryRatio: number;
    /** Berry help count */
    berryHelpCount: number;
    /** Berry count per help */
    berryCount: number;
    /** Strength per 1 berry */
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
    ing1: {name: IngredientName, count: number, strength: number};
    /** Ing2 name and count */
    ing2: {name: IngredientName, count: number, strength: number};
    /** Ing3 name and count */
    ing3: {name: IngredientName, count: number, strength: number}|undefined;
    /** Ing1 ~ Ing3 name, count, strength summary */
    ingredients: {name: IngredientName, count: number, strength: number}[];

    /** Skill ratio */
    skillRatio: number;
    /** Total skill count */
    skillCount: number;
    /**
     * Skill value got from the skillCount skill occurance
     * If skill is 'Dream Shard Magnet S', this value is the number of Dream Shards.
     */
    skillValue: number;
    /** Strength got from the skillCount skill occurance */
    skillStrength: number;
}

/** Recipe level bonus table  */
const recipeLevelBonus = {
    1: 0,
    10: 18,
    20: 35,
    30: 61,
    40: 96,
    50: 142,
    55: 171,
};

/**
 * Strength calculator
 */
class PokemonStrength {
    private iv: PokemonIv;
    private pokemon: PokemonData;

    constructor(iv: PokemonIv) {
        this.iv = iv;
        const pokemon = pokemons.find(x => x.name === iv.pokemonName);
        if (pokemon === undefined) {
            throw new Error(`Unknown name: ${iv.pokemonName}`);
        }
        this.pokemon = pokemon;
    }

    calculate(param: CalculateParameter): CalculateResult {
        const rp = new PokemonRp(this.iv);
        const level = rp.level;
        const countRatio = param.period / 24;
        const energy = new Energy(this.iv).calculate(param);
        const notFullHelpCount = (energy.helpCount.awake + energy.helpCount.asleepNotFull) *
            countRatio;
        const fullHelpCount = energy.helpCount.asleepFull * countRatio;

        // calc ingredient
        const ingInRecipeStrengthRatio = param.recipeBonus === 0 ? 1 :
            (1 + param.recipeBonus / 100) * (1 + recipeLevelBonus[param.recipeLevel] / 100);
        const ingStrengthRatio = (ingInRecipeStrengthRatio * 0.8 + 0.2) *
            (1 + param.fieldBonus / 100);
        const ingRatio = param.tapFrequency === 'none' ? 0 : rp.ingredientRatio;
        const ingHelpCount = notFullHelpCount * ingRatio;
        const ingUnlock = level < 30 ? 1 : level < 60 ? 2 : 3;
        const ingEventAdd: number = 0;

        const ing1 = {...rp.ingredient1, strength: 0};
        ing1.count = ingHelpCount * (1 / ingUnlock) * (ing1.count + ingEventAdd);
        ing1.strength = ingredientStrength[ing1.name] * ing1.count * ingStrengthRatio;

        const ing2 = {...rp.ingredient2, strength: 0};
        ing2.count = level < 30 ? 0 :
            ingHelpCount * (1 / ingUnlock) * (ing2.count + ingEventAdd);
            ing2.strength = ingredientStrength[ing2.name] * ing2.count * ingStrengthRatio;
        let ing3 = undefined;
        ing3 = {...rp.ingredient3, strength: 0};
        ing3.count = level < 60 ? 0 :
            ingHelpCount * (1 / ingUnlock) * (ing3.count + ingEventAdd);
        ing3.strength = ingredientStrength[ing3.name] * ing3.count * ingStrengthRatio;
        const ingStrength = ing1.strength + ing2.strength + ing3.strength;

        const ing: {[name: string]: {name: IngredientName, count: number, strength: number}} = {};
        const ingNames: IngredientName[] = [];
        ing[ing1.name] = {name: ing1.name, count: ing1.count, strength: ing1.strength};
        ingNames.push(ing1.name);
        if (ing2.count > 0) {
            if (!(ing2.name in ing)) {
                ing[ing2.name] = {name: ing2.name, count: 0, strength: 0};
                ingNames.push(ing2.name);
            }
            ing[ing2.name].count += ing2.count;
            ing[ing2.name].strength += ing2.strength;
        }
        if (ing3 !== undefined && ing3.count > 0) {
            if (!(ing3.name in ing)) {
                ing[ing3.name] = {name: ing3.name, count: 0, strength: 0};
                ingNames.push(ing3.name);
            }
            ing[ing3.name].count += ing3.count;
            ing[ing3.name].strength += ing3.strength;
        }
        const ingredients = ingNames.map(x => ing[x]);
    
        // calc berry
        const berryRatio = 1 - ingRatio;
        const berryHelpCount = (notFullHelpCount + fullHelpCount) - ingHelpCount;
        const berryCount = rp.berryCount;
        const berryStrength = rp.berryStrength;
        const berryTotalStrength = berryHelpCount * berryCount * berryStrength *
            (1 + param.fieldBonus / 100) * (this.isFavoriteBerry(param) ? 2 : 1);

        // calc skill
        const skillRatio = rp.skillRatio;
        let skillCount = 0, skillValue = 0, skillStrength = 0;
        if (param.period !== 3 && param.tapFrequency !== 'none') {
            const skillCountAwake = energy.helpCount.awake * skillRatio;
            const skillCountSleeping = energy.skillProbabilityAfterWakeup;
            skillCount = (skillCountAwake + skillCountSleeping) * countRatio;
            [skillValue, skillStrength] = this.getSkillValueAndStrength(skillCount,
                param);
        }

        const totalStrength = ingStrength + berryTotalStrength + skillStrength;

        return {
            energy, totalStrength,
            ingRatio, ingHelpCount, ingStrength, ing1, ing2, ing3, ingredients,
            berryRatio, berryHelpCount, berryCount, berryStrength, berryTotalStrength,
            skillRatio, skillCount, skillValue, skillStrength,
        };
    }

    getSkillValueAndStrength(skillCount: number, param: CalculateParameter): [number, number] {
        const mainSkill = this.iv.pokemon.skill;
        let skillLevel = this.iv.skillLevel;
        const mainSkillBase = getSkillValue(mainSkill, skillLevel);
        let mainSkillFactor = 1;
        if (mainSkill === "Charge Energy S") {
            mainSkillFactor = this.iv.nature.energyRecoveryFactor;
        }
        const mainSkillValue = mainSkillBase * mainSkillFactor * skillCount;
        const strengthPerHelp = 300 * (1 + param.fieldBonus / 100);
        switch (mainSkill) {
            case "Charge Energy S":
            case "Energizing Cheer S":
            case "Energy for Everyone S":
            case "Dream Shard Magnet S":
            case "Dream Shard Magnet S (Random)":
                return [mainSkillValue, 0];

            case "Charge Strength M":
            case "Charge Strength S":
            case "Charge Strength S (Random)":
                const strength = mainSkillValue * (1 + param.fieldBonus / 100);
                return [strength, strength];

            case "Extra Helpful S":
                return [mainSkillValue, mainSkillValue * strengthPerHelp];

            case "Helper Boost":
                return [mainSkillValue, mainSkillValue * strengthPerHelp * 5];

            case "Ingredient Magnet S":
            case "Cooking Power-Up S":
            case "Tasty Chance S":
            case "Metronome":
            default:
                return [mainSkillValue, 0];
        }
    }

    isFavoriteBerry(param: CalculateParameter): boolean {
        let types: PokemonType[] = [];
        switch (param.fieldIndex) {
            case 0: types = param.favoriteType; break;
            case 1: types = ["water", "flying", "fairy"]; break;
            case 2: types = ["fire", "rock", "ground"]; break;
            case 3: types = ["ice", "dark", "normal"]; break;
            case 4: types = ["grass", "fighting", "psychic"]; break;
            default: return false;
        }

        return types.includes(this.iv.pokemon.type);
    }
}

/**
 * Load CalculateParameter fron localStorage.
 * @returns Loaded parameter.
 */
export function loadCalculateParameter(): CalculateParameter {
    const ret: CalculateParameter = {
        period: 24,
        fieldBonus: 0,
        fieldIndex: -1,
        favoriteType: ["normal", "fire", "water"],
        helpBonusCount: 0,
        e4eEnergy: 18,
        e4eCount: 3,
        recoveryBonusCount: 0,
        isEnergyAlwaysFull: false,
        sleepScore: 100,
        isGoodCampTicketSet: false,
        level: 0,
        evolved: false,
        maxSkillLevel: false,
        tapFrequency: "always",
        recipeBonus: 25,
        recipeLevel: 30,
    };

    const settings = localStorage.getItem('PstStrenghParam');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.period) === "number" &&
        [24, 168, 3].includes(json.period)) {
        ret.period = json.period;
    }
    if (typeof(json.fieldBonus) === "number" &&
        Math.floor(json.fieldBonus / 5) === json.fieldBonus / 5 &&
        json.fieldBonus >= 0 && json.fieldBonus <= 60) {
        ret.fieldBonus = json.fieldBonus;
    }
    if (typeof(json.fieldIndex) === "number" &&
        Math.floor(json.fieldIndex) === json.fieldIndex &&
        json.fieldIndex >= -1 && json.fieldIndex < fields.length) {
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
        ret.recoveryBonusCount = json.recoveryBonusCount;
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
    if (typeof(json.recipeBonus) === "number" &&
        [0, 6, 11, 17, 25, 35, 48].includes(json.recipeBonus)) {
        ret.recipeBonus = json.recipeBonus;
    }
    if (typeof(json.recipeLevel) === "number" &&
        [1, 10, 20, 30, 40, 50, 55].includes(json.recipeLevel)) {
        ret.recipeLevel = json.recipeLevel;
    }
    return ret;
}

export default PokemonStrength;
