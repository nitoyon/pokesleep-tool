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
    /** Ancestor pokemon id */
    ancestor: number | null;
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

export type PokemonSpeciality = "Ingredients" | "Berries" | "Skills";

export type IngredientName = "leek" | "mushroom" | "egg" | "potato" |
    "apple" | "herb" | "sausage" | "milk" | "honey" | "oil" | "ginger" |
    "tomato" | "cacao" | "tail" | "soy" | "corn";

const pokemons = pokemon_ as PokemonData[];

export default pokemons;