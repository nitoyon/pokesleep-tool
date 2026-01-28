import events_ from './event.json';
import { PokemonData, PokemonSpecialty, PokemonType, PokemonTypes,
    SpecialtyNames
 } from './pokemons';

/**
 * Represents drowsy event data.
 */
export class DrowsyEventData {
    /** Event name (English) */
    name: string;
    /** Target date */
    day: Date;
    /** Event bonus for drowsy power */
    bonus: number;

    /** Get start date. */
    get startDate(): Date {
        return new Date(this.day.getFullYear(), this.day.getMonth(),
            this.day.getDate(), 4, 0, 0);
    }

    /** Get end date. */
    get endDate(): Date {
        const time = this.startDate.getTime();
        return new Date(time + 24 * 60 * 60 * 1000);
    }

    /**
     * Initialize EventData object.
     * @param data JSON data.
     */
    constructor(data: JsonDrowsyEventData) {
        this.day = new Date(data.day);
        this.name = data.name;
        this.bonus = data.bonus;
    }

    /**
     * Returns whether the event is in progress.
     * @param date Checked date.
     * @returns In progress or not.
     */
    isInProgress(date: Date): boolean {
        return this.startDate <= date && date < this.endDate;
    }
}

/**
 * Represents bonus event data.
 */
export class BonusEventData {
    /** Event name (English) */
    name: string;
    /** Start date */
    start: Date;
    /** End date */
    end: Date;
    /** Target pokemon */
    target: Partial<TargetPokemon>;
    /** Bonus effects to be triggered */
    effects: BonusEffects;

    /**
     * Initialize BonusEventData object.
     * @param data JSON data.
     */
    constructor(data: JsonBonusEventData) {
        this.name = data.name;
        this.start = new Date(data.start);
        this.end = new Date(data.end);
        this.target = data.target;
        this.effects = fillBonusEffects(data.effects);
    }

    /**
     * Returns whether the event is finished or not.
     * @param date Checked date.
     * @returns In progress or not.
     */
    isFinished(date: Date): boolean {
        return date >= this.end;
    }

    /**
     * Determines whether the given Pokémon is a target.
     * @param pokemon The Pokémon to be tested.
     * @returns `true` if the Pokémon is a target, otherwise `false`.
     */
    isTarget(pokemon: PokemonData): boolean {
       if (this.target?.specialty !== undefined &&
            pokemon.specialty !== this.target.specialty &&
            pokemon.specialty !== "All"
        ) {
            return false;
        }
        if (this.target?.type !== undefined &&
            !this.target.type.includes(pokemon.type)) {
            return false;
        }
        return true;
    }
}

/**
 * Returns the bonus effects with the default values filled in.
 * @param data Partial BonusEffects object.
 * @returns Filled BonusEffects object.
 */
export function fillBonusEffects(data: Partial<BonusEffects>): BonusEffects {
    return {
        skillTrigger: data.skillTrigger ?? 1,
        skillLevel: data.skillLevel ?? 0,
        berry: data.berry ?? 0,
        ingredient: data.ingredient ?? 0,
        dreamShard: data.dreamShard ?? 1,
        ingredientMagnet: data.ingredientMagnet ?? 1,
        ingredientDraw: data.ingredientDraw ?? 1,
        skillIngredient: data.skillIngredient ?? 1,
        berryBurst: data.berryBurst ?? 1,
        dish: data.dish ?? 1,
        energyFromDish: data.energyFromDish ?? 0,
        fixedBerries: data.fixedBerries ?? [],
        fixedAreas: data.fixedAreas ?? [],
    };
}

/**
 * 
 * @param date Date to be checked.
 * @param overrideEvents Events. If not specified, default events is used. 
 * @returns Bonus value.
 */
export function getDrowsyBonus(date: Date, overrideEvents?: DrowsyEventData[]): number {
    const evts = overrideEvents ?? events.drowsy;
    for (const event of evts) {
        if (event.isInProgress(date)) {
            return event.bonus;
        }
    }
    return 1;
}

/**
 * Get active help bonus to be held.
 * @param date Date to be checked.
 * @param overrideEvents Events. If not specified, default events is used. 
 * @returns Active events.
 */
export function getActiveHelpBonus(date: Date,
    overrideEvents?: BonusEventData[]): BonusEventData[] {
    const evts = overrideEvents ?? events.bonus;
    return evts.filter(x => !x.isFinished(date));
}

