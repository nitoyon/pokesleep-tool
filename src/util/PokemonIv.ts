import Nature from './Nature';
import { IngredientType } from './PokemonRp';
import SubSkillList from './SubSkillList';

/**
 * Represents Indivisual Values (IV) of the Pokemon.
 */
class PokemonIv {
    pokemonName: string;
    level: number;
    skillLevel: number;
    ingredient: IngredientType;
    subSkills: SubSkillList;
    nature: Nature;

    /** Initialize new instance. */
    constructor(pokemonName: string) {
        this.pokemonName = pokemonName;
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
