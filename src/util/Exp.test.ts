import calcExpAndCandy, { calcDayToGetSleepExp, calcLevelByCandy, getNextFullMoon } from './Exp';
import Nature from './Nature';
import PokemonIv from './PokemonIv';

describe('calcExpAndCandy', () => {
    test('level 10->30 (EXP up)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            nature: new Nature('Timid'), // EXP up
            level: 10,
        });
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 30, "none");
        expect(res.candy).toBe(269);
        expect(res.shards).toBe(22421);
    });

    test('level 10->50 (EXP up)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            nature: new Nature('Timid'), // EXP up
            level: 10,
        });
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(869);
        expect(res.shards).toBe(142044);
    });

    test('level 12->30 (EXP down)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            nature: new Nature('Relaxed'), // EXP down
            level: 12,
        });
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 30, "none");
        expect(res.candy).toBe(354);
        expect(res.shards).toBe(30283);
    });

    test('level 12->50 (EXP down)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            nature: new Nature('Relaxed'), // EXP down
            level: 12,
        });
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1211);
        expect(res.shards).toBe(201134);
    });

    test('level 12->50', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1014);
        expect(res.shards).toBe(168703);
    });

    test('level 12->50 (exp got)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcExpAndCandy(iv, 75, 50, "none");
        expect(res.candy).toBe(1011);
        expect(res.shards).toBe(168364);
    });

    test('level 12->50 (mini)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcExpAndCandy(iv, 0, 50, "mini");
        expect(res.candy).toBe(507);
        expect(res.shards).toBe(337200);
    });

    test('level 12->50 (unlimited)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcExpAndCandy(iv, 0, 50, "unlimited");
        expect(res.candy).toBe(507);
        expect(res.shards).toBe(421500);
    });

    test('level 14->31 (Dratini)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Dratini',
            level: 14,
        });

        const res = calcExpAndCandy(iv, 0, 31, "none");
        expect(res.candy).toBe(449);
        expect(res.shards).toBe(41133);
    });

    test('level 28->35 (Entei)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Entei',
            level: 28,
        });

        const res = calcExpAndCandy(iv, 0, 35, "none");
        expect(res.candy).toBe(360);
        expect(res.shards).toBe(45910);
    });

    test('level 26->29 (Darkrai)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Darkrai',
            level: 26,
        });

        const res = calcExpAndCandy(iv, 0, 29, "none");
        expect(res.candy).toBe(147);
        expect(res.shards).toBe(15501);
    });
});

describe('calcLevelByCandy', () => {
    test('level 10->30 with enough candy (no boost)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 10,
        });

        // Required candy: 314, Required shards: 26,131
        const res = calcLevelByCandy(iv, 0, 30, 350, "none");
        expect(res.exp).toBe(10432)
        expect(res.expLeft).toBe(-8);
        expect(res.level).toBe(30);
        expect(res.shards).toBe(26131);
        expect(res.candyUsed).toBe(314);
        expect(res.candyLeft).toBe(36);
        expect(res.expGot).toBe(8);
    });

    test('level 10->30 with insufficient candy (no boost)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 10,
        });

        const res = calcLevelByCandy(iv, 0, 30, 100, "none");
        expect(res.exp).toBe(10432);
        expect(res.expLeft).toBe(6932);
        expect(res.level).toBe(18);
        expect(res.expGot).toBe(161);
        expect(res.shards).toBe(5922);
        expect(res.candyUsed).toBe(100);
        expect(res.candyLeft).toBe(0);
    });

    test('level 10->30 with exact candy (no boost)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 10,
        });

        const res = calcLevelByCandy(iv, 0, 30, 314, "none");
        expect(res.level).toBe(30);
        expect(res.exp).toBe(10432)
        expect(res.expLeft).toBe(-8);
        expect(res.shards).toBe(26131);
        expect(res.candyUsed).toBe(314);
        expect(res.candyLeft).toBe(0);
        expect(res.expGot).toBe(8);
    });

    test('level 12->50 with enough candy (mini boost)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcLevelByCandy(iv, 0, 50, 1000, "mini");
        expect(res.exp).toBe(27712);
        expect(res.expLeft).toBe(-28);
        expect(res.level).toBe(50);
        expect(res.expGot).toBe(28);
        expect(res.shards).toBe(337200);
        expect(res.candyUsed).toBe(507);
        expect(res.candyLeft).toBe(493);
    });

    test('level 12->50 with enough candy (unlimited boost)', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const res = calcLevelByCandy(iv, 0, 50, 1000, "unlimited");
        expect(res.exp).toBe(27712);
        expect(res.expLeft).toBe(-28);
        expect(res.level).toBe(50);
        expect(res.expGot).toBe(28);
        expect(res.shards).toBe(421500);
        expect(res.candyUsed).toBe(507);
        expect(res.candyLeft).toBe(493);
    });

    test('mini boost uses correct shard multiplier', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const requirement = calcExpAndCandy(iv, 0, 50, "mini");
        const res = calcLevelByCandy(iv, 0, 50, requirement.candy, "mini");
        expect(res.shards).toBe(requirement.shards);
        expect(res.candyUsed).toBe(requirement.candy);
    });

    test('unlimited boost uses correct shard multiplier', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 12,
        });

        const requirement = calcExpAndCandy(iv, 0, 50, "unlimited");
        const res = calcLevelByCandy(iv, 0, 50, requirement.candy, "unlimited");
        expect(res.shards).toBe(requirement.shards);
        expect(res.candyUsed).toBe(requirement.candy);
    });

    test('level border test', () => {
        const iv = new PokemonIv({
            pokemonName: 'Ralts',
            level: 30,
        });
        const expToLevel31 = 729;

        // Required 26 exp, but we have only 1 candy
        const res1 = calcLevelByCandy(iv, expToLevel31 - 26, 31, 1, "none");
        expect(res1.exp).toBe(26);
        expect(res1.expLeft).toBe(1);
        expect(res1.level).toBe(30);
        expect(res1.expGot).toBe(expToLevel31 - 1);
        expect(res1.shards).toBe(122);
        expect(res1.candyUsed).toBe(1);
        expect(res1.candyLeft).toBe(0);

        // Required 25 exp, and we have 1 candy
        const res2 = calcLevelByCandy(iv, expToLevel31 - 25, 31, 1, "none");
        expect(res2.exp).toBe(25);
        expect(res2.expLeft).toBe(0);
        expect(res2.level).toBe(31);
        expect(res2.expGot).toBe(0);
        expect(res2.shards).toBe(122);
        expect(res2.candyUsed).toBe(1);
        expect(res2.candyLeft).toBe(0);
    });
});

