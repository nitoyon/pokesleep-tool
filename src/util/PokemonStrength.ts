import pokemons from '../data/pokemons';
import { BonusEffects, getEventBonus, getEventBonusIfTarget } from '../data/events';
import { IngredientName, getDecendants, PokemonType, PokemonTypes
} from '../data/pokemons';
import fields from '../data/fields';
import events, { loadHelpEventBonus } from '../data/events';
import Energy, { EnergyParameter, EnergyResult } from './Energy';
import PokemonIv from './PokemonIv';
import PokemonRp, { ingredientStrength } from './PokemonRp';
import { getSkillValue, getMaxSkillLevel } from './MainSkill';

/**
 * Represents the parameter of PokemonStrength.calc.
 */
export interface StrengthParameter extends EnergyParameter {
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
     * Average recipe level (1 - 60).
     */
    recipeLevel: 1|10|20|30|40|50|55|60;
}

/**
 * Represents the result of strength calculation.
 */
export interface StrengthResult {
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
    60: 203,
};

/**
 * Strength calculator
 */
class PokemonStrength {
    private iv: PokemonIv;
    private param: StrengthParameter;

    constructor(iv: PokemonIv, param: StrengthParameter, decendantId?: number) {
        this.param = param;
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
        // change skill level if `maxSkillLevel` is specified
        if (settings.maxSkillLevel) {
            pokemonIv = pokemonIv.clone();
            pokemonIv.skillLevel = 10;
            pokemonIv.normalize();
        }

        // evolve the pokemon if `evolved` is specified
        if (!settings.evolved) {
            return pokemonIv;
        }

        // Change pokemon
        const decendants = getDecendants(pokemonIv.pokemon);
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
        const countRatio = param.period / 24;
        const energy = new Energy(this.iv).calculate(param);
        const notFullHelpCount = (energy.helpCount.awake + energy.helpCount.asleepNotFull) *
            countRatio;
        const fullHelpCount = energy.helpCount.asleepFull * countRatio;
        const eventBonus = getEventBonus(param.event, param.customEventBonus);
        const targetEventBonus = getEventBonusIfTarget(param.event, param.customEventBonus,
            this.iv.pokemon);

        // calc ingredient
        const ingInRecipeStrengthRatio = param.recipeBonus === 0 ? 1 :
            (1 + param.recipeBonus / 100) * (1 + recipeLevelBonus[param.recipeLevel] / 100);
        const ingStrengthRatio = (ingInRecipeStrengthRatio * 0.8 + 0.2) *
            (1 + param.fieldBonus / 100) * (eventBonus?.dish ?? 1);
        const ingRatio = param.tapFrequency === 'none' ? 0 : rp.ingredientRatio;
        const ingHelpCount = notFullHelpCount * ingRatio;
        const ingUnlock = 1 +
            (level >= 30 && rp.ingredient2.count > 0 ? 1 : 0) +
            (level >= 60 && rp.ingredient3.count > 0 ? 1 : 0);
        const ingEventAdd: number = (param.period !== 3 ? targetEventBonus?.ingredient ?? 0 : 0);

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
        const berryRatio = (this.iv.pokemon.frequency > 0 ? 1 - ingRatio : 0);
        const berryHelpCount = (notFullHelpCount + fullHelpCount) - ingHelpCount;
        const berryCount = rp.berryCount;
        const berryStrength = rp.berryStrength;
        const berryTotalStrength = berryHelpCount * berryCount * berryStrength *
            (1 + param.fieldBonus / 100) * (this.isFavoriteBerry(param) ? 2 : 1);

        // calc skill
        const skillRatio = rp.skillRatio * (targetEventBonus?.skillTrigger ?? 1);
        let skillCount = 0, skillValue = 0, skillStrength = 0;
        if (param.period !== 3 && param.tapFrequency !== 'none') {
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
            [skillValue, skillStrength] = this.getSkillValueAndStrength(skillCount,
                param, berryStrength, eventBonus);
        }

        const totalStrength = ingStrength + berryTotalStrength + skillStrength;

        return {
            energy, totalStrength,
            ingRatio, ingHelpCount, ingStrength, ing1, ing2, ing3, ingredients,
            berryRatio, berryHelpCount, berryCount, berryStrength, berryTotalStrength,
            skillRatio, skillCount, skillValue, skillStrength,
        };
    }

