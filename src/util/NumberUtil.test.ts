import { round1, round2, formatWithComma, getFormatWithCommaPos, clamp } from './NumberUtil';

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

describe('getFormatWithCommaPos', () => {
    // For 1234567 → "1,234,567" (9 chars with commas at positions 1 and 5)
    test('1234567 at pos 0', () => { expect(getFormatWithCommaPos(1234567, 0)).toBe(0); }); // '1'
    test('1234567 at pos 1', () => { expect(getFormatWithCommaPos(1234567, 1)).toBe(2); }); // '2' (skip comma at pos 1)
    test('1234567 at pos 2', () => { expect(getFormatWithCommaPos(1234567, 2)).toBe(3); }); // '3'
    test('1234567 at pos 3', () => { expect(getFormatWithCommaPos(1234567, 3)).toBe(4); }); // '4'
    test('1234567 at pos 4', () => { expect(getFormatWithCommaPos(1234567, 4)).toBe(6); }); // '5' (skip comma at pos 5)
    test('1234567 at pos 5', () => { expect(getFormatWithCommaPos(1234567, 5)).toBe(7); }); // '6'
    test('1234567 at pos 6', () => { expect(getFormatWithCommaPos(1234567, 6)).toBe(8); }); // '7'
    test('1234567 at pos 7', () => { expect(getFormatWithCommaPos(1234567, 7)).toBe(9); }); // beyond end
});

describe('clamp', () => {
    test('value within range', () => { expect(clamp(0, 5, 10)).toBe(5); });
    test('value below min returns min', () => { expect(clamp(0, -5, 10)).toBe(0); });
    test('value above max returns max', () => { expect(clamp(0, 15, 10)).toBe(10); });
    test('value equals min', () => { expect(clamp(0, 0, 10)).toBe(0); });
    test('value equals max', () => { expect(clamp(0, 10, 10)).toBe(10); });
    test('negative range', () => { expect(clamp(-10, -5, -1)).toBe(-5); });
    test('value below negative min', () => { expect(clamp(-10, -15, -1)).toBe(-10); });
    test('value above negative max', () => { expect(clamp(-10, 5, -1)).toBe(-1); });
    test('zero range', () => { expect(clamp(5, 3, 5)).toBe(5); });
});
