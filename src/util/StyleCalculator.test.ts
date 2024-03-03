import StyleCalculator from './StyleCalculator';

describe("StyleCalculator", () => {
    test("calculate Cyan Chikorita guaranteed on power 570,000", () => {
        const calc = new StyleCalculator(1, 152, 59000);
        const ret = calc.calculate(10);
        expect(0 in ret.data).toBe(false);
        expect(Object.values(ret.data).reduce<number>((p, c) => p + c, 0)).toBeCloseTo(1);
    });

    test("calculate Cyan Chikorita guaranteed on power 1557,999", () => {
        const calc = new StyleCalculator(1, 152, 155799);
        const ret = calc.calculate(10);
        expect(0 in ret.data).toBe(false);
        expect(Object.values(ret.data).reduce<number>((p, c) => p + c, 0)).toBeCloseTo(1);
    });

    test("calculate too low power", () => {
        const calc = new StyleCalculator(0, 19, 10);
        const ret = calc.calculate(100);
        expect(ret.data).toEqual({"3": 1});
    });

    test("calculate two sleep types A & B", () => {
        const calc = new StyleCalculator({
            field: {
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
            }
        }, 1, 38000);

        // A (1/2) - A (1) - A (1) : found=3, prob=1/2
        // B (1/2) - A (1) - A (1) : found=2, prob=1/2
        const ret1 = calc.calculate(6);
        expect(ret1.data).toEqual({"2": 0.5, "3": 0.5});

        // A (1/2) - A (1/2) - B (1) : found=2, prob=1/4
        //         - B (1/2) - A (1) : found=2, prob=1/4
        // B (1/2) - A (1/2) - A (1) : found=2, prob=1/4
        //         - B (1/2) - A (1) : found=1, prob=1/4
        const ret2 = calc.calculate(10);
        expect(ret2.data).toEqual({"1": 0.25, "2": 0.75});
    });

    test("calculate atop-berry style", () => {
        const calc = new StyleCalculator({
            field: {
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
        }, 1, 38000);

        // A (1/2) - A (1/2) - A (1) : found=3, prob=1/4
        //         - B (1/2) - A (1) : found=2, prob=1/4
        // B (1/2) - A (1)   - A (1) : found=2, prob=1/2
        // (*) Cannot encounter B twice be cause it is atop-berry
        const ret = calc.calculate(6);
        expect(ret.data).toEqual({"3": 0.25, "2": 0.75});
    });

    test("calculate complex value", () => {
        const calc = new StyleCalculator(4, 147, 1_000_000);
        const s = new Date();

        const ret50 = calc.calculate(50);
        expect(ret50.getExpectedValue()).toBeCloseTo(0.5709576963666881);

        const ret100 = calc.calculate(100);
        expect(ret100.getExpectedValue()).toBeCloseTo(0.5474772107664958);

        const e = new Date();
        console.log("done: ", (e.getTime() - s.getTime()) / 1000);
    });
});