    /**
     * Get skill value and skill strength.
     * @param skillCount Skill count.
     * @param param Strength paramter.
     * @param berryStrength Strength per berry.
     * @param eventBonus Event bonus or undefined.
     * @returns [skillValue, skillStrength].
     * If skill is 'Dream Shard Magnet S', `skillValue` is the number of Dream Shards.
     * `skillStrength` is the strength got by the skill.
     */
    getSkillValueAndStrength(skillCount: number, param: StrengthParameter,
        berryStrength: number, eventBonus: Partial<BonusEffects>|undefined
    ): [number, number] {
        const mainSkill = this.iv.pokemon.skill;
        let skillLevel = this.iv.skillLevel;
        if (eventBonus !== undefined) {
            const maxSkillLevel = getMaxSkillLevel(mainSkill);
            skillLevel = Math.min(maxSkillLevel,
                this.iv.skillLevel + (eventBonus.skillLevel ?? 0));
        }
        const mainSkillBase = getSkillValue(mainSkill, skillLevel);
        let mainSkillFactor = 1;
        if (mainSkill === "Charge Energy S") {
            mainSkillFactor = this.iv.nature.energyRecoveryFactor;
        }
        const mainSkillValue = mainSkillBase * mainSkillFactor * skillCount;
        const strengthPerHelp = 300 * (1 + param.fieldBonus / 100);
        const berryWithFav = berryStrength * (this.isFavoriteBerry(param) ? 2 : 1);
        const strengthPerBerry = 100;
        switch (mainSkill) {
            case "Charge Energy S":
            case "Charge Energy S (Moonlight)":
            case "Energizing Cheer S":
            case "Energy for Everyone S":
                return [mainSkillValue, 0];
            case "Energy for Everyone S (Lunar Blessing)":
                // asume same type species
                const selfCount = [7, 12, 17, 19, 24, 29][skillLevel - 1];
                const fromMember = [1, 1, 1, 2, 2, 2][skillLevel - 1];
                const skillStrength = (1 + param.fieldBonus / 100) * (
                    selfCount * berryWithFav + fromMember * strengthPerBerry * 4
                ) * skillCount;
                return [mainSkillValue, skillStrength];
            case "Dream Shard Magnet S":
            case "Dream Shard Magnet S (Random)":
                return [mainSkillValue * (eventBonus?.dreamShard ?? 1), 0];

            case "Charge Strength M":
            case "Charge Strength M (Bad Dreams)":
            case "Charge Strength S":
            case "Charge Strength S (Random)":
            case "Charge Strength S (Stockpile)":
                const strength = mainSkillValue * (1 + param.fieldBonus / 100);
                return [strength, strength];

            case "Extra Helpful S":
                return [mainSkillValue, mainSkillValue * strengthPerHelp];

            case "Helper Boost":
                return [mainSkillValue, mainSkillValue * strengthPerHelp * 5];

            case "Berry Burst (Disguise)":
            case "Berry Burst":
                const extra = skillLevel <= 2 ? skillLevel : skillLevel - 1;
                const strengthBurst =  (1 + param.fieldBonus / 100) * (
                    mainSkillValue * berryWithFav +
                    4 * strengthPerBerry * skillCount * extra
                );
                return [strengthBurst, strengthBurst];

            case "Ingredient Magnet S":
                return [mainSkillValue * (eventBonus?.ingredientMagnet ?? 1), 0];
            case "Ingredient Draw S":
            case "Ingredient Draw S (Super Luck)":
                return [mainSkillValue * (eventBonus?.ingredientDraw ?? 1), 0];
            case "Cooking Power-Up S":
            case "Tasty Chance S":
            case "Metronome":
            default:
                return [mainSkillValue, 0];
        }
    }

    isFavoriteBerry(param: StrengthParameter): boolean {
        let types: PokemonType[] = [];
        switch (param.fieldIndex) {
            case 0: types = param.favoriteType; break;
            case 1: types = ["water", "flying", "fairy"]; break;
            case 2: types = ["fire", "rock", "ground"]; break;
            case 3: types = ["ice", "dark", "normal"]; break;
            case 4: types = ["grass", "fighting", "psychic"]; break;
            case 5: types = ["electric", "ghost", "steel"]; break;
            default: return false;
        }

        return types.includes(this.iv.pokemon.type);
    }
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
        fieldIndex: -1,
        favoriteType: ["normal", "fire", "water"],
        helpBonusCount: 0,
        e4eEnergy: 18,
        e4eCount: 3,
        recoveryBonusCount: 0,
        isEnergyAlwaysFull: false,
        sleepScore: 100,
        isGoodCampTicketSet: false,
        event: 'none',
        level: 0,
        evolved: false,
        maxSkillLevel: false,
        tapFrequency: "always",
        tapFrequencyAsleep: "none",
        recipeBonus: 25,
        recipeLevel: 30,
        customEventBonus: {
            target: {},
            effects: {
                skillTrigger: 1,
                skillLevel: 0,
                ingredient: 0,
                dreamShard: 1,
                ingredientMagnet: 1,
                ingredientDraw: 1,
                dish: 1,
                energyFromDish: 0,
            }
        },
    };
    return { ...defaultParameters, ...param };
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
        [24, 168, 3].includes(json.period)) {
        ret.period = json.period;
    }
    if (typeof(json.fieldBonus) === "number" &&
        Math.floor(json.fieldBonus / 5) === json.fieldBonus / 5 &&
        json.fieldBonus >= 0 && json.fieldBonus <= 100) {
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
        [1, 10, 20, 30, 40, 50, 55, 60].includes(json.recipeLevel)) {
        ret.recipeLevel = json.recipeLevel;
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
