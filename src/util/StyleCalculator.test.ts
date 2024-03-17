import {createCalculator} from './StyleCalculator';

describe("StyleCalculator", () => {
    test("calculate Cyan Chikorita guaranteed on power 570,000", () => {
        const calc = createCalculator({
            field: 1,
            strength: 59000,
            pokemonId: 152,
            detail: "none",
            value: "count",
        });
        const ret = calc.calculate(10);
        expect(ret).toEqual([1]);
        //expect(Object.values(ret.data).reduce<number>((p, c) => p + c, 0)).toBeCloseTo(1);
    });

    test("calculate Cyan Chikorita guaranteed on power 1557,999", () => {
        const calc = createCalculator({
            field: 1,
            strength: 155799,
            pokemonId: 152,
            detail: "none",
            value: "count",
        });
        const ret = calc.calculate(10);
        expect(ret.length).toBe(1);
        expect(ret[0]).toBeGreaterThan(1);
        //expect(Object.values(ret.data).reduce<number>((p, c) => p + c, 0)).toBeCloseTo(1);
    });

    test("calculate too low power", () => {
        let calc = createCalculator({
            field: 1,
            strength: 10,
            pokemonId: 19, /* Rattata */
            detail: "showRarity",
            value: "count",
        });
        let ret = calc.calculate(100);
        expect(ret).toEqual([3, 0, 0, 0]); /* encounters 3 pokemon */

        calc = createCalculator({
            field: 1,
            strength: 10,
            pokemonId: 19, /* Rattata */
            detail: "none",
            value: "candy",
        });
        ret = calc.calculate(100);
        expect(ret).toEqual([9]); /* 9 candies from 3 Rattata */

        calc = createCalculator({
            field: 1,
            strength: 10,
            pokemonId: 1, /* Bulbasaur */
            detail: "none",
            value: "count",
        });
        ret = calc.calculate(100);
        expect(ret).toEqual([0, 0, 0, 0]); /* encounters 0 pokemon */
    });

    test("calculate two sleep types A & B", () => {
        const calc = createCalculator({
            field: {
                fieldData: {
                    index:0 , emoji: "", name: "", encounter: undefined,
                    ranks: [0, 999999999], powers: [0, 999999999],
                },
                pokemons: {
                    1: {
                        name: "A", type: "dozing", ancestor: 1,
                        field: {0: [{id: 1, rank: 0}]},
                        style: {
                            1: {rarity: 1, isAtopBerry: false, spo: 2,
                                gid: 1, researchExp: 0, dreamShards: 0, candy: 0 },
                        },
                    },
                    2: {
                        name: "B", type: "dozing", ancestor: 2,
                        field: {0: [{id: 1, rank: 0}]},
                        style: {
                            1: {rarity: 1, isAtopBerry: false, spo: 5,
                                gid: 1, researchExp: 0, dreamShards: 0, candy: 0 },
                        },
                    }
                },
            },
            strength: 38000,
            pokemonId: 1,
            detail: "none",
            value: "count",
        });

        // A (1/2) - A (1) - A (1) : found=3, prob=1/2
        // B (1/2) - A (1) - A (1) : found=2, prob=1/2
        const ret1 = calc.calculate(6);
        expect(ret1).toEqual([2 * 0.5 + 3 * 0.5]);

        // A (1/2) - A (1/2) - B (1) : found=2, prob=1/4
        //         - B (1/2) - A (1) : found=2, prob=1/4
        // B (1/2) - A (1/2) - A (1) : found=2, prob=1/4
        //         - B (1/2) - A (1) : found=1, prob=1/4
        const ret2 = calc.calculate(10);
        expect(ret2).toEqual([1 * 0.25 + 2 * 0.75]);
    });

    test("calculate atop-berry style", () => {
        const calc = createCalculator({
            field: {
                fieldData: {
                    index:0 , emoji: "", name: "", encounter: undefined,
                    ranks: [0, 999999999], powers: [0, 999999999],
                },
                pokemons: {
                    1: {
                        name: "A", type: "dozing", ancestor: 1,
                        field: {0: [{id: 1, rank: 0}]},
                        style: {
                            1: {rarity: 1, isAtopBerry: false, spo: 2,
                                gid: 1, researchExp: 0, dreamShards: 0, candy: 0 },
                        },
                    },
                    2: {
                        name: "B", type: "dozing", ancestor: 2,
                        field: {0: [{id: 1, rank: 0}]},
                        style: {
                            1: {rarity: 1, isAtopBerry: true, spo: 3,
                                gid: 1, researchExp: 0, dreamShards: 0, candy: 0 },
                        },
                    }
                }
            },
            strength: 38000,
            pokemonId: 1,
            detail: "none",
            value: "count",
        });

        // A (1/2) - A (1/2) - A (1) : found=3, prob=1/4
        //         - B (1/2) - A (1) : found=2, prob=1/4
        // B (1/2) - A (1)   - A (1) : found=2, prob=1/2
        // (*) Cannot encounter B twice be cause it is atop-berry
        const ret = calc.calculate(6);
        expect(ret).toEqual([3 * 0.25 + 2 * 0.75]);
    });

    test("calculate complex value", () => {
        const calc = createCalculator({
            field: 4,
            strength: 1_000_000,
            pokemonId: 147,
            detail: "showRarity",
            value: "count",
        });
        const s = new Date();

        const ret50 = calc.calculate(50);
        console.log(JSON.stringify(ret50, null, 4));
        expect(ret50.length).toBe(4);
        expect(ret50[0] + ret50[1] + ret50[2] + ret50[3])
            .toBeCloseTo(0.5709576963666881);

        const ret100 = calc.calculate(100);
        expect(ret100.length).toBe(4);
        expect(ret100[0] + ret100[1] + ret100[2] + ret100[3])
            .toBeCloseTo(0.5474772107664958);

        const e = new Date();
        console.log("done: ", (e.getTime() - s.getTime()) / 1000);
    });
});
