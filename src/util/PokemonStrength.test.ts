import PokemonStrength, {
    createStrengthParameter, StrengthParameter, whistlePeriod,
} from './PokemonStrength';
import PokemonIv from './PokemonIv';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

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
});

