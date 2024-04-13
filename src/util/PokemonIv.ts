import Nature from './Nature';
import pokemons, { PokemonData } from '../data/pokemons';
import { IngredientType } from './PokemonRp';
import SubSkillList from './SubSkillList';

/**
 * Represents Indivisual Values (IV) of the Pokemon.
 */
class PokemonIv {
    pokemonName: string;
    pokemon: PokemonData;
    level: number;
    skillLevel: number;
    ingredient: IngredientType;
    subSkills: SubSkillList;
    nature: Nature;

    /** Initialize new instance. */
    constructor(pokemonName: string) {
        this.pokemonName = pokemonName;
        const pokemon = pokemons.find(x => x.name === pokemonName);
        if (pokemon === undefined) {
            throw new Error(`Unknown name: ${pokemonName}`);
        }
        this.pokemon = pokemon;

        // set default value
        this.level = 30;
        this.skillLevel = 3;
        this.ingredient = "AAA";
        this.subSkills = new SubSkillList();
        this.nature = new Nature("Serious");
    }

    /**
     * Creates a deep copy of this instance.
     * @returns A cloned instance.
     */
    clone(): PokemonIv {
        const ret = new PokemonIv(this.pokemonName);
        ret.level = this.level;
        ret.skillLevel = this.skillLevel;
        ret.ingredient = this.ingredient;
        ret.subSkills = this.subSkills.clone();
        ret.nature = this.nature;
        return ret;
    }
}

export default PokemonIv;
