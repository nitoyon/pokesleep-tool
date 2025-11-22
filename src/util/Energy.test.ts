import Energy, { EnergyParameter } from './Energy';
import Nature from './Nature';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';

const paramBase = {
    period: 24,
    e4eEnergy: 18,
    e4eCount: 3,
    sleepScore: 100,
    tapFrequencyAsleep: "none",
    helpBonusCount: 0,
    recoveryBonusCount: 0,
    isEnergyAlwaysFull: false,
    isGoodCampTicketSet: false,
};
function createParam(obj: Partial<EnergyParameter>): EnergyParameter {
    return Object.assign({fieldIndex: 0}, paramBase, obj) as EnergyParameter;
}

describe('Energy', () => {
    test('calculate (e4e x 0)', () => {
        const iv = new PokemonIv('Raichu');
        iv.subSkills.lv10 = new SubSkill('Inventory Up L');
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
        const iv = new PokemonIv('Raichu');
        iv.subSkills.lv10 = new SubSkill('Inventory Up L');
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
        const iv = new PokemonIv('Raichu');
        iv.subSkills.lv10 = new SubSkill('Inventory Up L');
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
        const iv = new PokemonIv('Raichu');
        iv.nature = new Nature('Hasty'); // Energy recovery down
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
        const iv = new PokemonIv('Raichu');
        iv.nature = new Nature('Bold'); // Energy Recovery Up
        iv.subSkills.lv10 = new SubSkill('Energy Recovery Bonus');
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
        const iv = new PokemonIv('Raichu');
        iv.nature = new Nature('Hasty'); // Energy recovery down
        const energy = new Energy(iv);

        let result = energy.calculate(createParam({e4eCount: 0}));
        expect(result.events[0].energyAfter).toBe(88);

        result = energy.calculate(createParam({e4eCount: 0, recoveryBonusCount: 1}));
        expect(result.events[0].energyAfter).toBe(100);
    });

    test('calculate (e4e x 2)', () => {
        const iv = new PokemonIv('Pikachu');
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 2}));

        expect(result.averageEfficiency).toEqual({
            total: 1.812,
            awake: 1.987,
            asleep: 1.493,
        });
    });

    test('calculate (e4e x 7)', () => {
        const iv = new PokemonIv('Pikachu');
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({e4eCount: 7}));

        expect(result.averageEfficiency).toEqual({
            total: 2.222,
            awake: 2.222,
            asleep: 2.222,
        });
    });

    test('calculate (score 0)', () => {
        const iv = new PokemonIv('Pikachu');
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
        const iv = new PokemonIv('Eevee');
        iv.nature = new Nature('Hasty'); // Energy recovery down
        iv.level = 1;

        // change pokemon parameter
        iv.pokemon = {...iv.pokemon};
        iv.pokemon.carryLimit = 10;
        iv.pokemon.ingRatio = 10;
        iv.pokemon.skillRatio = 10;
        iv.pokemon.frequency = 1800; // 30min

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
        iv.pokemon.specialty = "Berries";
        const energy2 = new Energy(iv);
        const result2 = energy2.calculate(createParam({e4eCount: 0, sleepScore: 90}));

        // snacking earlier
        const snackEvent2 = result2.events.find(x => x.type === 'snack');
        expect(snackEvent2?.minutes).toBeLessThan(1280);
        expect(result2.helpCount.asleepNotFull).toBeCloseTo(10 / 1.9);
    });

    test('no snacking (always tap)', () => {
        const iv = new PokemonIv('Eevee');
        iv.nature = new Nature('Hasty'); // Energy recovery down
        iv.level = 1;

        // change pokemon parameter
        iv.pokemon = {...iv.pokemon};
        iv.pokemon.carryLimit = 10;
        iv.pokemon.ingRatio = 10;
        iv.pokemon.skillRatio = 10;
        iv.pokemon.frequency = 1800; // 30min

        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            e4eCount: 0,
            sleepScore: 90,
            tapFrequencyAsleep: "always",
        }));
        const snackEvent = result.events.find(x => x.type === 'snack');
        expect(snackEvent).toBe(undefined);
        expect(result.timeToFullInventory).toBe(-1);
    });

    test('no snacking (3 hours)', () => {
        const iv = new PokemonIv('Eevee');
        iv.nature = new Nature('Serious'); // Neutral
        iv.level = 1;

        // change pokemon parameter
        iv.pokemon = {...iv.pokemon};
        iv.pokemon.carryLimit = 10;
        iv.pokemon.ingRatio = 10;
        iv.pokemon.skillRatio = 10;
        iv.pokemon.frequency = 1800; // 30min

        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            sleepScore: 100,
            period: 3,
        }));
        expect(result.helpCount.awake).toBe(180 * 60 / 1800 * 2.222);
        expect(result.helpCount.asleepFull).toBe(0);
        expect(result.helpCount.asleepNotFull).toBe(0);
    });

    test('calculate (negative period)', () => {
        const iv = new PokemonIv('Pikachu');
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({period: -1}));

        expect(result.sleepTime).toBe(0);
        expect(result.events).toEqual([]);
        expect(result.efficiencies).toEqual([]);
        expect(result.canBeFullInventory).toBe(false);
        expect(result.timeToFullInventory).toBe(-1);
        expect(result.skillProbabilityAfterWakeup).toEqual({ once: 0, twice: 0 });
        expect(result.carryLimit).toBe(iv.carryLimit);
        expect(result.skillRatio).toBe(0);
        expect(result.helpCount).toEqual({ awake: 0, asleepNotFull: 0, asleepFull: 0 });
        expect(result.averageEfficiency).toEqual({ total: 0, awake: 0, asleep: 0 });
    });

    test('calculate (isEnergyAlwaysFull = true)', () => {
        const iv = new PokemonIv('Pikachu');
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            isEnergyAlwaysFull: true,
            sleepScore: 100,
        }));

        // sleepTime = 1440 - 510 = 930
        expect(result.sleepTime).toBe(930);

        // simplified events with constant 100 energy (wake, sleep, snack, wake)
        expect(result.events[0]).toEqual(
            { minutes: 0, type: 'wake', energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true }
        );
        expect(result.events[1]).toEqual(
            { minutes: 930, type: 'sleep', energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true }
        );
        // all events should have energy 100
        for (const event of result.events) {
            expect(event.energyBefore).toBe(100);
            expect(event.energyAfter).toBe(100);
        }

        // simplified efficiencies with max efficiency
        expect(result.efficiencies[0]).toEqual(
            { start: 0, end: 930, isAwake: true, efficiency: 2.222, isSnacking: false, isInPeriod: true }
        );
        // check asleep efficiency has max efficiency
        const asleepEfficiency = result.efficiencies.find(e => !e.isAwake && !e.isSnacking);
        expect(asleepEfficiency?.efficiency).toBe(2.222);

        // average efficiency should be max
        expect(result.averageEfficiency).toEqual({
            total: 2.222,
            awake: 2.222,
            asleep: 2.222,
        });
    });

    test('calculate (isGoodCampTicketSet = true)', () => {
        const iv = new PokemonIv('Pikachu');
        const energy = new Energy(iv);
        const baseCarryLimit = iv.carryLimit;

        // without good camp ticket
        const resultWithout = energy.calculate(createParam({
            isGoodCampTicketSet: false,
        }));
        expect(resultWithout.carryLimit).toBe(baseCarryLimit);

        // with good camp ticket
        const resultWith = energy.calculate(createParam({
            isGoodCampTicketSet: true,
        }));
        expect(resultWith.carryLimit).toBe(Math.ceil(baseCarryLimit * 1.2));
    });

    test('calculate (tapFrequency = "none")', () => {
        const iv = new PokemonIv('Eevee');
        const energy = new Energy(iv);
        const result = energy.calculate(createParam({
            tapFrequency: "none",
            tapFrequencyAsleep: "none",
            sleepScore: 100,
        }));

        // all events should be snacking when tapFrequency = "none"
        for (const event of result.events) {
            expect(event.isSnacking).toBe(true);
        }

        // all efficiencies should be snacking
        for (const efficiency of result.efficiencies) {
            expect(efficiency.isSnacking).toBe(true);
        }

        // timeToFullInventory should be -1 (no snacking calculation)
        expect(result.timeToFullInventory).toBe(-1);

        // canBeFullInventory should be false
        expect(result.canBeFullInventory).toBe(false);

        // all help counts should be in asleepFull (snacking)
        expect(result.helpCount.asleepNotFull).toBe(0);
    });

    test('calculate (combined tap settings)', () => {
        const iv = new PokemonIv('Eevee');
        const energy = new Energy(iv);

        // tapFrequency = "always", tapFrequencyAsleep = "none" -> canBeFullInventory = true
        const result1 = energy.calculate(createParam({
            tapFrequency: "always",
            tapFrequencyAsleep: "none",
            sleepScore: 100,
        }));
        expect(result1.canBeFullInventory).toBe(true);
        // should have snacking during sleep
        expect(result1.timeToFullInventory).toBeGreaterThan(0);

        // tapFrequency = "always", tapFrequencyAsleep = "always" -> no snacking
        const result2 = energy.calculate(createParam({
            tapFrequency: "always",
            tapFrequencyAsleep: "always",
            sleepScore: 100,
        }));
        expect(result2.canBeFullInventory).toBe(false);
        expect(result2.timeToFullInventory).toBe(-1);
        // no snacking events
        const snackEvent = result2.events.find(x => x.type === 'snack');
        expect(snackEvent).toBe(undefined);

        // tapFrequency = "none", tapFrequencyAsleep = "always" -> all snacking
        const result3 = energy.calculate(createParam({
            tapFrequency: "none",
            tapFrequencyAsleep: "always",
            sleepScore: 100,
        }));
        expect(result3.canBeFullInventory).toBe(false);
        // all events should be snacking
        for (const event of result3.events) {
            expect(event.isSnacking).toBe(true);
        }
    });

    describe('calculateSkillProbabilityAfterWakeup', () => {
        test('returns zero when lotteryCount is 0', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const result = energy.calculateSkillProbabilityAfterWakeup(0.1, 0, false);
            expect(result).toEqual({ once: 0, twice: 0 });
        });

        test('returns zero when lotteryCount is negative', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const result = energy.calculateSkillProbabilityAfterWakeup(0.1, -5, false);
            expect(result).toEqual({ once: 0, twice: 0 });
        });

        test('non-skill specialty: twice is always 0', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const result = energy.calculateSkillProbabilityAfterWakeup(0.1, 10, false);

            // once = 1 - (1 - 0.1)^10
            const expected = 1 - Math.pow(0.9, 10);
            expect(result.once).toBeCloseTo(expected);
            expect(result.twice).toBe(0);
        });

        test('skill specialty: calculates both once and twice', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const result = energy.calculateSkillProbabilityAfterWakeup(0.1, 10, true);

            // skillNone = (1 - 0.1)^10
            const skillNone = Math.pow(0.9, 10);
            // skillOnce = 10 * 0.1 * (1 - 0.1)^9
            const skillOnce = 10 * 0.1 * Math.pow(0.9, 9);
            // skillTwice = 1 - skillNone - skillOnce
            const skillTwice = 1 - skillNone - skillOnce;

            expect(result.once).toBeCloseTo(skillOnce);
            expect(result.twice).toBeCloseTo(skillTwice);
        });

        test('lotteryCount = 1', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);

            // non-skill specialty: once = skillRatio
            const result1 = energy.calculateSkillProbabilityAfterWakeup(0.2, 1, false);
            expect(result1.once).toBeCloseTo(0.2);
            expect(result1.twice).toBe(0);

            // skill specialty: once = skillRatio, twice = 0 (can't trigger twice with 1 lottery)
            const result2 = energy.calculateSkillProbabilityAfterWakeup(0.2, 1, true);
            expect(result2.once).toBeCloseTo(0.2);
            expect(result2.twice).toBeCloseTo(0);
        });
    });

    describe('findSkillTriggerTime', () => {
        test('returns zero when skillRatio is 0', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const efficiencies = [
                { start: 0, end: 100, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0, 0);
            expect(result).toEqual({ minute: 0, count: 0 });
        });

        test('returns zero when efficiencies is empty', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const result = energy.findSkillTriggerTime([], 3600, 0.1, 0);
            expect(result).toEqual({ minute: 0, count: 0 });
        });

        test('returns zero when all efficiencies are asleep or snacking', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const efficiencies = [
                { start: 0, end: 100, efficiency: 1.0 as const, isAwake: false, isSnacking: false, isInPeriod: true },
                { start: 100, end: 200, efficiency: 1.0 as const, isAwake: true, isSnacking: true, isInPeriod: true }
            ];
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.1, 0);
            expect(result).toEqual({ minute: 0, count: 0 });
        });

        test('calculates exact trigger time when skill reaches count 1', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            // skillRatio = 0.5, baseFreq = 3600 (1 hour)
            // With efficiency 1.0, freq = 3600 seconds (60 minutes)
            // Need 1 / 0.5 = 2 helps to trigger skill
            // Time needed = 2 * 60 = 120 minutes
            const efficiencies = [
                { start: 0, end: 200, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.5, 0);
            expect(result.minute).toBe(120);
            expect(result.count).toBe(1);
        });

        test('returns last efficiency end when skill does not trigger', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            // skillRatio = 0.01, baseFreq = 3600 (1 hour)
            // Need 1 / 0.01 = 100 helps to trigger skill
            const efficiencies = [
                // Only 0.5 helps in 30 minutes (30 * 60 / 3600 = 0.5)
                { start: 0, end: 30, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.01, 0);
            expect(result.minute).toBe(30);
            // skillCount = 0.5 * 0.01 = 0.005
            expect(result.count).toBeCloseTo(0.005);
        });

        test('respects startMinutes parameter', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            // skillRatio = 0.5, baseFreq = 3600, need 2 helps = 120 minutes
            const efficiencies = [
                { start: 0, end: 200, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            // Start counting from minute 50, trigger at 50 + 120 = 170
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.5, 50);
            expect(result.minute).toBe(170);
            expect(result.count).toBe(1);
        });

        test('handles partial efficiency period with startMinutes', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const efficiencies = [
                // Period starts at 0, but we start counting from 30
                { start: 0, end: 200, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            // skillRatio = 0.5, need 2 helps = 120 minutes from minute 30
            // Trigger at 30 + 120 = 150
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.5, 30);
            expect(result.minute).toBe(150);
            expect(result.count).toBe(1);
        });

        test('calculates across multiple efficiency', () => {
            const iv = new PokemonIv('Pikachu');
            const energy = new Energy(iv);
            const efficiencies = [
                // Period 1: 60min, 1.515 helps (skillCount = 0.7575)
                { start: 0, end: 60, efficiency: 1.515 as const, isAwake: true, isSnacking: false, isInPeriod: true },
                // Period 2: Need 0.485 more helps = 29.1 minutes, trigger at 60 + 29.1 = 89.1
                { start: 60, end: 300, efficiency: 1.0 as const, isAwake: true, isSnacking: false, isInPeriod: true }
            ];
            // skillRatio = 0.5, need 2 helps total (1.515 from period 1 + 0.485 from period 2)
            const result = energy.findSkillTriggerTime(efficiencies, 3600, 0.5, 0);
            expect(result.minute).toBeCloseTo(89.1, 1);
            expect(result.count).toBe(1);
        });
    });

    describe('calculateEnergyForEvents', () => {
        test('restores energy with chargeEnergy event', () => {
            const iv = new PokemonIv('Rattata'); // Has Charge Energy S skill
            iv.skillLevel = 1; // Skill level 1 = 12 energy
            const energy = new Energy(iv);

            // Create events with a chargeEnergy event
            const events = [
                { minutes: 0, type: 'wake' as const, energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true },
                { minutes: 300, type: 'chargeEnergy' as const, energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            ];

            // Calculate energy for events
            energy.calculateEnergyForEvents(events, 0, 100, 100, 12, 0);

            // After 300 minutes, energy should be 100 - 30 = 70
            // After chargeEnergy, it should be 70 + 12 = 82
            expect(events[1].energyBefore).toBe(70);
            expect(events[1].energyAfter).toBe(82);
        });

        test('caps chargeEnergy restoration at 150', () => {
            const iv = new PokemonIv('Rattata'); // Has Charge Energy S skill
            iv.skillLevel = 6; // Skill level 6 = 43 energy
            const energy = new Energy(iv);

            // Create events with a chargeEnergy event
            const events = [
                { minutes: 0, type: 'wake' as const, energyBefore: 100, energyAfter: 140, isSnacking: false, isInPeriod: true },
                { minutes: 10, type: 'chargeEnergy' as const, energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            ];

            // chargedEnergy = getSkillValue("Charge Energy S", 6) * recoveryFactor
            // = 43 * 1.0 = 43
            const chargedEnergy = 43;

            // Calculate energy for events
            energy.calculateEnergyForEvents(events, 0, 100, 140, chargedEnergy, 0);

            // After 10 minutes, energy should be 140 - 1 = 139
            // After chargeEnergy, it should be min(150, 139 + 43) = 150
            expect(events[1].energyBefore).toBe(139);
            expect(events[1].energyAfter).toBe(150);
        });

        test('applies nature energy recovery factor to chargeEnergy', () => {
            const iv = new PokemonIv('Rattata'); // Has Charge Energy S skill
            iv.skillLevel = 3; // Skill level 3 = 21 energy
            iv.nature = new Nature('Bold'); // Energy Recovery Up (1.2x)
            const energy = new Energy(iv);

            // Create events with a chargeEnergy event
            const events = [
                { minutes: 0, type: 'wake' as const, energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true },
                { minutes: 200, type: 'chargeEnergy' as const, energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            ];

            // chargedEnergy = getSkillValue("Charge Energy S", 3) * recoveryFactor
            // = 21 * 1.2 = 25.2 -> ceil(25.2) = 26
            const chargedEnergy = 21 * 1.2;

            // Calculate energy for events
            energy.calculateEnergyForEvents(events, 0, 100, 100, chargedEnergy, 0);

            // After 200 minutes, energy should be 100 - 20 = 80
            // After chargeEnergy, it should be ceil(80 + 25.2) = 106
            expect(events[1].energyBefore).toBe(80);
            expect(events[1].energyAfter).toBe(106);
        });

        test('chargeEnergy with zero energy', () => {
            const iv = new PokemonIv('Rattata'); // Has Charge Energy S skill
            iv.skillLevel = 2; // Skill level 2 = 16 energy
            const energy = new Energy(iv);

            // Create events with a chargeEnergy event when energy is 0
            const events = [
                { minutes: 0, type: 'wake' as const, energyBefore: 10, energyAfter: 10, isSnacking: false, isInPeriod: true },
                { minutes: 100, type: 'chargeEnergy' as const, energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            ];

            // Calculate energy for events
            energy.calculateEnergyForEvents(events, 0, 100, 10, 16, 0);

            // After 100 minutes, energy should be 10 - 10 = 0
            // After chargeEnergy, it should be 0 + 16 = 16
            expect(events[1].energyBefore).toBe(0);
            expect(events[1].energyAfter).toBe(16);
        });
    });
});
