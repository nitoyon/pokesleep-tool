import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

describe('SubSkillList constructor', () => {
    test('no argument', () => {
        const s = new SubSkillList();
        expect(s.lv10).toBe(null);
        expect(s.lv25).toBe(null);
        expect(s.lv50).toBe(null);
        expect(s.lv75).toBe(null);
        expect(s.lv100).toBe(null);
    });

    test('argument given', () => {
        const b = new SubSkillList();
        b.lv10 = new SubSkill("Skill Trigger S");

        const s = new SubSkillList(b);
        expect(s.lv10?.name).toBe("Skill Trigger S");
        s.lv10 = new SubSkill("Berry Finding S");
        expect(s.lv10?.name).toBe("Berry Finding S");

        // base object should not be changed!
        expect(b.lv10?.name).toBe("Skill Trigger S");
    });
});

describe('SubSkillList.set', () => {
    test('exclusive', () => {
        const s = new SubSkillList();
        s.lv10 = new SubSkill("Berry Finding S");
        expect(s.lv10?.name).toBe("Berry Finding S");

        s.lv25 = new SubSkill("Berry Finding S");
        expect(s.lv10).toBe(null);
        expect(s.lv25?.name).toBe("Berry Finding S");
    });

    test('swap', () => {
        const s = new SubSkillList();
        s.lv10 = new SubSkill("Berry Finding S");
        s.lv25 = new SubSkill("Skill Trigger S");
        expect(s.lv10?.name).toBe("Berry Finding S");
        expect(s.lv25?.name).toBe("Skill Trigger S");

        s.lv25 = new SubSkill("Berry Finding S");
        expect(s.lv10?.name).toBe("Skill Trigger S");
        expect(s.lv25?.name).toBe("Berry Finding S");
    });
});
