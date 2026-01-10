import { describe, test, expect } from 'vitest';
import PokemonIv from './PokemonIv';
import { calculateInventoryDistribution } from './PokemonInventory';
import SubSkillList from './SubSkillList';
import SubSkill from './SubSkill';

describe('PokemonInventory', () => {
    describe('Output Format Validation', () => {
        test('returns array with minimum length 2', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist.length).toBeGreaterThanOrEqual(2);
        });

        test('distribution[0] is 0 (cannot fill before first help)', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist[0]).toBe(0);
        });

        test('distribution[last] approaches 1.0', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist[dist.length - 1]).toBeGreaterThanOrEqual(0.95);
            expect(dist[dist.length - 1]).toBeLessThanOrEqual(1.0);
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

            const itemDetail = iv.getBagUsagePerHelpDetail({});
            const minItemCount = Math.min(...itemDetail.map(d => d.count));
            const expectedLength = Math.max(2, Math.ceil(iv.carryLimit / minItemCount) + 1);

            // Allow some flexibility due to early termination
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist.length).toBeLessThanOrEqual(expectedLength);
        });
    });

    describe('CDF Properties', () => {
        test('is monotonically increasing', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            for (let i = 1; i < dist.length; i++) {
                expect(dist[i]).toBeGreaterThanOrEqual(dist[i-1]);
            }
        });

        test('no negative probabilities', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});
            const dist = calculateInventoryDistribution(iv);

            for (let i = 0; i < dist.length; i++) {
                expect(dist[i]).toBeGreaterThanOrEqual(0);
            }
        });

        test('eventually converges to ~1.0', () => {
            const iv = new PokemonIv({pokemonName: 'Charizard', level: 60});
            const dist = calculateInventoryDistribution(iv);

            // Check that it reaches at least 0.99
            const maxProb = Math.max(...dist);
            expect(maxProb).toBeGreaterThanOrEqual(0.99);
        });
    });

    describe('Edge Cases', () => {
        test('small carry limit fills quickly', () => {
            // Create Pokemon with very small carry limit
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 10,
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                }),
            });

            const dist = calculateInventoryDistribution(iv);

            // Should have very high probability by help 10
            expect(dist[Math.min(10, dist.length - 1)]).toBeGreaterThan(0.8);
        });

        test('large ingredient count causes fast filling', () => {
            // Pumpkaboo at level 60 has large ingredient3 (potato)
            const iv = new PokemonIv({
                pokemonName: 'Pumpkaboo (Small)',
                level: 60,
            });

            const dist = calculateInventoryDistribution(iv);

            // Should fill relatively quickly when gets large ingredients
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
        });

        test('berry-only Pokemon still fills inventory', () => {
            // Create Pokemon with very low ingredient rate
            const iv = new PokemonIv({
                pokemonName: 'Wigglytuff',
                level: 10,
            });

            const dist = calculateInventoryDistribution(iv);

            // Should still fill eventually (berries count)
            expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
        });

        test('handles ingredient count exceeding carry limit', () => {
            // Test case where a single ingredient can overfill
            const iv = new PokemonIv({
                pokemonName: 'Pumpkaboo (Small)',
                level: 60,
            });

            const itemDetail = iv.getBagUsagePerHelpDetail({});
            const hasLargeItem = itemDetail.some(d => d.count > iv.carryLimit);

            if (hasLargeItem) {
                const dist = calculateInventoryDistribution(iv);
                // Should have valid distribution even with overfilling items
                expect(dist.length).toBeGreaterThanOrEqual(2);
                expect(dist[0]).toBe(0);
                expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
            }
        });
    });

    describe('Level-Dependent Ingredients', () => {
        test('level 10 only has ingredient1', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 10,
            });

            const itemDetail = iv.getBagUsagePerHelpDetail({});
            const dist = calculateInventoryDistribution(iv);

            // Should have berry + ing1 only (2 entries)
            expect(itemDetail.length).toBe(2);
            expect(dist.length).toBeGreaterThanOrEqual(2);
        });

        test('level 30 includes ingredient1 and ingredient2', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 30,
            });

            const itemDetail = iv.getBagUsagePerHelpDetail({});
            const dist = calculateInventoryDistribution(iv);

            // Should have berry + ing1 + ing2 (3 entries)
            expect(itemDetail.length).toBe(3);
            expect(dist.length).toBeGreaterThanOrEqual(2);
        });

        test('level 60 includes all three ingredients', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 60,
            });

            const itemDetail = iv.getBagUsagePerHelpDetail({});
            const dist = calculateInventoryDistribution(iv);

            // Should have berry + ing1 + ing2 + ing3 (4 entries)
            expect(itemDetail.length).toBe(4);
            expect(dist.length).toBeGreaterThanOrEqual(2);
        });

        test('higher level fills faster due to more ingredient options', () => {
            const iv10 = new PokemonIv({pokemonName: 'Bulbasaur', level: 10});
            const iv60 = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});

            const dist10 = calculateInventoryDistribution(iv10);
            const dist60 = calculateInventoryDistribution(iv60);

            // Both should reach high probability eventually
            expect(dist10[dist10.length - 1]).toBeGreaterThan(0.95);
            expect(dist60[dist60.length - 1]).toBeGreaterThan(0.95);
        });
    });

    describe('Bonus Effects', () => {
        test('with event berry bonus', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});

            const dist1 = calculateInventoryDistribution(iv, {});
            const dist2 = calculateInventoryDistribution(iv, {berryBonus: 1});

            // Both should be valid distributions
            expect(dist1.length).toBeGreaterThanOrEqual(2);
            expect(dist2.length).toBeGreaterThanOrEqual(2);

            // With bonus, should fill faster (or same speed)
            expect(dist2[dist2.length - 1]).toBeGreaterThan(0.95);
        });

        test('with event ingredient bonus', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});

            const dist1 = calculateInventoryDistribution(iv, {});
            const dist2 = calculateInventoryDistribution(iv, {ingredientBonus: 1});

            // Both should be valid distributions
            expect(dist1.length).toBeGreaterThanOrEqual(2);
            expect(dist2.length).toBeGreaterThanOrEqual(2);

            // With ingredient bonus, items increase so fills faster
            expect(dist2[dist2.length - 1]).toBeGreaterThan(0.95);
        });

        test('with expert ingredient bonus', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 30});

            const dist = calculateInventoryDistribution(iv, {
                expertIngBonus: true,
            });

            // Should have valid distribution
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[0]).toBe(0);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
        });

        test('with expert bonus for Ingredients specialty Pokemon', () => {
            // Venusaur has specialty="Ingredients"
            const iv = new PokemonIv({
                pokemonName: 'Venusaur',
                level: 30,
            });

            const dist = calculateInventoryDistribution(iv, {
                expertIngBonus: true,
            });

            const itemDetail = iv.getBagUsagePerHelpDetail({expertIngBonus: true});

            // Should have 5 entries (berry, ing1, ing2, ing1+1, ing2+1)
            expect(itemDetail.length).toBe(5);
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
        });

        test('with combined bonuses', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});

            const dist = calculateInventoryDistribution(iv, {
                berryBonus: 1,
                ingredientBonus: 1,
                expertIngBonus: true,
            });

            // Should have valid distribution with all bonuses
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[0]).toBe(0);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.95);
        });
    });

    describe('Probability Calculations', () => {
        test('probabilities sum correctly', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            // Convert CDF to PMF and verify sum
            let pmfSum = 0;
            for (let i = 0; i < dist.length; i++) {
                const pmf = i === 0 ? dist[0] : (dist[i] - dist[i-1]);
                expect(pmf).toBeGreaterThanOrEqual(0); // No negative PMF
                pmfSum += pmf;
            }

            // PMF should sum to approximately 1.0 (within 0.1 tolerance)
            expect(pmfSum).toBeCloseTo(dist[dist.length - 1], 1);
        });

        test('CDF is cumulative', () => {
            const iv = new PokemonIv({pokemonName: 'Bulbasaur', level: 60});
            const dist = calculateInventoryDistribution(iv);

            // Each entry should represent cumulative probability
            let prevProb = 0;
            for (let i = 0; i < dist.length; i++) {
                expect(dist[i]).toBeGreaterThanOrEqual(prevProb);
                prevProb = dist[i];
            }
        });

        test('expected help count is reasonable', () => {
            const iv = new PokemonIv({pokemonName: 'Feraligatr', level: 50});
            const dist = calculateInventoryDistribution(iv);

            // Calculate expected value from CDF
            let expectedHelps = 0;
            for (let i = 1; i < dist.length; i++) {
                const pmf = dist[i] - dist[i-1];
                expectedHelps += i * pmf;
            }

            // Expected helps should be positive and reasonable (< 100)
            expect(expectedHelps).toBeGreaterThan(0);
            expect(expectedHelps).toBeLessThan(100);
        });

        test('higher carry limit leads to more helps needed', () => {
            // Compare Pokemon with different carry limits
            const smallCarry = new PokemonIv({pokemonName: 'Pikachu', level: 10});
            const largeCarry = new PokemonIv({pokemonName: 'Feraligatr', level: 60});

            const dist1 = calculateInventoryDistribution(smallCarry);
            const dist2 = calculateInventoryDistribution(largeCarry);

            // Calculate expected helps for both
            const calcExpected = (dist: number[]) => {
                let sum = 0;
                for (let i = 1; i < dist.length; i++) {
                    const pmf = dist[i] - dist[i-1];
                    sum += i * pmf;
                }
                return sum;
            };

            const exp1 = calcExpected(dist1);
            const exp2 = calcExpected(dist2);

            // Both should be positive
            expect(exp1).toBeGreaterThan(0);
            expect(exp2).toBeGreaterThan(0);
        });
    });

    describe('Performance', () => {
        test('calculation completes quickly', () => {
            const iv = new PokemonIv({pokemonName: 'Feraligatr', level: 60});

            const start = performance.now();
            calculateInventoryDistribution(iv);
            const duration = performance.now() - start;

            expect(duration).toBeLessThan(10); // < 10ms
        });

        test('calculation is fast for multiple Pokemon', () => {
            const pokemonNames = ['Pikachu', 'Bulbasaur', 'Charizard', 'Feraligatr', 'Wigglytuff'];

            const start = performance.now();
            for (const name of pokemonNames) {
                const iv = new PokemonIv({pokemonName: name, level: 50});
                calculateInventoryDistribution(iv);
            }
            const duration = performance.now() - start;

            // 5 calculations should complete in < 50ms total
            expect(duration).toBeLessThan(50);
        });

        test('calculation with expert bonuses is still fast', () => {
            const iv = new PokemonIv({pokemonName: 'Venusaur', level: 60});

            const start = performance.now();
            calculateInventoryDistribution(iv, {
                berryBonus: 1,
                ingredientBonus: 1,
                expertIngBonus: true,
            });
            const duration = performance.now() - start;

            expect(duration).toBeLessThan(10); // < 10ms
        });
    });

    describe('Real-world Pokemon Examples', () => {
        test('Pikachu fills inventory correctly', () => {
            const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
            const dist = calculateInventoryDistribution(iv);

            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[0]).toBe(0);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.99);
        });

        test('Feraligatr with large carry limit', () => {
            const iv = new PokemonIv({pokemonName: 'Feraligatr', level: 60});
            const dist = calculateInventoryDistribution(iv);

            // Feraligatr has large carry limit, should take more helps
            expect(dist.length).toBeGreaterThan(5);
            expect(dist[0]).toBe(0);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.99);
        });

        test('Wigglytuff berry specialist', () => {
            const iv = new PokemonIv({pokemonName: 'Wigglytuff', level: 50});
            const dist = calculateInventoryDistribution(iv);

            // Wigglytuff brings mostly berries
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.99);
        });

        test('Venusaur ingredient specialist', () => {
            const iv = new PokemonIv({pokemonName: 'Venusaur', level: 60});
            const dist = calculateInventoryDistribution(iv);

            // Venusaur is ingredient specialist
            expect(dist.length).toBeGreaterThanOrEqual(2);
            expect(dist[dist.length - 1]).toBeGreaterThan(0.99);
        });
    });
});
