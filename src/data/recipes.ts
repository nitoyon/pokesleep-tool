import recipe_ from './recipe.json';
import {IngredientName} from './pokemons';
import {ingredientStrength} from '../util/PokemonRp';

/** Max recipe level */
export const maxLevel = 65;

/** Categories of recipes available in the game */
export type RecipeType = "curries" | "salads" | "desserts";

/** Pairs of ingredient name and count */
export type IngredientAndCount = {
    /** Type of ingredient needed */
    ing: IngredientName;
    /** Amount needed to cook */
    count: number;
}

/** Percentage bonus applied to recipe strength at each level (indexed from level 0) */
const recipeLevelBonus = [
    // 0 ~ 10
    0, 0, 2, 4, 6, 8, 9, 11, 13, 16, 18,
    // 11 ~ 20
    19, 21, 23, 24, 26, 28, 30, 31, 33, 35,
    // 21 ~ 30
    37, 40, 42, 45, 47, 50, 52, 55, 58, 61,
    // 31 ~ 40
    64, 67, 70, 74, 77, 81, 84, 88, 92, 96,
    // 41 ~ 50
    100, 104, 108, 113, 117, 122, 127, 132, 137, 142,
    // 51 ~ 60
    148, 153, 159, 165, 171, 177, 183, 190, 197, 203,
    // 61 ~ 65
    209, 215, 221, 227, 234,
];

/**
 * Provides strength calculations and ingredient tracking for individual recipes.
 */
export class Recipe {
    /** Category this recipe belongs to */
    readonly type: RecipeType;
    /** Recipe identifier in the category */
    readonly name: string;
    /** List of ingredients with their required quantities */
    readonly ings: IngredientAndCount[];
    /** Sum of all ingredient count */
    readonly total: number;
    /** Recipe strength value at level 1 */
    readonly baseStrength: number;
    /** Recipe bonus this recipe provides over raw ingredient strength */
    readonly bonus: number;

    /**
     * Creates a recipe instance from JSON data and calculates `bonus`.
     * @param data Raw recipe data from JSON file.
     */
    constructor(data: JsonRecipeData) {
        this.type = data.type;
        this.name = data.name;
        this.ings = data.ings;
        this.total = data.total;
        this.baseStrength = data.strength;

        // Calculate bonus
        let rawStrength = 0;
        for (const ing of data.ings) {
            rawStrength += ingredientStrength[ing.ing] * ing.count;
        }
        this.bonus = Math.round(this.baseStrength / rawStrength * 100 - 100);
    }

    /** Returns the key of this recipe */
    get key(): string {
        return `${this.type}.${this.name}`;
    }

    /**
     * Calculates total strength including level-based bonus.
     * @param level Recipe level (1-65)
     * @returns Total strength at the specified level
     */
    calculateStrength(level: number): number {
        if (level < 1 || level > maxLevel || level !== Math.floor(level)) {
            throw new Error('Invalid level value');
        }

        const bonus = recipeLevelBonus[level];
        return this.baseStrength + Math.round(this.baseStrength * bonus / 100);
    }
}

/**
 * Structure matching the recipe data format in recipe.json.
 */
interface JsonRecipeData {
    /** Category of the recipe */
    type: RecipeType;
    /** Recipe identifier for localization */
    name: string;
    /** List of required ingredients with quantities */
    ings: IngredientAndCount[];
    /** Sum of all ingredient quantities */
    total: number;
    /** Base strength value at level 1 */
    strength: number;
}

const recipes: ReadonlyArray<Recipe> = recipe_
    .map(x => new Recipe(x as JsonRecipeData));

export default recipes;
