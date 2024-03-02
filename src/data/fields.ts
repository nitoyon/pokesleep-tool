import fields_ from './field.json';

export interface FieldData {
    /** field index */
    index: number;
    /** field name */
    name: string;
    /** field emoji */
    emoji: string;
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
    type: "dozing" | "snoozing" | "slumbering";
    /** Drowsy power range */
    range: DrowsyPowerRange[];
}

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
export const MAX_STRENGTH = 9999999;
for (const field of fields) {
    field.ranks.push(MAX_STRENGTH + 1);
}

export default fields;
