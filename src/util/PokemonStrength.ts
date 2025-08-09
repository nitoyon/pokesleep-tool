import pokemons from '../data/pokemons';
import { BonusEffects, getEventBonus, getEventBonusIfTarget } from '../data/events';
import { IngredientName, PokemonType, PokemonTypes
} from '../data/pokemons';
import fields from '../data/fields';
import events, { loadHelpEventBonus } from '../data/events';
import Energy, { EnergyParameter, EnergyResult } from './Energy';
import PokemonIv from './PokemonIv';
import PokemonRp, { ingredientStrength } from './PokemonRp';
import { getSkillValue, getSkillSubValue, getMaxSkillLevel } from './MainSkill';

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
     * Skill value got from the second skill effect.
     * If the skill is 'Dream Shard Magnet S', this value represents
     * the strength provided by the skill.
     * For other skills, this value is 0.
     */
    skillValue2: number;
    /** Strength got from the second skill effect */
    skillStrength2: number;
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
        const countRatio = param.period / 24;
        const energy = new Energy(this.iv).calculate(param);
        const notFullHelpCount = param.tapFrequency === 'none' ? 0 :
            (energy.helpCount.awake + energy.helpCount.asleepNotFull) * countRatio;
        const fullHelpCount = param.tapFrequency === 'none' ?
            (energy.helpCount.awake + energy.helpCount.asleepNotFull + energy.helpCount.asleepFull) * countRatio :
            energy.helpCount.asleepFull * countRatio;
        const bonus = this.bonusEffects;

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
        const ingEventAdd: number = (param.period !== 3 ? bonus.ingredient : 0);

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
        const berryCount = rp.berryCount;
        const berryRawStrength = rp.berryStrength;
        const berryStrength = Math.ceil(berryRawStrength * (1 + param.fieldBonus / 100));
        const berryTotalStrength = berryHelpCount * berryCount * berryStrength *
            this.berryStrengthBonus;

        // calc skill
        const skillRatio = energy.skillRatio;
        let skillCount = 0, skillValue = 0, skillStrength = 0;
        let skillValue2 = 0, skillStrength2 = 0;
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
            [skillValue, skillStrength, skillValue2, skillStrength2] =
                this.getSkillValueAndStrength(skillCount,
                    param, berryStrength, bonus);
        }

        const totalStrength = ingStrength + berryTotalStrength + skillStrength + skillStrength2;

        return {
            energy, totalStrength, notFullHelpCount, fullHelpCount,
            ingRatio, ingHelpCount, ingStrength, ing1, ing2, ing3, ingredients,
            berryRatio, berryHelpCount, berryCount, berryStrength, berryRawStrength, berryTotalStrength,
            skillRatio, skillCount, skillValue, skillStrength, skillValue2, skillStrength2,
        };
    }

    /**
     * Get skill value and skill strength.
     * @param skillCount Skill count.
     * @param param Strength paramter.
     * @param berryStrength Strength per berry (area bonus included).
     * @param bonus BonusEffects for this pokemon and StrengthParameter.
     * @returns [skillValue, skillStrength, skillValue2, skillStrength2].
     */
    getSkillValueAndStrength(skillCount: number, param: StrengthParameter,
        berryStrength: number, bonus: BonusEffects
    ): [number, number, number, number] {
        const mainSkill = this.iv.pokemon.skill;
        const skillLevel = this.getSkillLevel();

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
        const mainSkillValue = mainSkillBase * mainSkillFactor * skillCount;
        const strengthPerHelp = 300 * (1 + param.fieldBonus / 100);
        const berryWithFav = berryStrength * this.berryStrengthBonus;
        const strengthPerBerry = Math.ceil(100 * (1 + param.fieldBonus / 100));
        switch (mainSkill) {
            case "Charge Energy S":
            case "Charge Energy S (Moonlight)":
            case "Energizing Cheer S":
            case "Energy for Everyone S":
                return [mainSkillValue, 0, 0, 0];
            case "Energy for Everyone S (Lunar Blessing)":
                // asume same type species
                const selfCount = [7, 12, 17, 19, 24, 29][skillLevel - 1];
                const fromMember = [1, 1, 1, 2, 2, 2][skillLevel - 1];
                const skillStrength2 = (
                    selfCount * berryWithFav + fromMember * strengthPerBerry * 4
                ) * skillCount;
                return [mainSkillValue, 0, skillStrength2, skillStrength2];
            case "Dream Shard Magnet S":
            case "Dream Shard Magnet S (Random)":
                return [mainSkillValue, 0, 0, 0];

            case "Charge Strength M":
            case "Charge Strength M (Bad Dreams)":
            case "Charge Strength S":
            case "Charge Strength S (Random)":
            case "Charge Strength S (Stockpile)":
                const strength = mainSkillValue * (1 + param.fieldBonus / 100);
                return [strength, strength, 0, 0];

            case "Extra Helpful S":
                return [mainSkillValue, mainSkillValue * strengthPerHelp, 0, 0];

            case "Helper Boost":
                return [mainSkillValue, mainSkillValue * strengthPerHelp * 5, 0, 0];

            case "Berry Burst (Disguise)":
            case "Berry Burst":
                const extra = skillLevel <= 2 ? skillLevel : skillLevel - 1;
                const strengthBurst =  (
                    mainSkillValue * berryWithFav +
                    4 * strengthPerBerry * skillCount * extra
                );
                return [strengthBurst, strengthBurst, 0, 0];

            case "Ingredient Magnet S (Plus)":
                let ingCount = getSkillSubValue(mainSkill, skillLevel);
                ingCount = Math.floor(ingCount * bonus.ingredientMagnet);
                return [mainSkillValue, 0, ingCount * skillCount, 0];

            case "Cooking Power-Up S (Minus)":
                const energy = getSkillSubValue(mainSkill, skillLevel);
                return [mainSkillValue, 0, energy * skillCount, 0];

            case "Ingredient Magnet S":
            case "Ingredient Draw S":
            case "Ingredient Draw S (Super Luck)":
            case "Ingredient Draw S (Hyper Cutter)":
            case "Cooking Power-Up S":
            case "Tasty Chance S":
                return [mainSkillValue, 0, 0, 0];
            case "Metronome":
            case "Skill Copy":
            case "Skill Copy (Transform)":
            case "Skill Copy (Mimic)":
                // returns skillCount as skillValue.
                return [skillCount, 0, 0, 0];
            default:
                return [mainSkillValue, 0, 0, 0];
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
    get bonusEffects(): BonusEffects {
        const param = this.param;
        const eventBonus = getEventBonus(param.event, param.customEventBonus);
        const targetEventBonus = getEventBonusIfTarget(param.event, param.customEventBonus,
            this.iv.pokemon);
        
        return {
            skillTrigger: targetEventBonus?.skillTrigger ?? 1,
            skillLevel: targetEventBonus?.skillLevel ?? 0,
            ingredient: targetEventBonus?.ingredient ?? 0,
            dreamShard: eventBonus?.dreamShard ?? 1,
            ingredientMagnet: eventBonus?.ingredientMagnet ?? 1,
            ingredientDraw: eventBonus?.ingredientDraw ?? 1,
            dish: eventBonus?.dish ?? 1,
            energyFromDish: eventBonus?.energyFromDish ?? 0,
        } as BonusEffects;
    }

    /**
     * Gets the multiplier for berry strength.
     */
    get berryStrengthBonus(): number {
        return this.isFavoriteBerry ? 2 : 1;
    }

    /**
     * Returns whether the Pokémon's berry is a favorite
     * for the current field.
     */
    get isFavoriteBerry(): boolean {
        let types: PokemonType[] = [];
        const param = this.param;
        switch (param.fieldIndex) {
            case 0: types = param.favoriteType; break;
            case 1: types = ["water", "flying", "fairy"]; break;
            case 2: types = ["fire", "rock", "ground"]; break;
            case 3: types = ["ice", "dark", "normal"]; break;
            case 4: types = ["grass", "fighting", "psychic"]; break;
            case 5: types = ["electric", "ghost", "steel"]; break;
            case 6: types = ["dragon", "poison", "bug"]; break;
            case 7: types = param.favoriteType; break;
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
        mainBerryHelpingSpeedBonus: 10,
        mainBerryCarryLimitBonus: 10,
        nonFavoriteBerryHelpingSpeedPenalty: 10,
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
    if (typeof(json.mainBerryHelpingSpeedBonus) === "number" &&
        json.mainBerryHelpingSpeedBonus >= 0 &&
        json.mainBerryHelpingSpeedBonus <= 100) {
        ret.mainBerryHelpingSpeedBonus = json.mainBerryHelpingSpeedBonus;
    }
    if (typeof(json.mainBerryCarryLimitBonus) === "number" &&
        json.mainBerryCarryLimitBonus >= 0 &&
        json.mainBerryCarryLimitBonus <= 100) {
        ret.mainBerryCarryLimitBonus = json.mainBerryCarryLimitBonus;
    }
    if (typeof(json.nonFavoriteBerryHelpingSpeedPenalty) === "number" &&
        json.nonFavoriteBerryHelpingSpeedPenalty >= 0 &&
        json.nonFavoriteBerryHelpingSpeedPenalty <= 100) {
        ret.nonFavoriteBerryHelpingSpeedPenalty = json.nonFavoriteBerryHelpingSpeedPenalty;
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
