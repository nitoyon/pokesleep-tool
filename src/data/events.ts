import events_ from './event.json';
import { PokemonData, PokemonSpecialty, PokemonType } from './pokemons';

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
    target: TargetPokemon;
    /** Bonus effects to be triggered */
    effects: BonusEffects;

    /**
     * Initialize BonusEventData object.
     * @param data JSON data.
     */
    constructor(data: JsonBonusEventData) {
        this.name = data.name;
        this.start = new Date(data.start);
        this.end = new Date(new Date(data.end).getTime() + 24 * 60 * 60 * 1000);
        this.target = data.target;
        this.effects = data.effects;
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
       if (this.target.specialty !== undefined &&
            pokemon.specialty !== this.target.specialty) {
            return false;
        }
        if (this.target.type !== undefined &&
            pokemon.type !== this.target.type) {
            return false;
        }
        return true;
    }
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
export function getEventBonusIfTarget(name: string, pokemon: PokemonData): BonusEffects|undefined {
    const event = events.bonus.find(x => x.name === name);
    if (event === undefined) {
        return undefined;
    }
    return event.isTarget(pokemon) ? event.effects : undefined;
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
interface TargetPokemon {
    /** Specialty of the pokemon */
    specialty?: PokemonSpecialty;
    /** Type of the pokemon */
    type?: PokemonType;
}

/**
 * Bonus effects to be triggered.
 */
export interface BonusEffects {
    /** Skill probability bonus */
    skillTrigger?: 1 | 1.25 | 1.5,
    /** Boosted main skill level */
    skillLevel?: 0 | 1 | 3,
    /** Boosted ingredient count */
    ingredient?: 0 | 1,
    /** Dream Shard Magnet S bonus */
    dreamShard?: 1 | 2;
    /** Dishes bonus */
    dish?: 1 | 1.25 | 1.5;
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
    target: TargetPokemon;
    /** Effects to be triggered */
    effects: BonusEffects;
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
}

const events = new EventData(events_ as JsonEventData);

export default events;
