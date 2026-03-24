import { IngredientName } from "../data/pokemons";

/**
 * Represents help count split by normal and sneaky snacking.
 */
export type NormalAndSnackingHelpCount = {
    /** Total help count (normal + sneakySnacking) */
    all: number;
    /** Help count stored in Pokemon's inventory */
    normal: number;
    /** Help count directly granted to Snorlax (all berries) */
    sneakySnacking: number;
};

/**
 * Represents the result of ingredient help calculation.
 */
export interface IngredientHelp {
    /** Ingredient name. */
    name: IngredientName;
    /** Ingredient count. */
    count: number;
    /** Ingredient count by single help */
    helpCount: number;
}

/**
 * Represents the help count breakdown by berry, ingredient, and skill.
 */
export interface HelpCountResult {
    /** Total help count during the specified period */
    total: NormalAndSnackingHelpCount;

    /** Berry rate */
    berryRate: number;
    /** Berry help count */
    berryHelpCount: number;
    /** Berry count per help */
    berryCount: number;
    /** Ingredient rate */
    ingRate: number;
    /** Ingredient help count */
    ingHelpCount: number;
    /** Ing1 name and count */
    ing1: IngredientHelp;
    /** Ing2 name and count */
    ing2: IngredientHelp;
    /** Ing3 name and count */
    ing3: IngredientHelp|undefined;
    /** Ing1 ~ Ing3 name, count */
    ingredients: IngredientHelp[];
    /** Skill rate */
    skillRate: number;
    /** Overall skill rate (with pity proc) */
    overallSkillRate: number;
    /** Total skill count */
    skillCount: number;
}
