import PokemonStrength, {
    createStrengthParameter, StrengthParameter, whistlePeriod,
    isSkillStrengthZero,
} from './PokemonStrength';
import PokemonIv from './PokemonIv';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';
import pokemons from '../data/pokemons';
import { MainSkillNames } from './MainSkill';

function createParam(obj: Partial<StrengthParameter>): StrengthParameter {
    return createStrengthParameter(obj);
}

describe('PokemonStrength', () => {
    describe('calculate', () => {
        test('ingredient unlock levels', () => {
            const iv = new PokemonIv('Raichu');

            // Level 1 - only ing1
            iv.level = 1;
            let param = createParam({});
            let strength = new PokemonStrength(iv, param);
            let result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBe(0);
            expect(result.ing3?.count).toBe(0);

            // Level 30 - ing1 and ing2
            iv.level = 30;
            param = createParam({});
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBeGreaterThan(0);
            expect(result.ing3?.count).toBe(0);

            // Level 60 - all ingredients
            iv.level = 60;
            param = createParam({});
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBeGreaterThan(0);
            expect(result.ing3?.count).toBeGreaterThan(0);
        });

        test('field bonus affects berry and ingredient strength', () => {
            const iv = new PokemonIv('Pikachu');
            iv.level = 50;

            const param0 = createParam({ fieldBonus: 0 });
            const strength0 = new PokemonStrength(iv, param0);
            const result0 = strength0.calculate();

            const param75 = createParam({ fieldBonus: 75 });
            const strength75 = new PokemonStrength(iv, param75);
            const result75 = strength75.calculate();

            expect(result75.berryTotalStrength).toBeCloseTo(result0.berryTotalStrength * 1.75);
            expect(result75.ingStrength).toBeCloseTo(result0.ingStrength * 1.75);
        });

        test('evolved parameter changes pokemon', () => {
            const iv = new PokemonIv('Pikachu');
            iv.level = 50;

            const paramNotEvolved = createParam({ evolved: false });
            const strengthNotEvolved = new PokemonStrength(iv, paramNotEvolved);
            expect(strengthNotEvolved.pokemonIv.pokemon.name).toBe('Pikachu');

            const paramEvolved = createParam({ evolved: true });
            const strengthEvolved = new PokemonStrength(iv, paramEvolved);
            expect(strengthEvolved.pokemonIv.pokemon.name).toBe('Raichu');
        });

        test('level parameter changes level', () => {
            const iv = new PokemonIv('Pikachu');
            iv.level = 10;

            const param = createParam({ level: 50 });
            const strength = new PokemonStrength(iv, param);
            expect(strength.pokemonIv.level).toBe(50);
        });

        test('tapFrequency none disables skill', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 50;

            const paramAlways = createParam({ tapFrequency: 'always' });
            const strengthAlways = new PokemonStrength(iv, paramAlways);
            const resultAlways = strengthAlways.calculate();
            expect(resultAlways.skillCount).toBeGreaterThan(0);

            const paramNone = createParam({ tapFrequency: 'none' });
            const strengthNone = new PokemonStrength(iv, paramNone);
            const resultNone = strengthNone.calculate();
            expect(resultNone.skillCount).toBe(0);
        });

        test('nature affects results', () => {
            const iv = new PokemonIv('Pikachu');
            iv.level = 50;

            // Test with neutral nature
            iv.nature = new Nature('Serious');
            const paramSerious = createParam({});
            const strengthSerious = new PokemonStrength(iv, paramSerious);
            const resultSerious = strengthSerious.calculate();

            // Test with Helping Speed down nature (Bold is Speed of Help down)
            iv.nature = new Nature('Bold');
            const paramBold = createParam({});
            const strengthBold = new PokemonStrength(iv, paramBold);
            const resultBold = strengthBold.calculate();

            // Bold should have fewer helps due to slower helping speed
            expect(resultBold.berryHelpCount + resultBold.ingHelpCount)
                .toBeLessThan(resultSerious.berryHelpCount + resultSerious.ingHelpCount);
        });

        test('ingredients summary', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 60;
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // Verify ingredients array contains all ingredients
            expect(result.ingredients.length).toBeGreaterThan(0);

            // Sum of ingredient strengths should equal total ingStrength
            const sumStrength = result.ingredients.reduce((sum, ing) => sum + ing.strength, 0);
            expect(sumStrength).toBeCloseTo(result.ingStrength);
        });

        test('calculates strength with whistle period', () => {
            const iv = new PokemonIv('Pikachu');
            iv.level = 50;

            // simulate whistle
            const paramWhistle = createParam({ period: whistlePeriod });
            const strengthWhistle = new PokemonStrength(iv, paramWhistle);
            const resultWhistle = strengthWhistle.calculate();

            // simulate 3 hours (always energy full)
            const param3Hours = createParam({ period: 3, isEnergyAlwaysFull: true });
            const strength3Hours = new PokemonStrength(iv, param3Hours);
            const result3Hours = strength3Hours.calculate();

            // Verify modified parameters
            expect(strengthWhistle.parameter.period).toBe(3);
            expect(strengthWhistle.parameter.isEnergyAlwaysFull).toBe(true);
            expect(strengthWhistle.parameter.isGoodCampTicketSet).toBe(false);
            expect(strengthWhistle.parameter.tapFrequency).toBe('always');

            // Verify result
            expect(resultWhistle.skillCount).toBe(0);
            expect(resultWhistle.berryStrength).toBe(result3Hours.berryStrength);
            expect(resultWhistle.ingStrength).toBe(result3Hours.ingStrength);
        });
    });

    describe('isFavoriteBerry', () => {
        test('returns false for noFavoriteFieldIndex', () => {
            const iv = new PokemonIv('Pikachu');
            const param = createParam({ fieldIndex: -1 });
            const strength = new PokemonStrength(iv, param);

            expect(strength.isFavoriteBerry).toBe(false);
        });

        test('returns true for allFavoriteFieldIndex', () => {
            const iv = new PokemonIv('Pikachu');
            const param = createParam({ fieldIndex: -2 });
            const strength = new PokemonStrength(iv, param);

            expect(strength.isFavoriteBerry).toBe(true);
        });
    });

    describe('berryStrengthBonus', () => {
        test('returns 2 for favorite berry', () => {
            const iv = new PokemonIv('Pikachu');
            const param = createParam({
                fieldIndex: -2, // allFavoriteFieldIndex
            });
            const strength = new PokemonStrength(iv, param);

            expect(strength.berryStrengthBonus).toBe(2);
        });

        test('returns 1 for non-favorite berry', () => {
            const iv = new PokemonIv('Pikachu');
            const param = createParam({
                fieldIndex: -1, // noFavoriteFieldIndex
            });
            const strength = new PokemonStrength(iv, param);

            expect(strength.berryStrengthBonus).toBe(1);
        });
    });

    describe('totalFlags', () => {
        test('controls which components are included in total strength', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 50;

            // [true, true, true] - all components
            let param = createParam({ totalFlags: [true, true, true] });
            let strength = new PokemonStrength(iv, param);
            let result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(
                result.berryTotalStrength + result.ingStrength + result.skillStrength + result.skillStrength2
            );

            // [true, false, false] - berry only
            param = createParam({ totalFlags: [true, false, false] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(result.berryTotalStrength);

            // [true, false, true] - berry + skill
            param = createParam({ totalFlags: [true, false, true] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(
                result.berryTotalStrength + result.skillStrength + result.skillStrength2
            );

            // [false, false, false] - nothing
            param = createParam({ totalFlags: [false, false, false] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBe(0);
        });
    });

    describe('helpingBonusStrength', () => {
        test('does not calculates additional strength when addHelpingBonusEffect is false', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 10;
            iv.subSkills = new SubSkillList([new SubSkill('Helping Bonus')]);

            const param = createParam({ helpBonusCount: 0, addHelpingBonusEffect: false });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;

            expect(result.helpingBonusStrength).toBe(0);
            expect(result.totalStrength).toBeCloseTo(baseTotal);
        });

        test('calculates additional strength when Helping Bonus sub-skill is active', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 10;
            iv.subSkills = new SubSkillList([new SubSkill('Helping Bonus')]);

            const param = createParam({ helpBonusCount: 0, addHelpingBonusEffect: true });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // When helpBonusCount is 0:
            // currentFactor = 1 - 0.05 * 0 = 1.0
            // newFactor = 1 - 0.05 * 1 = 0.95
            // rate = 1.0 / 0.95 - 1 ≈ 0.0526
            // helpingBonusStrength = baseTotal * rate * 4
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;
            const expectedRate = 1.0 / 0.95 - 1;
            const expectedHelpingBonus = baseTotal * expectedRate * 4;

            expect(result.helpingBonusStrength).toBeCloseTo(expectedHelpingBonus);
            expect(result.totalStrength).toBeCloseTo(baseTotal + expectedHelpingBonus);
        });

        test('calculates correctly with different helpBonusCount values', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 10;
            iv.subSkills = new SubSkillList([new SubSkill('Helping Bonus')]);

            // Test with helpBonusCount = 1
            const param = createParam({ helpBonusCount: 1, addHelpingBonusEffect: true });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // currentFactor = 1 - 0.05 * 1 = 0.95
            // newFactor = 1 - 0.05 * 2 = 0.9
            // rate = 0.95 / 0.9 - 1 ≈ 0.0556
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;
            const expectedRate = 0.95 / 0.9 - 1;
            const expectedHelpingBonus = baseTotal * expectedRate * 4;

            expect(result.helpingBonusStrength).toBeCloseTo(expectedHelpingBonus);
            expect(result.totalStrength).toBeCloseTo(baseTotal + expectedHelpingBonus);
        });
    });

    describe('isSkillStrengthCalculated', () => {
        test('returns false for skills with zero strength and true for skills with non-zero strength', () => {
            // Test each skill
            MainSkillNames.forEach(skillName => {
                // Find a pokemon with this skill
                const pokemon = pokemons.find(p => p.skill === skillName);
                if (!pokemon) {
                    return; // Skip if no pokemon found (shouldn't happen)
                }

                // Create IV and calculate strength
                const iv = new PokemonIv(pokemon.name);
                iv.level = 50;
                iv.skillLevel = 6;
                const param = createParam({ period: 24 });
                const strength = new PokemonStrength(iv, param);
                const result = strength.calculate();

                const hasZeroStrength = result.skillStrength === 0 && result.skillStrength2 === 0;
                const isCalculatedAsZero = isSkillStrengthZero(skillName);

                expect(hasZeroStrength).toBe(isCalculatedAsZero);
            });
        });
    });

    describe('recipeBonus for ingredient skills', () => {
        test('when recipeBonus is 0, ingFactor uses simplified formula', () => {
            // Vaporeon has "Ingredient Magnet S" skill
            const iv = new PokemonIv('Vaporeon');

            // recipeBonus = 0 should result in ingInRecipeStrengthRatio = 1
            const param0 = createParam({ recipeBonus: 0, recipeLevel: 1, fieldBonus: 0 });
            const strength0 = new PokemonStrength(iv, param0);
            const result0 = strength0.calculate();

            // With recipeBonus = 0 and fieldBonus = 0, ingFactor should be 1
            // skillStrength should be based only on base calculation
            expect(result0.skillStrength).toBeGreaterThan(0);

            // Test with fieldBonus = 50
            const param50 = createParam({ recipeBonus: 0, recipeLevel: 1, fieldBonus: 50 });
            const strength50 = new PokemonStrength(iv, param50);
            const result50 = strength50.calculate();

            // With recipeBonus = 0, fieldBonus only affects the ingFactor
            // skillStrength should scale by 1.5
            expect(result50.skillStrength).toBeCloseTo(result0.skillStrength * 1.5);
        });

        test('when recipeBonus > 0, skillStrength increases with higher recipeLevel', () => {
            // Vaporeon has "Ingredient Magnet S" skill
            const iv = new PokemonIv('Vaporeon');

            // recipeLevel = 1 (0% bonus)
            const paramLevel1 = createParam({ recipeBonus: 25, recipeLevel: 1, fieldBonus: 0 });
            const strengthLevel1 = new PokemonStrength(iv, paramLevel1);
            const resultLevel1 = strengthLevel1.calculate();

            // recipeLevel = 50 (142% bonus)
            const paramLevel50 = createParam({ recipeBonus: 25, recipeLevel: 50, fieldBonus: 0 });
            const strengthLevel50 = new PokemonStrength(iv, paramLevel50);
            const resultLevel50 = strengthLevel50.calculate();

            // Higher recipeLevel should result in higher skill strength
            expect(resultLevel50.skillStrength).toBeGreaterThan(resultLevel1.skillStrength);

            // Level 1: ingInRecipeStrengthRatio = 1.25 * 1.0 = 1.25
            // ingFactor = 1.25 * 0.8 + 0.2 = 1.2
            const ingFactorLevel1 = 1.25 * 0.8 + 0.2;

            // Level 50: ingInRecipeStrengthRatio = 1.25 * 2.42 = 3.025
            // ingFactor = 3.025 * 0.8 + 0.2 = 2.62
            const ingFactorLevel50 = (1.25 * 2.42) * 0.8 + 0.2;

            // Verify the ratio between them
            expect(resultLevel50.skillStrength / resultLevel1.skillStrength)
                .toBeCloseTo(ingFactorLevel50 / ingFactorLevel1);
        });

        test('recipeBonus 0 vs non-zero produces different results', () => {
            // Vaporeon has "Ingredient Magnet S" skill
            const iv = new PokemonIv('Vaporeon');

            // recipeBonus = 0
            const param0 = createParam({ recipeBonus: 0, recipeLevel: 30, fieldBonus: 0 });
            const strength0 = new PokemonStrength(iv, param0);
            const result0 = strength0.calculate();

            // recipeBonus = 25, recipeLevel = 30 (61% bonus)
            const param25 = createParam({ recipeBonus: 25, recipeLevel: 30, fieldBonus: 0 });
            const strength25 = new PokemonStrength(iv, param25);
            const result25 = strength25.calculate();

            // With recipeBonus = 0: ingFactor = 1
            // With recipeBonus = 25, recipeLevel = 30:
            // ingInRecipeStrengthRatio = 1.25 * 1.61 = 2.0125
            // ingFactor = 2.0125 * 0.8 + 0.2 = 1.81
            const expectedRatio = (2.0125 * 0.8 + 0.2);
            expect(result25.skillStrength).toBeCloseTo(result0.skillStrength * expectedRatio);
        });

        test('fieldBonus combines with recipeBonus correctly', () => {
            // Vaporeon has "Ingredient Magnet S" skill
            const iv = new PokemonIv('Vaporeon');

            // Base case with recipeBonus = 25 but fieldBonus = 0
            const paramBase = createParam({ recipeBonus: 25, recipeLevel: 30, fieldBonus: 0 });
            const strengthBase = new PokemonStrength(iv, paramBase);
            const resultBase = strengthBase.calculate();

            // With fieldBonus = 50
            const param50 = createParam({ recipeBonus: 25, recipeLevel: 30, fieldBonus: 50 });
            const strength50 = new PokemonStrength(iv, param50);
            const result50 = strength50.calculate();

            // fieldBonus = 50 should multiply ingFactor by 1.5
            expect(result50.skillStrength).toBeCloseTo(resultBase.skillStrength * 1.5);
        });

        test('Cooking Power-Up S skill strength is not affected by recipeBonus', () => {
            // Magnemite has "Cooking Power-Up S" skill
            const iv = new PokemonIv('Magnemite');
            iv.level = 50;

            // recipeBonus = 0
            const param0 = createParam({ recipeBonus: 0, recipeLevel: 30, fieldBonus: 0 });
            const strength0 = new PokemonStrength(iv, param0);
            const result0 = strength0.calculate();

            // Skill strength should be the same regardless of recipeBonus
            // recipeBonus = 25, recipeLevel = 30
            const param25 = createParam({ recipeBonus: 25, recipeLevel: 30, fieldBonus: 0 });
            const strength25 = new PokemonStrength(iv, param25);
            const result25 = strength25.calculate();
            expect(result25.skillStrength).toBeCloseTo(result0.skillStrength);

            // Skill strength should be x1.5
            // recipeBonus = 25, recipeLevel = 30, fieldBonus: 50
            const param50 = createParam({ recipeBonus: 25, recipeLevel: 30, fieldBonus: 50 });
            const strength50 = new PokemonStrength(iv, param50);
            const result50 = strength50.calculate();
            expect(result50.skillStrength).toBeCloseTo(result25.skillStrength * 1.5);
        });
    });
});

