import { IngredientAndCount, Recipe, RecipeType } from '../data/recipes';
import { IngredientName } from '../data/pokemons';

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
export type RecipeSort = "id" | "level" | "strength" | "max strength" | "count";

type RecipeStrength = {
    /** Category this recipe belongs to */
    type: RecipeType;
    /** Recipe identifier in the category */
    name: string;
    /** List of ingredients with their required quantities */
    ings: IngredientAndCount[];
    /** Sum of all ingredient count */
    total: number;
    /** Recipe strength value at level 1 */
    baseStrength: number;
    /** Recipe bonus this recipe provides over raw ingredient strength */
    bonus: number;
    /** Recipe level */
    level: number;
    /** Current strength of this recipe */
    strength: number;
}

/**
 * Hold recipe level and manages filtering and sorting capabilities.
 */
export class RecipeData {
    /** All recipes */
    private allRecipes: Recipe[];

    /** Map that contains recipe to its level */
    private levels: Map<Recipe, number>;

    /**
     * Converts JSON data to RecipeData instances for runtime calculations.
     */
    constructor(allRecipes: Recipe[]) {
        this.allRecipes = allRecipes;
        this.levels = new Map<Recipe, number>();

        // initialize levels
        for (const recipe of allRecipes) {
            this.levels.set(recipe, 30);
        }
    }

    /**
     * Retrieves filtered and sorted recipes matching the specified criteria.
     */
    getRecipes(filterConfig: Partial<RecipeFilter>, sortConfig: RecipeSort): RecipeStrength[] {
        const recipes = this.filter(filterConfig);
        const strengthes = this.calculateStrength(recipes);
        this.sort(strengthes, sortConfig);
        return strengthes;
    }

    /**
     * Reduces recipe list based on user-specified constraints.
     * @param config Filtering criteria to apply.
     */
    filter(config: Partial<RecipeFilter>): Recipe[] {
        let filtered: Recipe[] = [...this.allRecipes];
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
     * Calculate strength for given recipes.
     * @param recipes An array of recipe to calculate strength.
     * @returns An array of RecipeStrength.
     */
    calculateStrength(recipes: Recipe[]): RecipeStrength[] {
        return recipes.map(recipe => {
            const level = this.levels.get(recipe) ?? 1;
            const strength = recipe.calculateStrength(level);
            return {
                ...recipe, level, strength,
            };
        });
    }

    /**
     * Sorts recipes descending according to the specified ordering method.
     * @param recipes Array of RecipeStrength to sort.
     * @param sortConfig Sorting method to apply.
     */
    sort(recipes: RecipeStrength[], sortConfig: RecipeSort) {
        switch (sortConfig) {
            case "id":
                return;

            case "level":
                recipes.sort((a, b) => a.level !== b.level ?
                    b.level - a.level : b.strength - a.strength);
                return;

            case "strength":
                recipes.sort((a, b) => a.strength !== b.strength ?
                    b.strength - a.strength : b.baseStrength - a.baseStrength);
                return;

            case "max strength":
                recipes.sort((a, b) => a.baseStrength !== b.baseStrength ?
                    b.baseStrength - a.baseStrength :
                    b.total - a.total
                );
                return;

            case "count":
                recipes.sort((a, b) => a.total !== b.total ? b.total - a.total :
                    b.baseStrength - a.baseStrength
                );
                return;

            default:
                throw new Error("unknown sort type");
        }
    }
}

export default RecipeData;
