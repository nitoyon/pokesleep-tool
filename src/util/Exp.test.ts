import calcExpAndCandy from './Exp';
import Nature from './Nature';
import PokemonIv from './PokemonIv';

describe('Exp', () => {
    test('level 13->50 (EXP up)', () => {
        const iv = new PokemonIv('Ralts');
        iv.nature = new Nature('Timid'); // EXP up
        iv.level = 13;
        expect(iv.nature.isExpGainsUp).toBe(true);

        const res = calcExpAndCandy(iv, 0, 50, "none");
        expect(res.candy).toBe(911);
        expect(res.shards).toBe(146307);
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

    test('level 13->31 (Dratini)', () => {
        const iv = new PokemonIv('Dratini');
        iv.level = 13;

        const res = calcExpAndCandy(iv, 0, 31, "none");
        expect(res.candy).toBe(602);
        expect(res.shards).toBe(53212);
    });

    test('level 27->35 (Entei)', () => {
        const iv = new PokemonIv('Entei');
        iv.level = 27;

        const res = calcExpAndCandy(iv, 0, 35, "none");
        expect(res.candy).toBe(425);
        expect(res.shards).toBe(52901);
    });

    test('level 26->29 (Darkrai)', () => {
        const iv = new PokemonIv('Darkrai');
        iv.level = 26;

        const res = calcExpAndCandy(iv, 0, 29, "none");
        expect(res.candy).toBe(176);
        expect(res.shards).toBe(18555);
    });
});
