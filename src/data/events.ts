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
        ingredient: data.ingredient ?? 0,
        dreamShard: data.dreamShard ?? 1,
        ingredientMagnet: data.ingredientMagnet ?? 1,
        ingredientDraw: data.ingredientDraw ?? 1,
        dish: data.dish ?? 1,
        energyFromDish: data.energyFromDish ?? 0,
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
    /** Dishes bonus */
    dish: 1 | 1.1 | 1.25 | 1.5;
    /** Energy recovery bonus by dish */
    energyFromDish: 0 | 5;
}

/**
 * BonusEffects with no active bonuses (default values).
 */
export const emptyBonusEffects: Readonly<BonusEffects> = {
    skillTrigger: 1,
    skillLevel: 0,
    ingredient: 0,
    dreamShard: 1,
    ingredientMagnet: 1,
    ingredientDraw: 1,
    dish: 1,
    energyFromDish: 0,
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
export function loadHelpEventBonus(data: any): HelpEventBonus {
    const ret: HelpEventBonus = {
        target: {},
        effects: fillBonusEffects({}),
    };
    if (typeof(data.target) === "object") {
        if (typeof(data.target.specialty) === "string" &&
            SpecialtyNames.includes(data.target.specialty)) {
            ret.target.specialty = data.target.specialty as PokemonSpecialty;
        }
        if (typeof(data.target.type) === "string" &&
            PokemonTypes.includes(data.target.type)) {
            ret.target.type = [data.target.type as PokemonType];
        }
        if (Array.isArray(data.target.type) &&
            data.target.type.length <= 3 &&
            data.target.type.every((x: PokemonType) => PokemonTypes.includes(x))) {
            ret.target.type = data.target.type;
        }
    }
    if (typeof(data.effects) === "object") {
        if (typeof(data.effects.skillLevel) === "number" &&
            [0, 1, 3, 5].includes(data.effects.skillLevel)) {
            ret.effects.skillLevel = data.effects.skillLevel;
        }
        if (typeof(data.effects.skillTrigger) === "number" &&
            [1, 1.25, 1.5].includes(data.effects.skillTrigger)) {
            ret.effects.skillTrigger = data.effects.skillTrigger;
        }
        if (typeof(data.effects.ingredient) === "number" &&
            [0, 1].includes(data.effects.ingredient)) {
            ret.effects.ingredient = data.effects.ingredient;
        }
        if (typeof(data.effects.dreamShard) === "number" &&
            [1, 1.5, 2].includes(data.effects.dreamShard)) {
            ret.effects.dreamShard = data.effects.dreamShard;
        }
        if (typeof(data.effects.ingredientMagnet) === "number" &&
            [1, 1.5].includes(data.effects.ingredientMagnet)) {
            ret.effects.ingredientMagnet = data.effects.ingredientMagnet;
        }
        if (typeof(data.effects.ingredientDraw) === "number" &&
            [1, 1.5].includes(data.effects.ingredientDraw)) {
            ret.effects.ingredientDraw = data.effects.ingredientDraw;
        }
        if (typeof(data.effects.dish) === "number" &&
            [1, 1.1, 1.25, 1.5].includes(data.effects.dish)) {
            ret.effects.dish = data.effects.dish;
        }
        if (typeof(data.effects.energyFromDish) === "number" &&
            [0, 5].includes(data.effects.energyFromDish)) {
            ret.effects.energyFromDish = data.effects.energyFromDish;
        }
    }
    return ret;
}

export default events;
