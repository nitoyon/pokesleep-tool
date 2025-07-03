import calcExpAndCandy from './Exp';
import Nature from './Nature';
import PokemonIv from './PokemonIv';

describe('Exp', () => {
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
