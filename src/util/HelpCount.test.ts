import { describe, test, expect } from 'vitest';
import PokemonIv from './PokemonIv';
import { emptyBonusEffects } from '../data/events';
import Energy, { AlwaysTap, EnergyParameter, NoTap } from './Energy';
import Nature from './Nature';
import {
    calculateHelpCount,
    calculateNextHelpElapsed,
    calculateHelpCountInInterval,
    calculateHelpCountPerTap,
    HelpCountSimulation,
} from './HelpCount';
import { calculateInventoryDistribution } from './PokemonInventory';

const paramBase = {
    period: 24,
    e4eEnergy: 18,
    e4eCount: 3,
    sleepScore: 100,
    tapFrequencyAwake: AlwaysTap,
    tapFrequencyAsleep: NoTap,
    helpBonusCount: 0,
    recoveryBonusCount: 0,
    isEnergyAlwaysFull: false,
    isGoodCampTicketSet: false,
    pityProc: false,
};
function createParam(obj: Partial<EnergyParameter>): EnergyParameter {
    return Object.assign({fieldIndex: 0}, paramBase, obj) as EnergyParameter;
}

describe('calculateHelpCount', () => {
    test('calculate timeToFullInventory and skillProbabilityAfterWakeup', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
            skillRate: 10,
            ingRate: 10,
        };

        const param = createParam({e4eCount: 0, sleepScore: 90});
        const energy = new Energy(iv).calculate(param);
        const result = calculateHelpCount(iv, param, energy,
            emptyBonusEffects, false);

        // sleep from 981 min
        const sleepEvent = energy.events.find(x => x.type === 'sleep');
        expect(sleepEvent).toEqual({
            type: 'sleep', minutes: 981,
            energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true,
        });

        // snacking from 981 + 300 min (30min x 10)
        expect(result.timeToFullInventory).toBe(300);
        expect(result.asleep.normal).toBe(10);
        expect(result.skillProbabilityAfterWakeup.once)
            .toBeCloseTo(10 * 0.1 * Math.pow(0.9, 9));
        expect(result.skillProbabilityAfterWakeup.twice)
            .toBeCloseTo(1 - Math.pow(0.9, 10) - result.skillProbabilityAfterWakeup.once);

        // change pokemon's specialty to Berries
        const iv2 = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
        });
        (iv2 as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv2.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
            specialty: "Berries",
            skillRate: 10,
            ingRate: 10,
        };
        const energy2 = new Energy(iv2).calculate(param);
        const result2 = calculateHelpCount(iv2, param, energy2,
            emptyBonusEffects, false);

        // snacking earlier
        expect(result2.timeToFullInventory).toBeLessThan(300);
        expect(result2.asleep.normal).toBeLessThan(result.asleep.normal);
    });

    test('no snacking (always tap)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
            skillRate: 10,
            ingRate: 10,
        };

        const param = createParam({
            e4eCount: 0,
            sleepScore: 90,
            tapFrequencyAsleep: AlwaysTap,
        });
        const energy = new Energy(iv).calculate(param);
        const result = calculateHelpCount(iv, param, energy,
            emptyBonusEffects, false);
        expect(result.timeToFullInventory).toBe(-1);
    });

    test('no snacking (3 hours)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Serious'), // Neutral
            level: 1,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
            skillRate: 10,
            ingRate: 10,
        };

        const param = createParam({
            sleepScore: 100,
            period: 3,
        });
        const energy = new Energy(iv).calculate(param);
        const result = calculateHelpCount(iv, param, energy,
            emptyBonusEffects, false);
        expect(result.awake.all).toBeCloseTo(180 * 60 / 1800 * 2.222);
        expect(result.asleep.sneakySnacking).toBe(0);
        expect(result.asleep.normal).toBe(0);
    });

    test('awake no tap (all sneaky snacking)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            level: 30,
        });

        const param = createParam({
            tapFrequencyAwake: NoTap,
        });
        const energy = new Energy(iv).calculate(param);
        const result = calculateHelpCount(iv, param, energy,
            emptyBonusEffects, false);
        expect(result.asleep.normal).toBe(0);
        expect(result.total.normal).toBe(0);
        expect(result.awake.normal).toBe(0);
        expect(result.awake.sneakySnacking).not.toBe(0);
    });

});