/**
 * Get event bonus for the given event name and pokemon.
 * @param name Event name.
 * @returns Event bonus. `undefined` if not found or not target.
 */
export function getEventBonusIfTarget(name: string, custom: HelpEventBonus,
    pokemon: PokemonData): Partial<BonusEffects>|undefined {
    const data = getEventBonusData(name, custom);
    return data?.isTarget(pokemon) ? data.effects : undefined;
}

/**
 * Get event bonus for the given event name.
 * @param name Event name.
 * @returns Event bonus. `undefined` if not found or not target.
 */
export function getEventBonus(name: string, custom: HelpEventBonus):
Partial<BonusEffects>|undefined {
    return getEventBonusData(name, custom)?.effects;
}

/**
 * Get event bonus data for the given event name.
 * @param name Event name.
 * @returns Event bonus. `undefined` if not found or not target.
 */
function getEventBonusData(name: string, custom: HelpEventBonus):
BonusEventData|undefined {
    let event: BonusEventData|undefined = undefined;
    if (name !== "custom") {
        event = events.bonus.find(x => x.name === name);
    }
    else {
        event = new BonusEventData({
            name: "custom",
            start: "2000-01-01",
            end: "2100-01-01",
            target: custom.target,
            effects: custom.effects,
        });
    }
    if (event === undefined) {
        return undefined;
    }
    return event;
}

/**
 * drowsy data in event.json
 */
interface JsonDrowsyEventData {
    /** Event name */
    name: string;
    /** Start date time (YYYY-MM-DD) */
    day: string;
    /** Event bonus for drowsy power */
    bonus: number;
}

/**
 * Target pokemon for the bonus
 *
 * When both properties are specified, both condition should be met.
 * When neigher property is provided, all pokemon is the target.
 */
export interface TargetPokemon {
    /** Specialty of the pokemon */
    specialty: PokemonSpecialty;
    /** Type of the pokemon */
    type: PokemonType[];
}

/**
 * Bonus effects to be triggered.
 */
export interface BonusEffects {
    /** Boosted berry count */
    berry: 0 | 1,
    /** Skill probability bonus */
    skillTrigger: 1 | 1.25 | 1.5,
    /** Boosted main skill level */
    skillLevel: 0 | 1 | 3 | 5,
    /** Boosted ingredient count */
    ingredient: 0 | 1,
    /** Dream Shard Magnet S bonus */
    dreamShard: 1 | 1.5 | 2;
    /** Ingredient Magnet S bonus */
    ingredientMagnet: 1 | 1.5;
    /** Ingredient Magnet S bonus */
    ingredientDraw: 1 | 1.5;
    /** Number of ingredients bonus gathered by main skills */
    skillIngredient: 1 | 1.25;
    /** Berry Burst bonus */
    berryBurst: 1 | 1.4;
    /** Dishes bonus */
    dish: 1 | 1.1 | 1.25 | 1.5;
    /** Energy recovery bonus by dish */
    energyFromDish: 0 | 5;
    /**
     * Types of berries that are fixed (i.e., not randomly selected).
     *
     * - Set to an empty array `[]` when berries are not fixed.
     * - Set to `["electric", "fire", "water"]` during the "Raikou, Entei, and Suicune Research" event.
     */
    fixedBerries: PokemonType[];
    /**
     * Indexes of research areas where `fixedBerries` are applied.
     *
     * - Set to an empty array `[]` when berries are not fixed.
     * - Set to `[0, 1, 2, 5, 7]` during the "Raikou, Entei, and Suicune Research" event.
     */
    fixedAreas: number[];
}

/**
 * BonusEffects with no active bonuses (default values).
 */
export const emptyBonusEffects: Readonly<BonusEffects> = {
    berry: 0,
    skillTrigger: 1,
    skillLevel: 0,
    ingredient: 0,
    dreamShard: 1,
    ingredientMagnet: 1,
    ingredientDraw: 1,
    skillIngredient: 1,
    berryBurst: 1,
    dish: 1,
    energyFromDish: 0,
    fixedBerries: [],
    fixedAreas: [],
};

/**
 * Help event bonus
 */
export interface HelpEventBonus {
    target: Partial<TargetPokemon>;
    effects: BonusEffects;
}

/**
 * bonus data in event.json
 */
