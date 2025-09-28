import fields_ from './field.json';
import { PokemonType } from './pokemons';

export interface FieldData {
    /** field index */
    index: number;
    /** field name */
    name: string;
    /** field emoji */
    emoji: string;
    /** Whether the field is expert mode or not */
    expert: boolean;
    /** required power to reach the rank */
    ranks: number[];
    /** required power to meet (n + 3) pokemons  */
    powers: number[];
    /** Confirmed pokemon encounter  */
    encounter: FieldEncounterData[] | undefined;
}

export interface FieldEncounterData {
    /** Name of pokemon */
    pokemon: string;
    /** Sleep type */
    type: SleepType;
    /** Drowsy power range */
    range: DrowsyPowerRange[];
}

/** 3 sleep type */
export type SleepType = "dozing" | "snoozing" | "slumbering";

/**
 * Represents a range for a drowsy power.
 */
interface DrowsyPowerRange {
    /** The starting value of the power range (inclusive) */
    start: number;
    /** The ending value of the power range (exclusive) */
    end: number;
}

const fields = fields_ as FieldData[];

// add sentinel
export const MAX_STRENGTH = 30000000;
for (const field of fields) {
    field.ranks.push(MAX_STRENGTH + 1);
}

export function isExpertField(index: number): boolean {
    if (index < 0) {
        return false;
    }
    const field = fields[index];
    if (!field) {
        throw new Error(`Field with index ${index} does not exist.`);
    }
    return field.expert;
}

export function getFavoriteBerries(index: number): PokemonType[] {
    if (index < 0) {
        return [];
    }
    switch (index) {
        // Greengrass Isle
        case 0: return [];
        // Cyan Beach
        case 1: return ["water", "fairy", "flying"];
        // Taupe Hollow
        case 2: return ["ground", "fire", "rock"];
        // Snowdrop Tundra
        case 3: return ["ice", "normal", "dark"];
        // Lapis Lakeside
        case 4: return ["grass", "psychic", "fighting"];
        // Old Gold Power Plant
        case 5: return ["electric", "ghost", "steel"];
        // Amber Canyon
        case 6: return ["poison", "bug", "dragon"];
        // Greengrass Isle (Expert)
        case 7: return [];
    }
    return [];
}

export default fields;
