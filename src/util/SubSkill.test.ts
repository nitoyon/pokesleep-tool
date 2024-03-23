import SubSkill from './SubSkill';

describe('SubSkill', () => {
    test('works fine when Helping Speed M is given', () => {
        const s = new SubSkill("Helping Speed M");
        expect(s.helpingSpeed).toBe(2);
        expect(s.ingredientFinder).toBe(0);
        expect(s.inventory).toBe(0);
        expect(s.skillTrigger).toBe(0);
        expect(s.isGold).toBe(false);
        expect(s.isBlue).toBe(true);
        expect(s.isWhite).toBe(false);
        expect(s.isBFS).toBe(false);
    });

    test('works fine when Berry Finding S is given', () => {
        const s = new SubSkill("Berry Finding S");
        expect(s.helpingSpeed).toBe(0);
        expect(s.ingredientFinder).toBe(0);
        expect(s.inventory).toBe(0);
        expect(s.skillTrigger).toBe(0);
        expect(s.isGold).toBe(true);
        expect(s.isBlue).toBe(false);
        expect(s.isWhite).toBe(false);
        expect(s.isBFS).toBe(true);
    });

    test('works fine when Inventory Up L is given', () => {
        const s = new SubSkill("Inventory Up L");
        expect(s.helpingSpeed).toBe(0);
        expect(s.ingredientFinder).toBe(0);
        expect(s.inventory).toBe(3);
        expect(s.skillTrigger).toBe(0);
        expect(s.isGold).toBe(false);
        expect(s.isBlue).toBe(true);
        expect(s.isWhite).toBe(false);
        expect(s.isBFS).toBe(false);
    });

    test('throws error when invalid nature is given', () => {
        expect(() => {new SubSkill("a")}).toThrow();
    });
});