describe('getNextFullMoon', () => {
    test('should return days until next full moon when current age is before full moon', () => {
        // 2025-12-05 is full moon
        expect(getNextFullMoon(new Date(Date.UTC(2025, 11, 4)))).toBe(1);
        expect(getNextFullMoon(new Date(Date.UTC(2025, 11, 5)))).toBe(0);

        // current approximation thinks 2026-01-04 is full moon (actual 2026-01-03)
        expect(getNextFullMoon(new Date(Date.UTC(2025, 11, 6)))).toBe(29);
        expect(getNextFullMoon(new Date(Date.UTC(2026, 0, 3)))).toBe(1);
    });
});

describe('calcDayToGetSleepExp', () => {
    test('should calculate GSD exp', () => {
        const today = new Date(Date.UTC(2025, 11, 5)); // Full moon
        const expBonus = 0;
        const score = 100;
        const expGainRate = 1;
        const policy = "none";

        // 2025-12-05 Get 300 exp (total 300exp)
        let exp = 300;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(1);

        // 2025-12-06 Get 200 exp (total 500exp)
        exp = 301;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
        exp = 500;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);

        // 2025-12-07 Get 200 exp (total 600exp)
        exp = 501;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
        exp = 600;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);

        // 2025-12-06 Get 100 exp (total 700exp)
        exp = 601;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(4);
        exp = 700;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(4);
    });

    test('should calculate GSD exp and GSD incense', () => {
        const today = new Date(Date.UTC(2025, 11, 5)); // Full moon
        const expBonus = 0;
        const score = 100;
        const expGainRate = 1;
        const policy = "gsd";

        // 2025-12-05 Get 600 exp (total 600exp)
        let exp = 600;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(1);

        // 2025-12-06 Get 400 exp (total 1000exp)
        exp = 601;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
        exp = 1000;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
        exp = 1001;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);

        // 2025-12-07 Get 100 exp (total 1100exp)
        exp = 1100;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
        exp = 1101;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(4);
    });

    test('should calculate normal exp', () => {
        const today = new Date(Date.UTC(2025, 11, 7)); // Normal day
        const expBonus = 0;
        const score = 100;
        const expGainRate = 1;
        const policy = "none";

        // 2025-12-07 Get 100 exp
        let exp = 100;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(1);

        // 2025-12-07 Get 100 exp (total 200exp)
        exp = 101;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
        exp = 200;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);

        // 2025-12-07 Get 100 exp (total 300exp)
        exp = 201;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
        exp = 300;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
    });

    test('should calculate normal and GSD exp', () => {
        const today = new Date(Date.UTC(2025, 11, 3)); // 2 days before Full moon
        const expBonus = 0;
        const score = 100;
        const expGainRate = 1;
        const policy = "none";

        // 2025-12-03: Get 100 exp
        let exp = 100;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(1);

        // 2025-12-04: Get 200 exp (total 300 exp)
        exp = 101;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
        exp = 300;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);

        // 2025-12-05: Get 300 exp (total 600 exp)
        exp = 301;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
        exp = 600;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(3);
        exp = 601;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(4);
    });

    test('should calculate exp bonus', () => {
        const today = new Date(Date.UTC(2025, 11, 7)); // Normal day
        const expBonus = 1;
        const score = 100;
        const expGainRate = 1.18;
        const policy = "none";

        // 2025-12-07 Get 134 exp
        let exp = 134;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(1);
        exp = 135;
        expect(calcDayToGetSleepExp(exp, expBonus, score, expGainRate, policy, today).days)
            .toBe(2);
    });
});
