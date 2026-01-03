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
        const b = new SubSkillList({ lv10: new SubSkill("Skill Trigger S") });

        const s = new SubSkillList(b.toProps());
        expect(s.lv10?.name).toBe("Skill Trigger S");
        const s2 = s.clone({ lv10: new SubSkill("Berry Finding S") });
        expect(s2.lv10?.name).toBe("Berry Finding S");

        // base objects should not be changed (immutability)
        expect(b.lv10?.name).toBe("Skill Trigger S");
        expect(s.lv10?.name).toBe("Skill Trigger S");
    });
});

describe('SubSkillList.clone with swap logic', () => {
    test('exclusive', () => {
        let s = new SubSkillList();
        s = s.clone({ lv10: new SubSkill("Berry Finding S") });
        expect(s.lv10?.name).toBe("Berry Finding S");

        s = s.clone({ lv25: new SubSkill("Berry Finding S") });
        expect(s.lv10).toBe(null);
        expect(s.lv25?.name).toBe("Berry Finding S");
    });

    test('swap', () => {
        let s = new SubSkillList();
        s = s.clone({ lv10: new SubSkill("Berry Finding S") });
        s = s.clone({ lv25: new SubSkill("Skill Trigger S") });
        expect(s.lv10?.name).toBe("Berry Finding S");
        expect(s.lv25?.name).toBe("Skill Trigger S");

        s = s.clone({ lv25: new SubSkill("Berry Finding S") });
        expect(s.lv10?.name).toBe("Skill Trigger S");
        expect(s.lv25?.name).toBe("Berry Finding S");
    });
});
