import { AmountOfSleep } from './TimeUtil';

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
});
