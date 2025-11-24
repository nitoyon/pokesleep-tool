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
export class RecipeData {
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
    /** Current level of this recipe instance */
    private _level: number;
    /** Cache calculated strength */
    private _strengthCache?: number;

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
        this._level = 30;
        this._strengthCache = undefined;

        // Calculate bonus
        let rawStrength = 0;
        for (const ing of data.ings) {
            rawStrength += ingredientStrength[ing.ing] * ing.count;
        }
        this.bonus = Math.round(this.baseStrength / rawStrength * 100 - 100);
    }

    /** Returns the current level of this recipe */
    get level(): number {
        return this._level;
    }

    /** Updates the recipe level with validation */
    set level(value: number) {
        if (value < 1 || value > maxLevel ||
            value !== Math.floor(value)
        ) {
            throw new Error('Invalid level value');
        }
        this._level = value;
        this._strengthCache = undefined;
    }

    /** Calculates total strength including level-based bonus */
    get strength(): number {
        if (this._strengthCache !== undefined) {
            return this._strengthCache;
        }

        const bonus = recipeLevelBonus[this._level];
        this._strengthCache = this.baseStrength +
            Math.round(this.baseStrength * bonus / 100);
        return this._strengthCache;
    }
}

/** Filter configuration to support user-driven recipe search */
export type RecipeFilter = {
    /** Recipe category */
    type: RecipeType;
    /** Threshold for finding high-efficiency recipes */
    minBonus: number;
    /** Only show recipes containing this ingredient */
    include: IngredientName;
    /** Hide recipes containing this ingredient */
    exclude: IngredientName;
}

/** Available sorting methods for ordering recipe */
export type RecipeSort = "level" | "strength" | "max strength" | "count";

/**
 * Manages the complete collection of recipes with filtering and sorting capabilities.
 */
export class RecipeList {
    private _recipes: RecipeData[];

    /**
     * Converts JSON data to RecipeData instances for runtime calculations.
     * @param data Array of recipe definitions from JSON file.
     */
    constructor(data: JsonRecipeData[]) {
        this._recipes = data.map(x => new RecipeData(x));
    }

    /**
     * Retrieves filtered and sorted recipes matching the specified criteria.
     */
    getRecipes(filterConfig: Partial<RecipeFilter>, sortConfig: RecipeSort): RecipeData[] {
        const ret = this.filter(filterConfig);
        this.sort(ret, sortConfig);
        return ret;
    }

    /**
     * Reduces recipe list based on user-specified constraints.
     * @param config Filtering criteria to apply.
     */
    filter(config: Partial<RecipeFilter>): RecipeData[] {
        let filtered: RecipeData[] = [...this._recipes];
        if (config.type !== undefined) {
            filtered = filtered.filter(x => x.type === config.type);
        }

        if (config.minBonus !== undefined) {
            const minBonus = config.minBonus;
            filtered = filtered.filter(x => x.bonus >= minBonus)
        }

        if (config.include !== undefined) {
            filtered = filtered.filter(recipe =>
                recipe.ings.some(i => i.ing === config.include));
        }
        if (config.exclude !== undefined) {
            filtered = filtered.filter(recipe =>
                recipe.ings.every(i => i.ing !== config.exclude));
        }
        return filtered;
    }

    /**
     * Sorts recipes descending according to the specified ordering method.
     * @param recipes Array of recipes to sort.
     * @param sortConfig Sorting method to apply.
     */
    sort(recipes: RecipeData[], sortConfig: RecipeSort) {
        switch (sortConfig) {
            case "level":
                recipes.sort((a, b) => a.level !== b.level ? b.level - a.level :
                    b.strength - a.strength
                );
                return;

            case "strength":
                recipes.sort((a, b) => a.strength !== b.strength ? b.strength - a.strength :
                    b.baseStrength - a.baseStrength
                );
                return;

            case "max strength":
                recipes.sort((a, b) => a.baseStrength !== b.baseStrength ?
                    b.baseStrength - a.baseStrength :
                    b.total - a.total
                );
                return;

            case "count":
                recipes.sort((a, b) => a.total !== b.total ? b.total - a.total :
                    b.strength - a.strength
                );
                return;

            default:
                throw new Error("unknown sort type");
        }
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

const recipes = new RecipeList(recipe_ as JsonRecipeData[]);

export default recipes;
