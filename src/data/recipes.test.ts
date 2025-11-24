import {RecipeData, RecipeList, maxLevel} from './recipes';
import type {RecipeType} from './recipes';

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

describe('RecipeData', () => {
    describe('constructor', () => {
        it('should initialize fancy apple curry', () => {
            const recipe = new RecipeData(fancyAppleCurry);
            expect(recipe.type).toBe('curries');
            expect(recipe.name).toBe('fancy');
            expect(recipe.ings).toEqual([{ing: 'apple', count: 7}]);
            expect(recipe.total).toBe(7);
            expect(recipe.baseStrength).toBe(748);
            expect(recipe.bonus).toBe(19);
        });

        it('should initialize egg bomb curry', () => {
            const recipe = new RecipeData(droughtKatsuCurry);
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
            const recipe = new RecipeData(scaryFacePancakes);
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

    describe('level property', () => {
        it('should start at level 30 by default', () => {
            const recipe = new RecipeData(fancyAppleCurry);
            expect(recipe.level).toBe(30);
        });

        it('should allow setting valid level', () => {
            const recipe = new RecipeData(fancyAppleCurry);

            recipe.level = 1;
            expect(recipe.level).toBe(1);

            recipe.level = 50;
            expect(recipe.level).toBe(50);

            recipe.level = maxLevel;
            expect(recipe.level).toBe(maxLevel);
        });

        it('should throw error for invalid level', () => {
            const recipe = new RecipeData(fancyAppleCurry);

            expect(() => {
                recipe.level = 0;
            }).toThrow('Invalid level value');

            expect(() => {
                recipe.level = -1;
            }).toThrow('Invalid level value');

            expect(() => {
                recipe.level = maxLevel + 1;
            }).toThrow('Invalid level value');

            expect(() => {
                recipe.level = 30.5;
            }).toThrow('Invalid level value');
        });
    });

    describe('strength calculation', () => {
        it('should calculate strength at correctly', () => {
            const recipe = new RecipeData(fancyAppleCurry);

            recipe.level = 1;
            expect(recipe.strength).toBe(748);

            recipe.level = 2;
            expect(recipe.strength).toBe(763);

            recipe.level = 30;
            expect(recipe.strength).toBe(1204);

            recipe.level = 65;
            expect(recipe.strength).toBe(2498);
        });
    });
});

describe('RecipeList', () => {
    const recipes = [
        fancyAppleCurry, droughtKatsuCurry, scaryFacePancakes,
    ];

    describe('filter', () => {
        it('should return all recipes with empty filter', () => {
            const list = new RecipeList(recipes);
            const filtered = list.filter({});
            expect(filtered).toHaveLength(recipes.length);
        });

        it('should filter by type correctly', () => {
            const list = new RecipeList(recipes);

            const curries = list.filter({type: 'curries'});
            expect(curries).toHaveLength(2);
            expect(curries.every(r => r.type === 'curries')).toBe(true);

            const salads = list.filter({type: 'salads'});
            expect(salads).toHaveLength(0);

            const desserts = list.filter({type: 'desserts'});
            expect(desserts).toHaveLength(1);
            expect(desserts.every(r => r.type === 'desserts')).toBe(true);
        });

        it('should filter by minBonus correctly', () => {
            const list = new RecipeList(recipes);

            const minBonus = list.filter({minBonus: 19});
            expect(minBonus).toHaveLength(3);

            const maxBonus = list.filter({minBonus: 78});
            expect(maxBonus).toHaveLength(1);
            expect(maxBonus[0].name).toBe("scary");
        });

        it('should filter by include ingredient', () => {
            const list = new RecipeList(recipes);

            const withApple = list.filter({include: 'apple'});
            expect(withApple).toHaveLength(1);
            expect(withApple.every(r =>
                r.ings.some(i => i.ing === 'apple')
            )).toBe(true);

            const withTomato = list.filter({include: 'tomato'});
            expect(withTomato).toHaveLength(1);
            expect(withTomato.every(r =>
                r.ings.some(i => i.ing === 'tomato')
            )).toBe(true);
        });

        it('should filter by exclude ingredient', () => {
            const list = new RecipeList(recipes);

            const withoutApple = list.filter({exclude: 'apple'});
            expect(withoutApple).toHaveLength(2);
            expect(withoutApple[0].name).toBe('drought');
            expect(withoutApple[1].name).toBe('scary');

            const withoutMilk = list.filter({exclude: 'milk'});
            expect(withoutMilk).toHaveLength(3);
        });
    });

    describe('sort', () => {
        it('should sort by count', () => {
            const list = new RecipeList(recipes);
            const ret = list.getRecipes({}, "count");

            expect(ret[0].name).toBe("scary");
            expect(ret[1].name).toBe("drought");
            expect(ret[2].name).toBe("fancy");
        });

        it('should sort by strength', () => {
            const list = new RecipeList(recipes);
            const ret = list.getRecipes({}, "strength");

            // All start at level 30, so sort by current strength
            expect(ret[0].name).toBe("scary");
            expect(ret[0].strength).toBe(39210);
            expect(ret[1].name).toBe("drought");
            expect(ret[1].strength).toBe(3127);
            expect(ret[2].name).toBe("fancy");
            expect(ret[2].strength).toBe(1204);
        });

        it('should sort by strength (change level)', () => {
            const list = new RecipeList(recipes);
            const tmp = list.getRecipes({}, "strength");
            tmp[1].level = 1; // Change drought level
            tmp[2].level = 65; // Change fancy level

            // All start at level 30, so sort by current strength
            const ret = list.getRecipes({}, "strength");
            expect(ret[0].name).toBe("scary");
            expect(ret[0].strength).toBe(39210);
            expect(ret[1].name).toBe("fancy");
            expect(ret[1].strength).toBe(2498);
            expect(ret[2].name).toBe("drought");
            expect(ret[2].strength).toBe(1942);
        });

        it('should sort by max strength', () => {
            const list = new RecipeList(recipes);
            const ret = list.getRecipes({}, "max strength");
            expect(ret[0].name).toBe("scary");
            expect(ret[1].name).toBe("drought");
            expect(ret[2].name).toBe("fancy");
        });
    });
});
