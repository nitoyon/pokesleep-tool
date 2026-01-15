import { describe, test, expect } from 'vitest';
import PokemonIv from './PokemonIv';
import { calculateInventoryDistribution } from './PokemonInventory';
import SubSkillList from './SubSkillList';
import SubSkill from './SubSkill';

describe('PokemonInventory', () => {
    describe('CDF Properties', () => {
        test('returns array with minimum length 2', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist.length).toBeGreaterThanOrEqual(2);
        });

        test('distribution[0] and distribution[last]', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist[0]).toBe(0);
            expect(dist[dist.length - 1]).toBeCloseTo(1, 5);
        });

        test('all values are in range [0, 1]', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});
            const dist = calculateInventoryDistribution(iv);

            for (let i = 0; i < dist.length; i++) {
                expect(dist[i]).toBeGreaterThanOrEqual(0);
                expect(dist[i]).toBeLessThanOrEqual(1.0);
            }
        });

        test('array length matches formula for normal Pokemon', () => {
            const iv = new PokemonIv({pokemonName: 'Feraligatr', level: 50});
            const dist = calculateInventoryDistribution(iv);

            const itemDetail = iv.getBagUsagePerHelpDetail();
            const minItemCount = Math.min(...itemDetail.map(d => d.count));

            const expectedLength = Math.ceil(iv.carryLimit / minItemCount) + 1;
            expect(dist.length).toBe(expectedLength);
        });
    });

    describe('Edge Cases', () => {
        test('small carry limit fills quickly', () => {
            // Create Pokemon with very small carry limit (6)
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                level: 60,
                ingredient: 'ABB', // Apple x4 (Lv60)
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                }),
            });
            const dist = calculateInventoryDistribution(iv);

            expect(dist[2]).toBeGreaterThan(0);
            expect(dist[3]).toBeGreaterThan(0.8);
        });

        test('large ingredient count causes fast filling', () => {
            // Pumpkaboo at level 30 with small carry limit (7)
            const iv = new PokemonIv({
                pokemonName: 'Pumpkaboo (Small)',
                level: 30,
                ingredient: 'ABB', // Soy x11 (Lv30)
            });
            const dist = calculateInventoryDistribution(iv);

            expect(dist[1]).toBe(iv.ingredientRate / 2);
            expect(dist[2]).toBeCloseTo(dist[1] +
                (1 - dist[1]) * iv.ingredientRate / 2,
            5);
        });
    });

    describe('Level-Dependent Ingredients', () => {
        test('level 10 only has ingredient1', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur', // Carry limit 11
                level: 10,
            });

            const dist = calculateInventoryDistribution(iv);
            expect(dist[0]).toBe(0);
            expect(dist[5]).toBe(0);
            // Fills when the ingredient is brought 5 times.
            expect(dist[6]).toBeCloseTo(
                Math.pow(iv.ingredientRate, 6) +
                6 * iv.berryRate * Math.pow(iv.ingredientRate, 5),
            5);
        });

        test('level 30 includes ingredient1 and ingredient2', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur', // Carry limit 11
                level: 30,
                ingredient: 'AAA', // Honey x5 (Lv30)
            });

            const dist = calculateInventoryDistribution(iv);
            expect(dist[0]).toBe(0);
            expect(dist[2]).toBe(0);
            expect(dist[3]).toBeGreaterThan(0);
        });

        test('level 60 includes all three ingredients', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur', // Carry limit 11
                level: 60,
                ingredient: 'AAA', // Honey x7 (Lv60)
            });

            const dist = calculateInventoryDistribution(iv);
            expect(dist[0]).toBe(0);
            expect(dist[1]).toBe(0);
            expect(dist[2]).toBeGreaterThan(0);
        });
    });

    describe('Bonus Effects', () => {
        test('with event berry bonus', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pichu', // Carry limit 10
                level: 10,
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                }),
            });

            // Fills quickly when brings 3 berries x3 times
            // pb^4 + 4C1 * pb^3 * pi
            // - pb: Get berry
            // - pi: Get ingredient
            const dist = calculateInventoryDistribution(iv);
            expect(dist[0]).toBe(0);
            expect(dist[3]).toBe(0);
            expect(dist[4]).toBeCloseTo(
                Math.pow(iv.berryRate, 4) +
                4 * Math.pow(iv.berryRate, 3) * iv.ingredientRate,
                5);

            // Fills quickly when brings 4 berries x3 times
            const dist2 = calculateInventoryDistribution(iv, false, {berryBonus: 1});
            expect(dist2[0]).toBe(0);
            expect(dist2[2]).toBe(0);
            expect(dist2[3]).toBeCloseTo(Math.pow(iv.berryRate, 3), 5);
        });

        test('with event ingredient bonus', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});

            const dist1 = calculateInventoryDistribution(iv, false, {});
            const dist2 = calculateInventoryDistribution(iv, false, {ingredientBonus: 1});

            // Both should be valid distributions
            expect(dist1.length).toBeGreaterThanOrEqual(2);
            expect(dist2.length).toBeGreaterThanOrEqual(2);

            // With ingredient bonus, items increase so fills faster
            expect(dist2[dist2.length - 1]).toBeGreaterThan(0.95);
        });

        test('with expert ingredient bonus distribution', () => {
            // Carry limit 11
            // Honey x3 (sometimes x4)
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 10});

            const dist = calculateInventoryDistribution(iv, false, {
                expertIngBonus: true,
            });
            expect(dist[0]).toBe(0);
            expect(dist[2]).toBe(0);
            // p4 * p4 * p4 + 3C1 * p4 * p4 * p3
            // - p4: Get 4 honey (iv.ingredientRate * 0.5)
            // - p3: Get 3 honey (iv.ingredientRate * 0.5)
            expect(dist[3]).toBe(
                Math.pow(iv.ingredientRate * 0.5, 3) + 
                3 * Math.pow(iv.ingredientRate * 0.5, 3));
        });
    });
});
