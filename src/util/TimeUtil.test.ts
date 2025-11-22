import { AmountOfSleep } from './TimeUtil';
import type { TFunction } from 'i18next';

// Mock translation function
const mockT = vi.fn((key: string, obj: {h: number, m: number}) => {
    return `${obj.h}hr ${obj.m}m`;
}) as unknown as TFunction;

describe('AmountOfSleep', () => {
    test('score', () => {
        expect(new AmountOfSleep(508).score).toBe(100);
        expect(new AmountOfSleep(520).score).toBe(100);
        expect(new AmountOfSleep(0).score).toBe(0);
    });

    test('hhmm', () => {
        const s = new AmountOfSleep(508);
        expect(s.h).toBe(8);
        expect(s.m).toBe(28);
    });

    test('toString', () => {
        const s = new AmountOfSleep(59.9999999999);
        expect(s.h).toBe(0);
        expect(s.m).toBeCloseTo(59.9999999999);
        expect(s.toString(mockT)).toBe("1hr 0m");
    });
});