describe('calculateNextHelpElapsed', () => {
    test('uses frequencyRate from matching event', () => {
        // elapsed=1800s => elapsedMin=30 (2nd event)
        // frequencyRate=0.52
        expect(calculateNextHelpElapsed([
            { start: 0, end: 20, efficiency: 2.222, frequencyRate: 0.45, isAwake: true, isSnacking: false, isInPeriod: true },
            { start: 2, end: 40, efficiency: 1.923, frequencyRate: 0.52, isAwake: true, isSnacking: false, isInPeriod: true },
            { start: 40, end: 120, efficiency: 1.0, frequencyRate: 1, isAwake: false, isSnacking: false, isInPeriod: true },
        ], 1800, 1000)).toBe(1800 + 1000 * 0.52);
    });

    test('end boundary is exclusive, start boundary is inclusive', () => {
        expect(calculateNextHelpElapsed([
            { start: 0, end: 60, efficiency: 2.222, frequencyRate: 0.45, isAwake: true, isSnacking: false, isInPeriod: true },
            { start: 60, end: 120, efficiency: 1.0, frequencyRate: 1, isAwake: false, isSnacking: false, isInPeriod: true },
        ], 3600, 1000)).toBe(3600 + 1000 * 1);
    });

    test('falls back to frequencyRate=1 when no event matches', () => {
        // elapsed=8000s => elapsedMin=133.3, not in any event
        expect(calculateNextHelpElapsed([
            { start: 0, end: 60, efficiency: 2.222, frequencyRate: 0.45, isAwake: true, isSnacking: false, isInPeriod: true },
            { start: 60, end: 120, efficiency: 1.0, frequencyRate: 1, isAwake: false, isSnacking: false, isInPeriod: true },
        ], 8000, 1000)).toBe(8000 + 1000 * 1);
    });
});

describe('calculateHelpCountInInterval', () => {
    const efficiencies = [
        { start: 0, end: 60, efficiency: 2.222 as const, frequencyRate: 0.45 as const, isAwake: true, isSnacking: false, isInPeriod: true },
        { start: 60, end: 120, efficiency: 1.0 as const, frequencyRate: 1 as const, isAwake: false, isSnacking: false, isInPeriod: true },
    ];

    test('2 full helps within interval', () => {
        // baseFreq=1000, frequencyRate=1 (no event matches elapsed=7200s) => each help takes 1000s
        // interval=2000 => exactly 2 helps fit
        const result = calculateHelpCountInInterval(efficiencies, 7200, 1000, 2000);
        expect(result.count).toBe(2);
        expect(result.fractionalCount).toBe(0);
        expect(result.overflowSeconds).toBe(0);
        expect(result.elapsed).toBe(9200);
    });

    test('fractional help at interval boundary', () => {
        // baseFreq=1000, frequencyRate=1 (elapsed=7200s, no event) => each help takes 1000s
        // interval=1500 => 1 full help (1000s), then 500/1000 = 0.5 fractional
        const result = calculateHelpCountInInterval(efficiencies, 7200, 1000, 1500);
        expect(result.count).toBe(1);
        expect(result.fractionalCount).toBeCloseTo(0.5);
        expect(result.overflowSeconds).toBeCloseTo(500);
        expect(result.elapsed).toBe(8200);
    });

    test('zero interval returns count=0', () => {
        // baseFreq=1000, frequencyRate=1 (elapsed=7200s) => first help takes 1000s
        // interval=0 => no helps fit, fractionalCount=0
        const result = calculateHelpCountInInterval(efficiencies, 7200, 1000, 0);
        expect(result.count).toBe(0);
        expect(result.fractionalCount).toBe(0);
        expect(result.overflowSeconds).toBe(1000);
        expect(result.elapsed).toBe(7200);
    });

    test('interval shorter than one help returns count=0', () => {
        // baseFreq=1000, frequencyRate=1 (elapsed=7200s) => first help takes 1000s
        // interval=500 < 1000 => 0 full helps, fractionalCount=500/1000=0.5
        const result = calculateHelpCountInInterval(efficiencies, 7200, 1000, 500);
        expect(result.count).toBe(0);
        expect(result.fractionalCount).toBeCloseTo(0.5);
        expect(result.overflowSeconds).toBeCloseTo(500);
        expect(result.elapsed).toBe(7200);
    });

    test('crossing efficiency boundary', () => {
        // elapsed=3300s (55min) => frequencyRate=0.45, baseFreq=1000
        // 1st help: 3300 + 450 = 3750s (3750/60=62.5min => 2nd event, frequencyRate=1)
        // 2nd help: 3750 + 1000 = 4750s
        // interval=1500 => endTime=4800
        // 3750 <= 4800 => count=1, currentElapsed=3750
        // 4750 <= 4800 => count=2, currentElapsed=4750
        // next: 5750 > 4800 => fractional=(4800-4750)/1000=0.05, overflow=950
        const result = calculateHelpCountInInterval(efficiencies, 3300, 1000, 1500);
        expect(result.count).toBe(2);
        expect(result.fractionalCount).toBeCloseTo(0.05);
        expect(result.overflowSeconds).toBeCloseTo(950);
        expect(result.elapsed).toBe(4750);
    });
});

