import calcExpAndCandy, { calcLevelByCandy } from './Exp';
import Nature from './Nature';
import PokemonIv from './PokemonIv';

describe('calcExpAndCandy', () => {
    test('level 10->30 (EXP up)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Timid'); // EXP up
        iv.level = 10;
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 30, "none");
        expect(res.candy).toBe(269);
        expect(res.shards).toBe(22421);
    });

    test('level 10->50 (EXP up)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Timid'); // EXP up
        iv.level = 10;
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(869);
        expect(res.shards).toBe(142044);
    });

    test('level 12->30 (EXP down)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Relaxed'); // EXP down
        iv.level = 12;
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 30, "none");
        expect(res.candy).toBe(354);
        expect(res.shards).toBe(30283);
    });

    test('level 12->50 (EXP down)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Relaxed'); // EXP down
        iv.level = 12;
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1211);
        expect(res.shards).toBe(201134);
    });

    test('level 12->50', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1014);
        expect(res.shards).toBe(168703);
    });

    test('level 12->50 (exp got)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 75, 50, "none");
        expect(res.candy).toBe(1011);
        expect(res.shards).toBe(168364);
    });

    test('level 12->50 (mini)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "mini");
        expect(res.candy).toBe(507);
        expect(res.shards).toBe(337200);
    });

    test('level 12->50 (unlimited)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "unlimited");
        expect(res.candy).toBe(507);
        expect(res.shards).toBe(421500);
    });

    test('level 14->31 (Dratini)', () => {
        const iv = new PokemonIv('Dratini');
        iv.level = 14;

        const res = calcExpAndCandy(iv, 0, 31, "none");
        expect(res.candy).toBe(449);
        expect(res.shards).toBe(41133);
    });

    test('level 28->35 (Entei)', () => {
        const iv = new PokemonIv('Entei');
        iv.level = 28;

        const res = calcExpAndCandy(iv, 0, 35, "none");
        expect(res.candy).toBe(360);
        expect(res.shards).toBe(45910);
    });

    test('level 26->29 (Darkrai)', () => {
        const iv = new PokemonIv('Darkrai');
        iv.level = 26;

        const res = calcExpAndCandy(iv, 0, 29, "none");
        expect(res.candy).toBe(147);
        expect(res.shards).toBe(15501);
    });
});

describe('calcLevelByCandy', () => {
    test('level 10->30 with enough candy (no boost)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 10;

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
        const iv = new PokemonIv('Ralts');
        iv.level = 10;

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
        const iv = new PokemonIv('Ralts');
        iv.level = 10;

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
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

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
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

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
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const requirement = calcExpAndCandy(iv, 0, 50, "mini");
        const res = calcLevelByCandy(iv, 0, 50, requirement.candy, "mini");
        expect(res.shards).toBe(requirement.shards);
        expect(res.candyUsed).toBe(requirement.candy);
    });

    test('unlimited boost uses correct shard multiplier', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const requirement = calcExpAndCandy(iv, 0, 50, "unlimited");
        const res = calcLevelByCandy(iv, 0, 50, requirement.candy, "unlimited");
        expect(res.shards).toBe(requirement.shards);
        expect(res.candyUsed).toBe(requirement.candy);
    });

    test('level border test', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 30;
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
