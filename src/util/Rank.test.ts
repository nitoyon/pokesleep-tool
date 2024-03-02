import Rank from './Rank';
import fields, { MAX_STRENGTH } from '../data/fields';

test("Rank.indexToType", () => {
    expect(Rank.rankIndexToType(0)).toBe("basic");
    expect(Rank.rankIndexToType(4)).toBe("basic");
    expect(Rank.rankIndexToType(5)).toBe("great");
    expect(Rank.rankIndexToType(9)).toBe("great");
    expect(Rank.rankIndexToType(10)).toBe("ultra");
    expect(Rank.rankIndexToType(14)).toBe("ultra");
    expect(Rank.rankIndexToType(15)).toBe("master");
    expect(Rank.rankIndexToType(34)).toBe("master");
});

test("Rank.indexToRankNumber", () => {
    expect(Rank.rankIndexToRankNumber(0)).toBe(1);
    expect(Rank.rankIndexToRankNumber(4)).toBe(5);
    expect(Rank.rankIndexToRankNumber(5)).toBe(1);
    expect(Rank.rankIndexToRankNumber(9)).toBe(5);
    expect(Rank.rankIndexToRankNumber(10)).toBe(1);
    expect(Rank.rankIndexToRankNumber(14)).toBe(5);
    expect(Rank.rankIndexToRankNumber(15)).toBe(1);
    expect(Rank.rankIndexToRankNumber(34)).toBe(20);
});

describe("Rank", () => {
    test("works for great 5", () => {
        const rank = new Rank(73120, fields[0].ranks);
        expect(rank.index).toBe(9);
        expect(rank.type).toBe("great");
        expect(rank.rankNumber).toBe(5);
        expect(rank.thisStrength).toBe(65634);
        expect(rank.nextStrength).toBe(79197);
    });

    test("works for master 20", () => {
        const rank = new Rank(5000000, fields[0].ranks);
        expect(rank.index).toBe(34);
        expect(rank.type).toBe("master");
        expect(rank.rankNumber).toBe(20);
        expect(rank.thisStrength).toBe(3245795);
        expect(rank.nextStrength).toBe(MAX_STRENGTH + 1);
    });
});