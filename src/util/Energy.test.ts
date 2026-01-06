import Energy, { EnergyParameter, AlwaysTap, NoTap } from './Energy';
import Nature from './Nature';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

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

describe('Energy', () => {
    test('calculate (e4e x 0)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            subSkills: new SubSkillList({ lv10: new SubSkill('Inventory Up L') }),
        });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0}));

        expect(result.events).toEqual([
            { minutes: 0, type: 'wake', energyBefore: 0, energyAfter: 100, isSnacking: false, isInPeriod: true },
            { minutes: 120, type: 'cook', energyBefore: 88, energyAfter: 89, isSnacking: false, isInPeriod: true },
            { minutes: 360, type: 'cook', energyBefore: 65, energyAfter: 67, isSnacking: false, isInPeriod: true },
            { minutes: 720, type: 'cook', energyBefore: 31, energyAfter: 35, isSnacking: false, isInPeriod: true },
            { minutes: 930, type: 'sleep', energyBefore: 14, energyAfter: 14, isSnacking: false, isInPeriod: true },
            { minutes: 1070, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true },
            { minutes: 1440, type: 'wake', energyBefore: 0, energyAfter: 100, isSnacking: false, isInPeriod: true },
        ]);

        expect(result.efficiencies).toEqual([
            {start: 0, end: 210, efficiency: 2.222, isAwake: true, isSnacking: false, isInPeriod: true},
            {start: 210, end: 430, efficiency: 1.923, isAwake: true, isSnacking: false, isInPeriod: true},
            {start: 430, end: 630, efficiency: 1.724, isAwake: true, isSnacking: false, isInPeriod: true},
            {start: 630, end: 930, efficiency: 1.515, isAwake: true, isSnacking: false, isInPeriod: true},
            {start: 930, end: 1060, efficiency: 1.515, isAwake: false, isSnacking: false, isInPeriod: true},
            {start: 1060, end: 1440, efficiency: 1, isAwake: false, isSnacking: false, isInPeriod: true},
        ]);
    });

    test('calculate (e4e x 0, period 3)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            subSkills: new SubSkillList({ lv10: new SubSkill('Inventory Up L') }),
        });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0, period: 3}));

        expect(result.events).toEqual([
            { minutes: 0, type: 'wake', energyBefore: 0, energyAfter: 100, isSnacking: false, isInPeriod: true },
            { minutes: 120, type: 'cook', energyBefore: 88, energyAfter: 89, isSnacking: false, isInPeriod: true },
            { minutes: 180, type: 'empty', energyBefore: 83, energyAfter: 83, isSnacking: false, isInPeriod: false },
            { minutes: 360, type: 'cook', energyBefore: 65, energyAfter: 67, isSnacking: false, isInPeriod: false },
            { minutes: 720, type: 'cook', energyBefore: 31, energyAfter: 35, isSnacking: false, isInPeriod: false },
            { minutes: 930, type: 'sleep', energyBefore: 14, energyAfter: 14, isSnacking: false, isInPeriod: false },
            { minutes: 1070, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: false },
            { minutes: 1440, type: 'wake', energyBefore: 0, energyAfter: 100, isSnacking: false, isInPeriod: false },
        ]);

        expect(result.efficiencies).toEqual([
            {start: 0, end: 180, efficiency: 2.222, isAwake: true, isSnacking: false, isInPeriod: true},
            {start: 180, end: 210, efficiency: 2.222, isAwake: true, isSnacking: false, isInPeriod: false},
            {start: 210, end: 430, efficiency: 1.923, isAwake: true, isSnacking: false, isInPeriod: false},
            {start: 430, end: 630, efficiency: 1.724, isAwake: true, isSnacking: false, isInPeriod: false},
            {start: 630, end: 930, efficiency: 1.515, isAwake: true, isSnacking: false, isInPeriod: false},
            {start: 930, end: 1060, efficiency: 1.515, isAwake: false, isSnacking: false, isInPeriod: false},
            {start: 1060, end: 1440, efficiency: 1, isAwake: false, isSnacking: false, isInPeriod: false},
        ]);
    });

    test('calculate (e4e x 0, period 8, score: 0)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            subSkills: new SubSkillList({ lv10: new SubSkill('Inventory Up L') }),
        });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0, period: 8, sleepScore: 0}));

        expect(result.events).toEqual([
            { minutes: 0, type: 'wake', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true },
            { minutes: 120, type: 'cook', energyBefore: 0, energyAfter: 5, isSnacking: false, isInPeriod: true },
            { minutes: 170, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true },
            { minutes: 360, type: 'cook', energyBefore: 0, energyAfter: 5, isSnacking: false, isInPeriod: true },
            { minutes: 410, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true },
            { minutes: 480, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: false },
            { minutes: 720, type: 'cook', energyBefore: 0, energyAfter: 5, isSnacking: false, isInPeriod: false },
            { minutes: 770, type: 'empty', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: false },
            { minutes: 1440, type: 'sleep', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: false },
            { minutes: 1440, type: 'wake', energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: false },
        ]);
    });

    test('calculate (e4e x 0, Energy recovery down)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            nature: new Nature('Hasty'), // Energy recovery down
        });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0}));

        expect(result.events[0].energyAfter).toBe(88);
        expect(result.efficiencies[0]).toEqual({
            start: 0, end: 80, efficiency: 2.222,
            isAwake: true, isSnacking: false, isInPeriod: true,
        });

        // empty event is added
        const sleepEvent = result.events.find(x => x.type === "sleep");
        const emptyEvent = result.events.find(x => x.type === "empty");
        expect(sleepEvent !== undefined).toBe(true);
        expect(emptyEvent !== undefined).toBe(true);
        if (emptyEvent === undefined || sleepEvent === undefined) { throw new Error(); }
        expect(emptyEvent.minutes === sleepEvent.minutes + sleepEvent.energyAfter * 10);
    });

    test('calculate (e4e x 0, Energy Recovery Bonus)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            nature: new Nature('Bold'), // Energy Recovery Up
            subSkills: new SubSkillList({ lv10: new SubSkill('Energy Recovery Bonus') }),
        });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0}));

        expect(result.events[0].energyAfter).toBe(105);
        expect(result.efficiencies[0]).toEqual({
            start: 0, end: 260, efficiency: 2.222,
            isAwake: true, isSnacking: false, isInPeriod: true,
        });

        // empty event is added
        const sleepEvent = result.events.find(x => x.type === "sleep");
        const emptyEvent = result.events.find(x => x.type === "empty");
        expect(sleepEvent !== undefined).toBe(true);
        expect(emptyEvent !== undefined).toBe(true);
        if (emptyEvent === undefined || sleepEvent === undefined) { throw new Error(); }
        expect(emptyEvent.minutes === sleepEvent.minutes + sleepEvent.energyAfter * 10);
    });

    test('calculate (e4e x 0, Energy recovery down, Energy Recovery Bonus)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Raichu',
            nature: new Nature('Hasty'), // Energy recovery down
        });
        const energy = new Energy(iv);

        let result = energy.calculate(createParam({e4eCount: 0}));
        expect(result.events[0].energyAfter).toBe(88);

        result = energy.calculate(createParam({e4eCount: 0, recoveryBonusCount: 1}));
        expect(result.events[0].energyAfter).toBe(100);
    });

    test('calculate (e4e x 2)', () => {
        const iv = new PokemonIv({ pokemonName: 'Pikachu' });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 2}));

        expect(result.averageEfficiency).toEqual({
            total: 1.812,
            awake: 1.987,
            asleep: 1.493,
        });
    });

    test('calculate (e4e x 7)', () => {
        const iv = new PokemonIv({ pokemonName: 'Pikachu' });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 7}));

        expect(result.averageEfficiency).toEqual({
            total: 2.222,
            awake: 2.222,
            asleep: 2.222,
        });
    });

    test('calculate (score 0)', () => {
        const iv = new PokemonIv({ pokemonName: 'Pikachu' });
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0, sleepScore: 0}));

        expect(result.averageEfficiency).toEqual({
            total: 1.043,
            awake: 1.043,
            asleep: 1,
        });

        expect(result.events[1].type).toBe('cook');
        expect(result.events[1].energyAfter).toBe(5);
        expect(result.events[1].minutes).toBe(120);
        expect(result.events[2].type).toBe('empty');
        expect(result.events[2].energyBefore).toBe(0);
        expect(result.events[2].minutes).toBe(170);

        expect(result.events[3].type).toBe('cook');
        expect(result.events[3].energyAfter).toBe(5);
        expect(result.events[3].minutes).toBe(360);
        expect(result.events[4].type).toBe('empty');
        expect(result.events[4].energyBefore).toBe(0);
        expect(result.events[4].minutes).toBe(410);
    });

    test('calculate snacking', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
            skillRate: 10,
            ingRate: 10,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
        };

        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 0, sleepScore: 90}));

        // sleep from 981 min
        const sleepEvent = result.events.find(x => x.type === 'sleep');
        expect(sleepEvent).toEqual({
            type: 'sleep', minutes: 981,
            energyBefore: 0, energyAfter: 0, isSnacking: false, isInPeriod: true,
        });

        // snacking from 981 + 300 min (30min x 10)
        const snackEvent = result.events.find(x => x.type === 'snack');
        expect(snackEvent).toEqual({
            type: 'snack', minutes: 1281,
            energyBefore: 0, energyAfter: 0, isSnacking: true, isInPeriod: true,
        });
        expect(result.timeToFullInventory).toBe(300);
        expect(result.helpCount.asleepNotFull).toBe(10);
        expect(result.skillProbabilityAfterWakeup.once)
            .toBe(10 * 0.1 * Math.pow(0.9, 9));
        expect(result.skillProbabilityAfterWakeup.twice)
            .toBe(1 - Math.pow(0.9, 10) - result.skillProbabilityAfterWakeup.once);

        // efficiency for snacking is added
        const ef = result.efficiencies.find(x => x.isSnacking);
        expect(ef).toEqual({
            start: 1281, end: 1440, efficiency: 1,
            isAwake: false, isSnacking: true, isInPeriod: true,
        });

        // change pokemon's specialty to Berries
        const iv2 = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
            skillRate: 10,
            ingRate: 10,
        });
        (iv2 as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv2.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
            specialty: "Berries",
        };
        const energy2 = new Energy(iv2);
        const result2 = energy2.calculate(createParam({e4eCount: 0, sleepScore: 90}));

        // snacking earlier
        const snackEvent2 = result2.events.find(x => x.type === 'snack');
        expect(snackEvent2?.minutes).toBeLessThan(1280);
        expect(result2.helpCount.asleepNotFull).toBeCloseTo(10 / 1.9);
    });

    test('no snacking (always tap)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Hasty'), // Energy recovery down
            level: 1,
            skillRate: 10,
            ingRate: 10,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
        };

        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            e4eCount: 0,
            sleepScore: 90,
            tapFrequencyAsleep: AlwaysTap,
        }));
        const snackEvent = result.events.find(x => x.type === 'snack');
        expect(snackEvent).toBe(undefined);
        expect(result.timeToFullInventory).toBe(-1);
    });

    test('no snacking (3 hours)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Eevee',
            nature: new Nature('Serious'), // Neutral
            level: 1,
            skillRate: 10,
            ingRate: 10,
        });

        // change pokemon parameter (type assertion for testing)
        (iv as { -readonly [K in keyof PokemonIv]: PokemonIv[K] }).pokemon = {
            ...iv.pokemon,
            carryLimit: 10,
            frequency: 1800, // 30min
        };

        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            sleepScore: 100,
            period: 3,
        }));
        expect(result.helpCount.awake).toBe(180 * 60 / 1800 * 2.222);
        expect(result.helpCount.asleepFull).toBe(0);
        expect(result.helpCount.asleepNotFull).toBe(0);
    });
});
