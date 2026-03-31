import { describe, test, expect } from 'vitest';
import PokemonIv from './PokemonIv';
import { HelpCountSimulation } from './HelpCount';

describe('HelpCountSimulation', () => {
    describe('Basic', () => {
        test('compute(0) returns zero sneaky snacking and all-zero ingredients', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30, ingredient: 'ABC'});
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(0);

            expect(result.normalHelpCount).toBe(0);
            expect(result.sneakySnackingCount).toBe(0);
            expect(result.berryCount).toBe(0);
            expect(result.ingredientCount).toStrictEqual([0, 0]);
            expect(result.overflowIngsPerSlot).toStrictEqual([0, 0]);
        });

        test('compute(0) for level 60 returns 3 zero ingredients', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60, ingredient: 'ABC'});
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(0);

            expect(result.normalHelpCount).toBe(0);
            expect(result.sneakySnackingCount).toBe(0);
            expect(result.berryCount).toBe(0);
            expect(result.ingredientCount).toStrictEqual([0, 0, 0]);
            expect(result.overflowIngsPerSlot).toStrictEqual([0, 0, 0]);
        });
    });

    describe('Simple case with real PokemonIv', () => {
        test('Toxel 1 help', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                level: 60,
                ingredient: 'ABB', // Apple x2 (Lv30), x4 (Lv60)
                baseIngRate: 30,
                baseSkillRate: 5,
            });
            expect(iv.carryLimit).toBe(6); // Assume carryLimit is 6

            // == 1 help ==
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(1);
            expect(result.berryCount).toBe(1 * 0.7);
            expect(result.ingredientCount.length).toBe(2);
            // Milk x1: Pm1
            expect(result.ingredientCount[0]).toBeCloseTo(0.1);
            // Apple x2: 2 * Pa2
            // Apple x4: 4 * Pa4
            expect(result.ingredientCount[1]).toBeCloseTo(
                2 * 0.1 + 4 * 0.1
            );
            expect(result.normalHelpCount).toBe(1);
            expect(result.sneakySnackingCount).toBe(0);
            expect(result.overflowIngsPerSlot).toStrictEqual([0, 0, 0]);

            expect(result.skillOnce).toBeCloseTo(0.05);
            expect(result.skillTwice).toBeCloseTo(0);
        });

        test('Toxel 2 helps', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                level: 60,
                ingredient: 'ABB', // Apple x2 (Lv30), x4 (Lv60)
                baseIngRate: 30,
                baseSkillRate: 5,
            });
            expect(iv.carryLimit).toBe(6); // Assume carryLimit is 6

            // == 2 helps ==
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(2);
            expect(result.berryCount).toBeCloseTo(
                2 * 0.7 * 0.7 +   // 2 berries
                1 * 2 * 0.7 * 0.3 // 2C1 * Pb * Pi
            );
            expect(result.ingredientCount).toHaveLength(2);
            // Milk x2: 1C1 * Pm1 * Pm1
            // Milk x1: 2C1 * Pm1 * (1 - Pm1)
            expect(result.ingredientCount[0]).toBeCloseTo(
                2 * 0.1 * 0.1 + 2 * 0.1 * 0.9
            );
            // Apple x6: Pa2 * Pa4 + Pa4 * Pa2 + Pa4 * Pa4 (Apple 2+4, 4+2, 4+4)
            // Apple x4:
            //    Apple 2+2: Pa2 * Pa2 +
            //    Apple 4+0: 2C1 * Pa4 * (1 - Pa2 - Pa4)
            // Apple x2: 2C1 * Pa2 * (1 - Pa2 - Pa4) (Apple 2+0)
            expect(result.ingredientCount[1]).toBeCloseTo(
                6 * (3 * 0.1 * 0.1) +
                4 * (1 * 0.1 * 0.1 + 2 * 0.1 * 0.8) +
                2 * (2 * 0.1 * 0.8)
            );
            expect(result.sneakySnackingCount).toBe(0);
            expect(result.overflowIngsPerSlot).toHaveLength(3);
            expect(result.overflowIngsPerSlot[0]).toBe(0);
            expect(result.overflowIngsPerSlot[1]).toBe(0);
            // Overflow 2 apples: (Apple x4) x 2
            expect(result.overflowIngsPerSlot[2]).toBeCloseTo(2 * 0.1 * 0.1);

            const p = 0.05;
            expect(result.skillOnce).toBeCloseTo(2 * p * (1 - p), 5);
            expect(result.skillTwice).toBeCloseTo(p * p, 5);
        });

        test('Toxel 3 helps', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                level: 60,
                ingredient: 'ABB', // Apple x2 (Lv30), x4 (Lv60)
                baseIngRate: 30,
                baseSkillRate: 5,
            });
            expect(iv.carryLimit).toBe(6); // Assume carryLimit is 6

            // == 3 helps ==
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(3);
            const snack3 = 3 * 0.1 * 0.1; // Apple x6 at step 2
            expect(result.sneakySnackingCount).toBeCloseTo(snack3);
            expect(result.berryCount).toBeCloseTo(
                // 3 berries
                3 * 0.7 * 0.7 * 0.7 +
                // 2 berries: 3C1 * Pb^2 * Pi
                2 * 3 * 0.7 * 0.7 * 0.3 +
                // 1 berry: 3C1 * Pb * Pi^2
                1 * 3 * 0.7 * 0.3 * 0.3 +
                // sneaky snacking:
                // inventory fills at step 2, step 3 always adds berry (P=1)
                // instead of usual Pb=0.7
                (1 - 0.7) * snack3
            );
            expect(result.ingredientCount).toHaveLength(2);
            expect(result.ingredientCount[0]).toBeCloseTo(
                // Milk x3: Pm^3
                3 * 0.1 * 0.1 * 0.1 +
                // Milk x2: 3C1 * Pm^2 * (1 - Pm)
                2 * 3 * 0.1 * 0.1 * 0.9 +
                // Milk x1: 3C1 * Pm * (1 - Pm)^2
                1 * 3 * 0.1 * 0.9 * 0.9 -
                // sneaky snacking: full states at step 2 skip milk at step 3
                snack3 * 0.1
            );
            // At 3 helps, carry limit (6) causes complex interactions:
            // berries, milk, and apple all share inventory space, many states
            // overflow at step 3, and ingredient additions get capped.
            // Value verified via manual DP state trace.
            expect(result.ingredientCount[1]).toBeCloseTo(1.68);
            expect(result.overflowIngsPerSlot).toHaveLength(3);
            expect(result.overflowIngsPerSlot[0]).toBe(0);
            expect(result.overflowIngsPerSlot[1]).toBeCloseTo(0.016);
            expect(result.overflowIngsPerSlot[2]).toBeCloseTo(0.086);

            const p = 0.05;
            expect(result.skillOnce).toBeCloseTo(
                snack3 * 2 * p * (1 - p) +
                (1 - snack3) * 3 * p * Math.pow(1 - p, 2),
                5
            );
            expect(result.skillTwice).toBeCloseTo(
                snack3 * p * p +
                (1 - snack3) * (1 - Math.pow(1 - p, 3) - 3 * p * Math.pow(1 - p, 2)),
                5
            );
        });
    });

    describe('Probability conservation', () => {
        test('normalHelpCount + sneakySnackingCount equals n for each n', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const sim = new HelpCountSimulation(iv);

            for (let n = 1; n <= 15; n++) {
                const result = sim.compute(n);
                expect(result.normalHelpCount + result.sneakySnackingCount).toBeCloseTo(n, 10);
            }
        });
    });

    describe('Level-dependent ingredient counts', () => {
        test('level 60 with same ingredient (AAA) returns 1 distinct ingredient', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 60,
                ingredient: 'AAA',
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            // AAA means all three ingredient slots produce the same ingredient
            expect(result.ingredientCount).toHaveLength(1);
            expect(result.ingredientCount[0]).toBeGreaterThan(0);
        });

        test('level 10 returns 1 ingredient expected value', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 10,
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            expect(result.ingredientCount).toHaveLength(1);
            expect(result.ingredientCount[0]).toBeGreaterThan(0);
        });

        test('Mew with all mythIng set has 3 distinct ingredients at level 60', () => {
            const iv = new PokemonIv({
                pokemonName: 'Mew',
                level: 60,
                mythIng1: 'egg',
                mythIng2: 'herb',
                mythIng3: 'soy',
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            expect(result.ingredientCount).toHaveLength(3);
            for (const ing of result.ingredientCount) {
                expect(ing).toBeGreaterThan(0);
            }
            expect(result.berryCount).toBeGreaterThan(0);
        });

        test('Mew with all mythIng set has same ingredients at level 60', () => {
            const iv = new PokemonIv({
                pokemonName: 'Mew',
                level: 60,
                mythIng1: 'egg',
                mythIng2: 'egg',
                mythIng3: 'egg',
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            expect(result.ingredientCount).toHaveLength(1);
            expect(result.berryCount).toBeGreaterThan(0);
        });

        test('Mew with unknown mythIng3 has 2 ingredients at level 60', () => {
            const iv = new PokemonIv({
                pokemonName: 'Mew',
                level: 60,
                mythIng1: 'egg',
                mythIng2: 'herb',
                // mythIng3 not set, defaults to "unknown"
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            expect(result.ingredientCount).toHaveLength(2);
            for (const ing of result.ingredientCount) {
                expect(ing).toBeGreaterThan(0);
            }
        });

        test('Darkrai with default mythIng has 1 ingredient at level 60', () => {
            const iv = new PokemonIv({
                pokemonName: 'Darkrai',
                level: 60,
                // mythIng2 and mythIng3 default to "unknown" via ing2.name/ing3.name
            });
            const sim = new HelpCountSimulation(iv);
            const result = sim.compute(10);

            expect(result.ingredientCount).toHaveLength(1);
            expect(result.ingredientCount[0]).toBeGreaterThan(0);
        });
    });

    describe('Good camp ticket', () => {
        test('good camp ticket increases carry limit by 20%', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});

            const simNormal = new HelpCountSimulation(iv, false);
            const simTicket = new HelpCountSimulation(iv, true);

            const n = 20;
            const resultNormal = simNormal.compute(n);
            const resultTicket = simTicket.compute(n);

            // With good camp ticket, carry limit is larger, so inventory fills slower
            // => fewer sneaky snacking events
            expect(resultTicket.sneakySnackingCount).toBeLessThan(
                resultNormal.sneakySnackingCount
            );

            // Total expected ingredients should be higher with ticket
            // (more space = fewer full events = more ingredients gathered normally)
            const totalNormal = resultNormal.ingredientCount.reduce((a, b) => a + b, 0);
            const totalTicket = resultTicket.ingredientCount.reduce((a, b) => a + b, 0);
            expect(totalTicket).toBeGreaterThanOrEqual(totalNormal);
        });
    });

    describe('skillTwice by specialty', () => {
        test('Pikachu (Berries specialty): skillTwice is always 0', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const sim = new HelpCountSimulation(iv);
            for (let n = 1; n <= 10; n++) {
                expect(sim.compute(n).skillTwice).toBe(0);
            }
        });

        test('Bulbasaur (Ingredients specialty): skillTwice is always 0', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 30});
            const sim = new HelpCountSimulation(iv);
            for (let n = 1; n <= 10; n++) {
                expect(sim.compute(n).skillTwice).toBe(0);
            }
        });

        test('Toxel (Skills specialty): skillTwice is non-zero for n >= 2', () => {
            const iv = new PokemonIv({pokemonName: 'Toxel', level: 30});
            const sim = new HelpCountSimulation(iv);
            for (let n = 2; n <= 10; n++) {
                expect(sim.compute(n).skillTwice).toBeGreaterThan(0);
            }
        });

        test('Mew (All specialty): skillTwice is non-zero for n >= 2', () => {
            const iv = new PokemonIv({pokemonName: 'Mew', level: 30});
            const sim = new HelpCountSimulation(iv);
            expect(sim.compute(1).skillTwice).toBeCloseTo(0);
            for (let n = 2; n <= 10; n++) {
                expect(sim.compute(n).skillTwice).toBeGreaterThan(0);
            }
        });
    });

    describe('Monotonicity', () => {
        test('sneakySnackingCount, expectedBerries, and expectedIngredients increase monotonically with N', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const sim = new HelpCountSimulation(iv);

            let prev = sim.compute(1);
            for (let n = 2; n <= 20; n++) {
                const curr = sim.compute(n);
                expect(curr.sneakySnackingCount).toBeGreaterThanOrEqual(prev.sneakySnackingCount);
                expect(curr.berryCount).toBeGreaterThanOrEqual(prev.berryCount);
                for (let j = 0; j < curr.ingredientCount.length; j++) {
                    expect(curr.ingredientCount[j]).toBeGreaterThanOrEqual(prev.ingredientCount[j]);
                }
                prev = curr;
            }
        });
    });
});
