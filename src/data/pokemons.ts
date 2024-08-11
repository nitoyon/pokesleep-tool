import pokemon_ from './pokemon.json';
import {SleepType} from './fields';
import { MainSkillName } from '../util/MainSkill';

export interface PokemonData {
    /** Pokemon ID */
    id: number;
    /** Pokemon name in English */
    name: string;
    /** Sleep type of the pokemon */
    sleepType: SleepType;
    /** Type of the pokemon. */
    type: PokemonType;
    /** Specialty of the pokemon. */
    speciality: PokemonSpeciality;
    /** Skill of the pokemon */
    skill: MainSkillName;
    /** Friend point */
    fp: number;
    /** Frequency of the help */
    frequency: number;
    /** Ratio for get ingredients */
    ingRatio: number;
    /** Ratio for skill occurance. */
    skillRatio: number;
    /** Whether ratio is not fixed or not */
    ratioNotFixed?: boolean;
    /** Ancestor pokemon id */
    ancestor: number | null;
    /** Evolution count (-1, 0, 1, 2) */
    evolutionCount: -1|0|1|2;
    /** Number of remaining evolutions (0, 1, 2) */
    evolutionLeft: 0|1|2;
    /** true if Non-evolving pokemon or filal evolution pokemon */
    isFullyEvolved: boolean;
    /** Carry limit (excluding 5 * evolutionCount). */
    carryLimit: number;
    ing1: {
        name: IngredientName,
        c1: number,
        c2: number,
        c3: number,   
    }
    ing2: {
        name: IngredientName,
        c2: number;
        c3: number;
    },
    ing3: {
        name: IngredientName,
        c3: number;
    } | undefined;
}

export type PokemonType = "normal" | "fire" | "water" | "electric" | "grass" |
    "ice" | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug" |
    "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export const PokemonTypes: PokemonType[] = ["normal", "fire", "water",
    "electric","grass", "ice", "fighting", "poison", "ground",
    "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"];

export type PokemonSpeciality = "Ingredients" | "Berries" | "Skills";

export type IngredientName = "leek" | "mushroom" | "egg" | "potato" |
    "apple" | "herb" | "sausage" | "milk" | "honey" | "oil" | "ginger" |
    "tomato" | "cacao" | "tail" | "soy" | "corn" | "unknown";

const pokemons = pokemon_ as PokemonData[];

const ancestorId2Decendants = new Map<number, PokemonData[]>();

/**
 * Gets the descendants of the specified Pokémon.
 * @param {Pokemon} pokemon - The Pokémon for which to get the descendants.
 * @returns {Array} An array of descendants of the specified Pokémon.
 */
export function getDecendants(pokemon: PokemonData): PokemonData[] {
    if (ancestorId2Decendants.size === 0) {
        // get ancestor of the lineage
        const ancestorId2evoCount = new Map<number, number>();
        for (const pokemon of pokemons) {
            const ancestor = pokemon.ancestor ?? 0;
            if (ancestor === 0) {
                continue;
            }
            const count = ancestorId2evoCount.get(ancestor);
            if (count !== undefined) {
                ancestorId2evoCount.set(ancestor,
                    Math.max(pokemon.evolutionCount, count));
            }
            else {
                ancestorId2evoCount.set(ancestor, pokemon.evolutionCount);
            }
        }

        for (const [ancestorId, count] of ancestorId2evoCount) {
            ancestorId2Decendants.set(ancestorId, pokemons
                .filter(x => x.ancestor === ancestorId &&
                    x.evolutionCount === count));
        }
    }

    if (pokemon.ancestor !== null) {
        const ret = ancestorId2Decendants.get(pokemon.ancestor);
        if (ret !== undefined) {
            return ret;
        }
    }
    return [];
}

export default pokemons;
