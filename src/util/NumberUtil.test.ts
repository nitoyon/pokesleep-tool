import { round1, round2, formatWithComma } from './NumberUtil';

describe('round1', () => {
    test('0', () => { expect(round1(0)).toBe("0.0"); });
    test('1', () => { expect(round1(1)).toBe("1.0"); });
    test('1.11', () => { expect(round1(1.11)).toBe("1.1"); });
    test('1.15', () => { expect(round1(1.15)).toBe("1.2"); });
    test('3000.15', () => { expect(round1(3000.15)).toBe("3,000.2"); });
    test('12345678.35', () => { expect(round1(12345678.35)).toBe("12,345,678.4"); });
});

describe('round2', () => {
    test('0', () => { expect(round2(0)).toBe("0.00"); });
    test('1', () => { expect(round2(1)).toBe("1.00"); });
    test('1.01', () => { expect(round2(1.01)).toBe("1.01"); });
    test('1.112', () => { expect(round2(1.112)).toBe("1.11"); });
    test('1.115', () => { expect(round2(1.115)).toBe("1.12"); });
    test('3000.155', () => { expect(round2(3000.155)).toBe("3,000.16"); });
    test('12345678.355', () => { expect(round2(12345678.355)).toBe("12,345,678.36"); });
});

describe('formatWithComma', () => {
    test('1000', () => { expect(formatWithComma(1000)).toBe("1,000"); });
    test('12345678', () => { expect(formatWithComma(12345678)).toBe("12,345,678"); });
});
