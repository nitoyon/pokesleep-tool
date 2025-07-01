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
        expect(res.candy).toBe(348);
        expect(res.shards).toBe(28556);
    });

    test('level 10->50 (EXP up)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Timid'); // EXP up
        iv.level = 10;
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(948);
        expect(res.shards).toBe(148056);
    });

    test('level 12->30 (EXP down)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Relaxed'); // EXP down
        iv.level = 12;
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 30, "none");
        expect(res.candy).toBe(463);
        expect(res.shards).toBe(39084);
    });

    test('level 12->50 (EXP down)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Relaxed'); // EXP down
        iv.level = 12;
        expect(iv.nature.isExpGainsUp).toBe(false);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1320);
        expect(res.shards).toBe(209866);
    });

    test('level 12->50', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(1109);
        expect(res.shards).toBe(176312);
    });

    test('level 12->50 (exp got)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 75, 50, "none");
        expect(res.candy).toBe(1106);
        expect(res.shards).toBe(176153);
    });

    test('level 12->50 (mini)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "mini");
        expect(res.candy).toBe(555);
        expect(res.shards).toBe(352968);
    });

    test('level 12->50 (unlimited)', () => {
        const iv = new PokemonIv('Ralts');
        iv.level = 12;

        const res = calcExpAndCandy(iv, 0, 50, "unlimited");
        expect(res.candy).toBe(555);
        expect(res.shards).toBe(441210);
    });

    test('level 14->31 (Dratini)', () => {
        const iv = new PokemonIv('Dratini');
        iv.level = 14;

        const res = calcExpAndCandy(iv, 0, 31, "none");
        expect(res.candy).toBe(577);
        expect(res.shards).toBe(51823);
    });

    test('level 28->35 (Entei)', () => {
        const iv = new PokemonIv('Entei');
        iv.level = 28;

        const res = calcExpAndCandy(iv, 0, 35, "none");
        expect(res.candy).toBe(377);
        expect(res.shards).toBe(47861);
    });

    test('level 26->29 (Darkrai)', () => {
        const iv = new PokemonIv('Darkrai');
        iv.level = 26;

        const res = calcExpAndCandy(iv, 0, 29, "none");
        expect(res.candy).toBe(176);
        expect(res.shards).toBe(18555);
    });
});
