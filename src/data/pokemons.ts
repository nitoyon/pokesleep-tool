import pokemon_ from './pokemon.json';
import {SleepType} from './fields';
import { MainSkillName } from '../util/MainSkill';

/** Required exp from level 1 to level 25
 *
 * * 1320: Darkrai
 * * 1080: Raikou, Entei, Suicune
 * * 900: Larvitar, Dratini
 * * 600: Other Pokémon
 */
export type ExpType = 600|900|1080|1320;;

export interface PokemonData {
    /** Pokemon ID */
    id: number;
    /** Pokemon name in English */
    name: string;
    /** Arrival date of the Pokémon */
    arrival: string;
    /** Pokemon form */
    form: undefined|'Festivo'|'Holiday'|'Alola'|'Paldea'|'Amped'|'Low Key';
    /** Sleep type of the pokemon */
    sleepType: SleepType;
    /** EXP type (600, 900, 1080, 1320) */
    exp: ExpType;
    /** Type of the pokemon. */
    type: PokemonType;
    /** Specialty of the pokemon. */
    specialty: PokemonSpecialty;
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
    mythIng: MythIngredient[] | undefined;
}

export type PokemonType = "normal" | "fire" | "water" | "electric" | "grass" |
    "ice" | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug" |
    "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export const PokemonTypes: PokemonType[] = ["normal", "fire", "water",
    "electric","grass", "ice", "fighting", "poison", "ground",
    "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"];

export const SpecialtyNames: PokemonSpecialty[] = [
    "Berries", "Ingredients", "Skills", "All",
];

export type PokemonSpecialty = "Ingredients" | "Berries" | "Skills" | "All" | "unknown";

export const IngredientNames: IngredientName[] = [
    "leek", "mushroom", "egg", "potato",
    "apple", "herb", "sausage", "milk", "honey", "oil", "ginger",
    "tomato", "cacao", "tail", "soy", "corn", "coffee"];

export type IngredientName = "leek" | "mushroom" | "egg" | "potato" |
    "apple" | "herb" | "sausage" | "milk" | "honey" | "oil" | "ginger" |
    "tomato" | "cacao" | "tail" | "soy" | "corn" | "coffee" |
    "unknown" | "unknown1" | "unknown2" | "unknown3";

/** Ingredient for mythical pokemon */
export type MythIngredient = {
    /** Ingredient name */
    name: IngredientName;
    /** First ingredient count */
    c1: number;
    /** Second ingredient count */
    c2: number;
    /** Third ingredient count */
    c3: number;
}

const pokemons = pokemon_ as PokemonData[];

const ancestorId2Decendants = new Map<number, PokemonData[]>();

const toxelId = 848;

/**
 * Gets the descendants of the specified Pokémon.
 * @param {Pokemon} pokemon - The Pokémon for which to get the descendants.
 * @param {boolean} [includeNonFinal=false] - Whether to include non-final evolutions.
 * @returns {Array} An array of descendants of the specified Pokémon.
 */
export function getDecendants(pokemon: PokemonData,
    includeNonFinal: boolean = false
): PokemonData[] {
    if (ancestorId2Decendants.size === 0) {
        // initialize ancestorId2Decendants
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

        for (const [ancestorId] of ancestorId2evoCount) {
            ancestorId2Decendants.set(ancestorId, pokemons
                .filter(x => x.ancestor === ancestorId));
        }
    }

    if (pokemon.ancestor === null) {
        return [];
    }
    const ret = ancestorId2Decendants.get(pokemon.ancestor);
    if (ret === undefined) {
        return [];
    }

    // Toxel is a special case (form changes when it evolves)
    if (pokemon.ancestor === toxelId) {
        return ret
            .filter(x => includeNonFinal || x.evolutionLeft === 0);
    }

    return ret
        .filter(x => x.form === pokemon.form)
        .filter(x => includeNonFinal || x.evolutionLeft === 0)
        .sort((a, b) => a.id === pokemon.ancestor ? -1 : a.id - b.id);
}

export default pokemons;
