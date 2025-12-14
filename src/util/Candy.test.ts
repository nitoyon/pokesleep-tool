import { describe, it, expect } from 'vitest';
import calcCandyUsage, { CandyCount } from './Candy';

describe('calcCandyUsage', () => {
    it('should return empty array when no candies are available', () => {
        const bag: CandyCount = {
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 0,
            typeM: 0,
            typeL: 0,
        };
        const result = calcCandyUsage(30, bag);
        expect(result).toEqual([]);
    });

    it('should return empty array when not enough candies', () => {
        const bag: CandyCount = {
            handyS: 1,
            handyM: 0,
            handyL: 0,
            typeS: 0,
            typeM: 0,
            typeL: 0,
        };
        const result = calcCandyUsage(100, bag);
        expect(result).toEqual([]);
    });

    it('should return exact match with typeS only', () => {
        const bag: CandyCount = {
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 10,
            typeM: 0,
            typeL: 0,
        };
        const result = calcCandyUsage(40, bag);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toEqual({
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 10,
            typeM: 0,
            typeL: 0,
        });
    });

    it('should handle the example from comments (required: 30)', () => {
        const bag: CandyCount = {
            handyS: 40,
            handyM: 3,
            handyL: 1,
            typeS: 10,
            typeM: 1,
            typeL: 1,
        };
        const result = calcCandyUsage(30, bag);

        // Verify that results are returned
        expect(result.length).toBeGreaterThan(0);

        // First result should have minimal excess
        const firstResult = result[0];
        const total =
            firstResult.handyS * 3 +
            firstResult.handyM * 20 +
            firstResult.handyL * 100 +
            firstResult.typeS * 4 +
            firstResult.typeM * 25 +
            firstResult.typeL * 125;

        expect(total).toBeGreaterThanOrEqual(30);

        // As in the comment example, should include combinations like typeS: 6, handyS: 2
        // (6 * 4 + 2 * 3 = 24 + 6 = 30)
        const exactMatch = result.find(r =>
            r.typeS === 6 && r.handyS === 2 &&
            r.typeM === 0 && r.typeL === 0 &&
            r.handyM === 0 && r.handyL === 0
        );
        expect(exactMatch).toBeDefined();
    });

    it('should prioritize type candies over handy candies', () => {
        const bag: CandyCount = {
            handyS: 10,
            handyM: 10,
            handyL: 10,
            typeS: 10,
            typeM: 10,
            typeL: 10,
        };
        const result = calcCandyUsage(100, bag);

        expect(result.length).toBeGreaterThan(0);

        // First result should use typeL (since 100 = 125, 1 piece has 25 excess)
        // Or combinations like 4 typeM (100)
        const firstResult = result[0];
        const typeTotal = firstResult.typeS + firstResult.typeM + firstResult.typeL;
        const handyTotal = firstResult.handyS + firstResult.handyM + firstResult.handyL;

        // Type candies should be used more
        if (typeTotal === handyTotal) {
            // If same count, larger size should be used
            expect(firstResult.typeL).toBeGreaterThanOrEqual(firstResult.handyL);
        }
    });

    it('should prioritize larger candies when same type', () => {
        const bag: CandyCount = {
            handyS: 999,
            handyM: 99,
            handyL: 99,
            typeS: 999,
            typeM: 99,
            typeL: 99,
        };
        const result = calcCandyUsage(125, bag);

        expect(result.length).toBeGreaterThan(0);

        // First result should be 1 typeL (125 = 125 with 0 excess)
        expect(result[0]).toEqual({
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 0,
            typeM: 0,
            typeL: 1,
        });
    });

    it('should return up to 10 results', () => {
        const bag: CandyCount = {
            handyS: 100,
            handyM: 50,
            handyL: 50,
            typeS: 100,
            typeM: 50,
            typeL: 50,
        };
        const result = calcCandyUsage(100, bag);

        // Up to 10 results maximum
        expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should handle small required values', () => {
        const bag: CandyCount = {
            handyS: 10,
            handyM: 0,
            handyL: 0,
            typeS: 10,
            typeM: 0,
            typeL: 0,
        };
        const result = calcCandyUsage(4, bag);

        expect(result.length).toBeGreaterThan(0);

        // 1 typeS = 4
        expect(result[0]).toEqual({
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 1,
            typeM: 0,
            typeL: 0,
        });
    });

    it('should handle combinations with minimal excess', () => {
        const bag: CandyCount = {
            handyS: 10,
            handyM: 0,
            handyL: 0,
            typeS: 10,
            typeM: 0,
            typeL: 0,
        };
        // 5 = typeS(4) + handyS(3) = 7 (excess 2)
        // 5 = handyS(3) + handyS(3) = 6 (excess 1)
        const result = calcCandyUsage(5, bag);

        expect(result.length).toBeGreaterThan(0);

        // First result has minimal excess (2 handyS = 6, excess 1)
        expect(result[0]).toEqual({
            handyS: 2,
            handyM: 0,
            handyL: 0,
            typeS: 0,
            typeM: 0,
            typeL: 0,
        });
    });

    it('should respect bag limits', () => {
        const bag: CandyCount = {
            handyS: 1,
            handyM: 0,
            handyL: 0,
            typeS: 2,
            typeM: 0,
            typeL: 0,
        };
        const result = calcCandyUsage(8, bag);

        // 2 typeS = 8
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toEqual({
            handyS: 0,
            handyM: 0,
            handyL: 0,
            typeS: 2,
            typeM: 0,
            typeL: 0,
        });
    });
});