describe('calculateHelpCountPerTap', () => {
    test('returns empty array when duration is 0', () => {
        // tap interval=100s, duration=100s, baseFreq=40s
        expect(calculateHelpCountPerTap([], 0, 40, 100, 0)).toHaveLength(0);
    });

    test('tapInterval equals duration', () => {
        // tap interval=100s, duration=100s, baseFreq=40s
        expect(calculateHelpCountPerTap([], 0, 40, 100, 100)).toEqual([2.5]);
    });

    test('evenly divisible: 3 taps of 30s each, baseFreq=30s', () => {
        // Each tap interval=30s, baseFreq=30s => exactly 1 help per tap
        // tap1: [0,30): help at 30
        // tap1: [30,60): help at 60
        // tap1: [60,90): help at 90
        expect(calculateHelpCountPerTap([], 0, 30, 30, 90)).toEqual([1, 1, 1]);
    });

    test('last tap is shorter than tapInterval', () => {
        // tapInterval=60s, duration=100s, baseFreq=30s
        // tap1: [0,60): help at 30 and 60
        // tap2: [60,100): help at 90 and 1/3 help
        const result = calculateHelpCountPerTap([], 0, 30, 60, 100);
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(2);
        expect(result[1]).toBeCloseTo(1 + 1 / 3);
    });

    test('overflow help counted in next tap', () => {
        // tapInterval=50s, duration=150s, baseFreq=30s
        // tap1: [0,50): help at 30
        // tap2: [50,100): help at 60 and 90
        // tap3: [100,150): helps at 120 and 150 exactly
        const result = calculateHelpCountPerTap([], 0, 30, 50, 150);
        expect(result).toHaveLength(3);
        expect(result[0]).toBe(1);
        expect(result[1]).toBe(2);
        expect(result[2]).toBe(2);
    });

    test('overflow into last tap adds bonus count', () => {
        // tapInterval=50s, duration=70s, baseFreq=30s
        // tap1: [0,50): help at 30 
        // tap2: [50,70): help at 60 and 1/3 help
        const result = calculateHelpCountPerTap([], 0, 30, 50, 70);
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(1);
        expect(result[1]).toBeCloseTo(1 + 1 / 3);
    });

    test('duration equals tapInterval: single tap with fractional', () => {
        // tapInterval=100s, duration=100s, baseFreq=30s
        // tap1: [0,100): helps at 30, 60, 90 and 1/3 help
        const result = calculateHelpCountPerTap([], 0, 30, 100, 100);
        expect(result).toHaveLength(1);
        expect(result[0]).toBeCloseTo(3 + 1 / 3);
    });

    test('elapsed offset is respected', () => {
        // Start at elapsed=60s (1min), tapInterval=30s, duration=60s, baseFreq=30s
        // tap1: [60,90): help at 90, count=1, overflow=0 → push 1, helpStart=90
        // tap2 (last): [90,120): help at 120 exactly, count=1, fractional=0 → push 1
        expect(calculateHelpCountPerTap([], 60, 30, 30, 60)).toEqual([1, 1]);
    });

    test('overflowSeconds larger than tapInterval yields empty intermediate taps', () => {
        // baseFreq=200s, tapInterval=50s, duration=300s
        // tap1: [0,50): no help
        // tap2: [50,100): no help
        // tap3: [100,150): no help
        // tap4: [150,200): help at 200
        // tap5: [200,250): no help
        // tap6: [250,300): 1/2 help
        const result = calculateHelpCountPerTap([], 0, 200, 50, 300);
        expect(result).toHaveLength(2);
        expect(result[0]).toBe(1);
        expect(result[1]).toBeCloseTo(0.5);
    });
});

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

        test('Toxel float helps', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                level: 60,
                ingredient: 'ABB',
            });

            const sim = new HelpCountSimulation(iv);
            const result2 = sim.compute(2);
            const result3 = sim.compute(3);
            const result26 = sim.compute(2.6);

            // Check that 2.6 helps gives results between 2 and 3 helps
            expect(result26.berryCount).toBeGreaterThan(result2.berryCount);
            expect(result26.berryCount).toBeLessThan(result3.berryCount);
            expect(result26.berryCount).toBeCloseTo(
                (result3.berryCount - result2.berryCount) * 0.6 + result2.berryCount,
                5
            );
            for (let i = 0; i < result26.ingredientCount.length; i++) {
                expect(result26.ingredientCount[i]).toBeCloseTo(
                    (result3.ingredientCount[i] - result2.ingredientCount[i]) * 0.6 +
                    result2.ingredientCount[i],
                    5
                );
            }
            for (let i = 0; i < result26.overflowIngsPerSlot.length; i++) {
                expect(result26.overflowIngsPerSlot[i]).toBeCloseTo(
                    (result3.overflowIngsPerSlot[i] - result2.overflowIngsPerSlot[i]) * 0.6 +
                    result2.overflowIngsPerSlot[i],
                    5
                );
            }
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

    describe('returns same result as calculateInventoryDistribution', () => {
        test('Venusaur (Lv60 ABC)', () => {
            const iv = new PokemonIv({pokemonName: 'Venusaur', level: 60});
            const full = calculateInventoryDistribution(iv);

            const sim = new HelpCountSimulation(iv);
            let prev = 0;
            for (let n = 2; n <= 20; n++) {
                const res = sim.compute(n);
                expect(res.sneakySnackingCount - prev).toBeCloseTo(full[n - 1]);
                expect(res.normalHelpCount + res.sneakySnackingCount)
                    .toBeCloseTo(n);
                prev = res.sneakySnackingCount;
            }
        });
    });
});