interface JsonBonusEventData {
    /** Event name */
    name: string;
    /** Start date time (YYYY-MM-DD) */
    start: string;
    /** End date time (YYYY-MM-DD) */
    end: string;
    /** target pokemons */
    target: Partial<TargetPokemon>;
    /** Effects to be triggered */
    effects: Partial<BonusEffects>;
}

/**
 * Type for event.json
 */
interface JsonEventData {
    /** Drowsy power event days (GSD etc...) */
    "drowsy": JsonDrowsyEventData[];
    /** Bonus event days (Skill% up etc...) */
    "bonus": JsonBonusEventData[];
}

class EventData {
    drowsy: DrowsyEventData[];
    bonus: BonusEventData[];
    constructor(data: JsonEventData) {
        this.drowsy = data.drowsy.map(x => new DrowsyEventData(x));
        this.bonus = data.bonus.map(x => new BonusEventData(x));
    }

    getBonusByName(name: string): BonusEventData|undefined {
        return this.bonus.find(x => x.name === name);
    }
}

const events = new EventData(events_ as JsonEventData);

/**
 * Load help event bonus data from JSON.
 * @param data Loaded JSON data.
 * @returns Loaded HelpEventBonus object.
 */
export function loadHelpEventBonus(data: unknown): HelpEventBonus {
    const ret: HelpEventBonus = {
        target: {},
        effects: fillBonusEffects({}),
    };
    if (typeof(data) !== "object" || data === null) {
        return ret;
    }

    if (typeof((data as {target?: unknown}).target) === "object") {
        const target = (data as {target?: unknown}).target as Partial<TargetPokemon>;
        if (typeof(target.specialty) === "string" &&
            SpecialtyNames.includes(target.specialty)) {
            ret.target.specialty = target.specialty as PokemonSpecialty;
        }
        if (typeof(target.type) === "string" &&
            PokemonTypes.includes(target.type)) {
            ret.target.type = [target.type as PokemonType];
        }
        if (Array.isArray(target.type) &&
            target.type.length <= 3 &&
            target.type.every((x: PokemonType) => PokemonTypes.includes(x))) {
            ret.target.type = target.type;
        }
    }
    if (typeof((data as {effects?: unknown}).effects) === "object") {
        const effects = (data as {effects?: unknown}).effects as Partial<BonusEffects>;
        if (typeof(effects.berry) === "number" &&
            [0, 1].includes(effects.berry)) {
            ret.effects.berry = effects.berry;
        }
        if (typeof(effects.skillLevel) === "number" &&
            [0, 1, 3, 5].includes(effects.skillLevel)) {
            ret.effects.skillLevel = effects.skillLevel;
        }
        if (typeof(effects.skillTrigger) === "number" &&
            [1, 1.25, 1.5].includes(effects.skillTrigger)) {
            ret.effects.skillTrigger = effects.skillTrigger;
        }
        if (typeof(effects.ingredient) === "number" &&
            [0, 1].includes(effects.ingredient)) {
            ret.effects.ingredient = effects.ingredient;
        }
        if (typeof(effects.dreamShard) === "number" &&
            [1, 1.5, 2].includes(effects.dreamShard)) {
            ret.effects.dreamShard = effects.dreamShard;
        }
        if (typeof(effects.ingredientMagnet) === "number" &&
            [1, 1.5].includes(effects.ingredientMagnet)) {
            ret.effects.ingredientMagnet = effects.ingredientMagnet;
        }
        if (typeof(effects.ingredientDraw) === "number" &&
            [1, 1.5].includes(effects.ingredientDraw)) {
            ret.effects.ingredientDraw = effects.ingredientDraw;
        }
        if (typeof(effects.skillIngredient) === "number" &&
            [1, 1.25].includes(effects.skillIngredient)) {
            ret.effects.skillIngredient = effects.skillIngredient;
        }
        if (typeof(effects.berryBurst) === "number" &&
            [1, 1.4].includes(effects.berryBurst)) {
            ret.effects.berryBurst = effects.berryBurst;
        }
        if (typeof(effects.dish) === "number" &&
            [1, 1.1, 1.25, 1.5].includes(effects.dish)) {
            ret.effects.dish = effects.dish;
        }
        if (typeof(effects.energyFromDish) === "number" &&
            [0, 5].includes(effects.energyFromDish)) {
            ret.effects.energyFromDish = effects.energyFromDish;
        }
    }
    return ret;
}

export default events;
