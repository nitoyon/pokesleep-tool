import {Recipe, maxLevel} from './recipes';
import type { RecipeType } from './recipes';

const fancyAppleCurry = {
    type: 'curries' as RecipeType,
    name: 'fancy',
    ings: [
        {ing: 'apple' as const, count: 7}
    ],
    total: 7,
    strength: 748
};
const droughtKatsuCurry = {
    "type": "curries" as RecipeType,
    "name": "drought",
    "ings": [
        {"ing": "sausage" as const, "count": 10},
        {"ing": "oil" as const, "count": 5},
    ],
    "total": 15,
    "strength": 1942
};
const scaryFacePancakes = {
    type: "desserts" as RecipeType,
    name: "scary",
    ings: [
        {ing: "honey" as const, count: 32},
        {ing: "tomato" as const, count: 29},
        {ing: "egg" as const, count: 24},
        {ing: "pumpkin" as const, count: 18}
    ],
    total: 103,
    strength: 24354
};

describe('Recipe', () => {
    describe('constructor', () => {
        it('should initialize fancy apple curry', () => {
            const recipe = new Recipe(fancyAppleCurry);
            expect(recipe.type).toBe('curries');
            expect(recipe.name).toBe('fancy');
            expect(recipe.ings).toEqual([{ing: 'apple', count: 7}]);
            expect(recipe.total).toBe(7);
            expect(recipe.baseStrength).toBe(748);
            expect(recipe.bonus).toBe(19);
        });

        it('should initialize egg bomb curry', () => {
            const recipe = new Recipe(droughtKatsuCurry);
            expect(recipe.type).toBe('curries');
            expect(recipe.name).toBe('drought');
            expect(recipe.ings).toEqual([
                {"ing": "sausage" as const, "count": 10},
                {"ing": "oil" as const, "count": 5},
            ]);
            expect(recipe.total).toBe(15);
            expect(recipe.baseStrength).toBe(1942);
            expect(recipe.bonus).toBe(19);
        });

        it('should initialize scary face pancakes', () => {
            const recipe = new Recipe(scaryFacePancakes);
            expect(recipe.type).toBe('desserts');
            expect(recipe.name).toBe('scary');
            expect(recipe.ings).toEqual([
                {ing: "honey" as const, count: 32},
                {ing: "tomato" as const, count: 29},
                {ing: "egg" as const, count: 24},
                {ing: "pumpkin" as const, count: 18}
            ]);
            expect(recipe.total).toBe(103);
            expect(recipe.baseStrength).toBe(24354);
            expect(recipe.bonus).toBe(78);
        });
    });

    describe('calculateStrength', () => {
        it('should calculate strength at various levels correctly', () => {
            const recipe = new Recipe(fancyAppleCurry);

            expect(recipe.calculateStrength(1)).toBe(748);
            expect(recipe.calculateStrength(2)).toBe(763);
            expect(recipe.calculateStrength(30)).toBe(1204);
            expect(recipe.calculateStrength(65)).toBe(2498);
        });

        it('should throw error for invalid level', () => {
            const recipe = new Recipe(fancyAppleCurry);

            expect(() => recipe.calculateStrength(0)).toThrow('Invalid level value');
            expect(() => recipe.calculateStrength(-1)).toThrow('Invalid level value');
            expect(() => recipe.calculateStrength(maxLevel + 1)).toThrow('Invalid level value');
            expect(() => recipe.calculateStrength(30.5)).toThrow('Invalid level value');
        });
    });
});
