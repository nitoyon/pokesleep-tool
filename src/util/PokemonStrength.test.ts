import PokemonStrength, {
    createStrengthParameter, StrengthParameter,
} from './PokemonStrength';
import PokemonIv from './PokemonIv';
import Nature from './Nature';

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
});

