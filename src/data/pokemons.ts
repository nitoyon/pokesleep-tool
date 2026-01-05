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
export type ExpType = 600|900|1080|1320;

export type ValidFormType = 'Halloween' | 'Holiday' | 'Alola' | 'Paldea' |
    'Amped' | 'Low Key' | 'Small' | 'Medium' | 'Large' | 'Jumbo';

export type FormType = undefined | ValidFormType;

export interface PokemonData {
    /** Pokemon ID */
    readonly id: number;
    /** Pokemon name in English */
    readonly name: string;
    /** Arrival date of the Pokémon */
    readonly arrival: string;
    /** Pokemon form */
    readonly form: FormType;
    /** Sleep type of the pokemon */
    readonly sleepType: SleepType;
    /** EXP type (600, 900, 1080, 1320) */
    readonly exp: ExpType;
    /** Type of the pokemon. */
    readonly type: PokemonType;
    /** Specialty of the pokemon. */
    readonly specialty: PokemonSpecialty;
    /** Skill of the pokemon */
    readonly skill: MainSkillName;
    /** Friend point */
    readonly fp: number;
    /** Frequency of the help */
    readonly frequency: number;
    /** Ratio for get ingredients */
    readonly ingRatio: number;
    /** Ratio for skill occurance. */
    readonly skillRatio: number;
    /** Whether ratio is not fixed or not */
    readonly ratioNotFixed?: boolean;
    /** Ancestor pokemon id */
    readonly ancestor: number | null;
    /** Evolution count (-1, 0, 1, 2) */
    readonly evolutionCount: -1|0|1|2;
    /** Number of remaining evolutions (0, 1, 2) */
    readonly evolutionLeft: 0|1|2;
    /** true if Non-evolving pokemon or filal evolution pokemon */
    readonly isFullyEvolved: boolean;
    /** Carry limit (excluding 5 * evolutionCount). */
    readonly carryLimit: number;
    readonly ing1: {
        readonly name: IngredientName,
        readonly c1: number,
        readonly c2: number,
        readonly c3: number,   
    }
    readonly ing2: {
        readonly name: IngredientName,
        readonly c2: number;
        readonly c3: number;
    },
    readonly ing3: {
        readonly name: IngredientName,
        readonly c3: number;
    } | undefined;
    readonly mythIng: readonly MythIngredient[] | undefined;
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
    "tomato", "cacao", "tail", "soy", "corn", "coffee", "pumpkin",
    "avocado",
];

export type IngredientName = "leek" | "mushroom" | "egg" | "potato" |
    "apple" | "herb" | "sausage" | "milk" | "honey" | "oil" | "ginger" |
    "tomato" | "cacao" | "tail" | "soy" | "corn" | "coffee" | "pumpkin" |
    "avocado" |
    "unknown" | "unknown1" | "unknown2" | "unknown3";

/** Ingredient for mythical pokemon */
export type MythIngredient = {
    /** Ingredient name */
    readonly name: IngredientName;
    /** First ingredient count */
    readonly c1: number;
    /** Second ingredient count */
    readonly c2: number;
    /** Third ingredient count */
    readonly c3: number;
}

const pokemons = pokemon_ as PokemonData[];

const ancestorId2Decendants = new Map<number, PokemonData[]>();

export const toxelId = 848;

export const toxtricityId = 849;

/**
 * Gets the descendants of the specified Pokémon.
 *
 * WARNING:
 * Use `PokemonIv.getDecendants()` instead of this function.
 * This function does not support Toxel's form change.
 *
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

/**
 * Gets the candy name for the specified Pokémon.
 *
 * In Pokémon Sleep, candies are used for evolution and are typically named after
 * the base form of an evolutionary line. Most Pokémon use candy based on their
 * ancestor (the first Pokémon in their evolutionary chain).
 *
 * Some baby Pokémon use their evolved form's candy instead of their own.
 *
 * @param id - The Pokémon ID to get the candy for
 * @returns The name of the Pokémon whose candy is used,
 *          or "" if the Pokémon is not found
 *
 * @example
 * getCandyName(25);  // Pikachu returns "Pikachu"
 * getCandyName(172); // Pichu returns "Pikachu"
 * getCandyName(176); // Togetic returns "Togepi"
 */
export function getCandyName(id: number): string {
    const pokemon = pokemons.find(p => p.id === id);
    if (!pokemon) {
        return "";
    }

    // Some baby Pokémon use their evolved form's candy instead of their own
    const ancestorId = pokemon.ancestor ?? pokemon.id;
    switch (ancestorId) {
        case 172: // Pichu
            return "Pikachu";
        case 173: // Cleffa
            return "Clefairy";
        case 174: // Igglybuff
            return "Jigglypuff";
        case 360: // Wynaut
            return "Wobbuffet";
        case 438: // Bonsly
            return "Sudowoodo";
        case 439: // Mime Jr.
            return "Mr. Mime";
        case 440: // Happiny
            return "Chansey";
        case 447: // Riolu
            return "Lucario";
    }

    // Default to the base form of the evolutionary line
    // Note: Togepi and Toxel are exceptions that use their own candy despite being baby forms
    const ancestorPokemon = id === ancestorId ? pokemon :
        pokemons.find(p => p.id === ancestorId);
    return ancestorPokemon?.name ?? "";
}

export default pokemons;
