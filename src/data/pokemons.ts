import pokemon_ from './pokemon.json';
import {SleepType} from './fields';

export interface PokemonDataHash {
    [id: string]: PokemonData
}

interface PokemonData {
    /** Pokemon name in English */
    name: string;
    /** Sleep type of the pokemon */
    type: SleepType;
    /** Ancestor pokemon id */
    ancestor: number|null;
    /** Rank and sleep styles to encounter the pokmeon per field */
    field: {[fieldIndex: string]: SleepStyleIdAndRank[]};
    /**
     * Sleep style data per sleep style ID
     *
     * In most case, sleep style ID is equal to ratity.
     * But, sleep style ID 5 exists for Ditto, which represents
     * Bulbasaur sleep, Squirtle sleep, and so on.
     */
    style: {[id: string]: SleepStyle};
}

export interface SleepStyleIdAndRank {
    /** Sleep style ID (1 ~ 5) */
    id: number;
    /** Rank (0 ~ 34)
     *
     * basic 1 => 0, great 1 => 5, ultra 1 => 10,
     * master 1 => 15, master 20 => 34 
     */
    rank: number;
}

/**
 * Represents a range for a drowsy power.
 */
export interface SleepStyle {
    /** Rarity of the sleep style (The number of stars). */
    rarity: number;
    /** Atop-berry sleep style or not */
    isAtopBerry: boolean;
    /** Research EXP of the sleep style. */
    researchExp: number;
    /** Dream shards of the sleep style. */
    dreamShards: number;
    /** The number of candy of the sleep style. */
    candy: number;
    /** Sleep power order. Sleep style consumes SPO * 38,000 d */
    spo: number;
    /** Global sleep style ID (used for the last rolling) */
    gid: number;
}

const pokemons = pokemon_ as PokemonDataHash;

export default pokemons;
