import Nature from './Nature';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

describe('PokemonIV', () => {
    describe('clone', () => {
        test('same pokemon', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            iv.skillLevel = 2;

            const iv2 = iv.clone();
            expect(iv2.skillLevel).toBe(2);
            expect(iv.isEqual(iv2)).toBe(true);
        });

        test('evolved pokemon (normal)', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            iv.skillLevel = 2;

            const iv2 = iv.clone('Venusaur');
            expect(iv2.skillLevel).toBe(4);
        });

        test('evolved pokemon (max skill level 7)', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            iv.skillLevel = 5;

            const iv2 = iv.clone('Venusaur');
            expect(iv2.skillLevel).toBe(7);
        });

        test('reverse evolve underflow', () => {
            const iv = new PokemonIv('Venusaur');
            iv.skillLevel = 2;

            const iv2 = iv.clone('Bulbasaur');
            expect(iv2.skillLevel).toBe(1);
        });

        test('evolved to toxtricity (Amped)', () => {
            const iv = new PokemonIv('Toxel');
            iv.nature = new Nature("Relaxed")

            const iv2 = iv.clone('Toxtricity (Amped)');
            expect(iv2.nature.name).toBe("Impish");
        });

        test('evolved to toxtricity (Low Key)', () => {
            const iv = new PokemonIv('Toxel');
            iv.nature = new Nature("Impish")

            const iv2 = iv.clone('Toxtricity (Low Key)');
            expect(iv2.nature.name).toBe("Bold");
        });
    });

    test('changeLevel', () => {
        const iv = new PokemonIv('Bulbasaur');
        iv.level = 15;
        iv.skillLevel = 3;
        iv.subSkills.lv10 = new SubSkill('Skill Level Up M');
        iv.subSkills.lv25 = new SubSkill('Skill Level Up S');

        expect(iv.changeLevel(9).skillLevel).toBe(1);
        expect(iv.changeLevel(25).skillLevel).toBe(4);
    });

    describe('changeSubSkills', () => {
        test('removing skill level up sub-skills decreases skill level', () => {
            const iv = new PokemonIv('Bulbasaur');
            iv.level = 30;
            iv.skillLevel = 5;
            iv.subSkills.lv10 = new SubSkill('Skill Level Up M');  // +2
            iv.subSkills.lv25 = new SubSkill('Skill Level Up S');  // +1

            // Skill level should decrease by 2
            const newSubskills = new SubSkillList()
            newSubskills.lv10 = new SubSkill('Skill Level Up S');  // +1
            const result = iv.changeSubSkills(newSubskills);
            expect(result.skillLevel).toBe(3);
        });

        test('skill level overflow is handled', () => {
            const iv = new PokemonIv('Bulbasaur');
            iv.level = 30;
            iv.skillLevel = 6;

            // Skill level should be at most 7
            // because max skill level of 'Ingredient Magnet S' is 7
            const newSubSkills = new SubSkillList();
            newSubSkills.lv10 = new SubSkill('Skill Level Up M');  // +2
            const result = iv.changeSubSkills(newSubSkills);
            expect(result.skillLevel).toBe(7);
        });
    });

    describe('decendants', () => {
        test('Bulbasaur', () => {
            const iv = new PokemonIv('Bulbasaur');

            const allDecendants = iv.allDecendants;
            expect(allDecendants.length).toBe(3);
            expect(allDecendants[0].name).toBe('Bulbasaur');
            expect(allDecendants[1].name).toBe('Ivysaur');
            expect(allDecendants[2].name).toBe('Venusaur');

            const decendants = iv.decendants;
            expect(decendants.length).toBe(1);
            expect(decendants[0].name).toBe('Venusaur');
        });

        test('Toxel', () => {
            const iv = new PokemonIv('Toxel');

            iv.nature = new Nature("Docile");
            const ampedDecendants = iv.decendants;
            expect(ampedDecendants.length).toBe(1);
            expect(ampedDecendants[0].name).toBe('Toxtricity (Amped)');

            iv.nature = new Nature("Serious");
            const lowDecendants = iv.decendants;
            expect(lowDecendants.length).toBe(1);
            expect(lowDecendants[0].name).toBe('Toxtricity (Low Key)');
        });
    });

    describe('serialize', () => {
        test('empty Bulbasaur', () => {
            const iv = new PokemonIv('Bulbasaur');
            iv.skillLevel = 3;
            expect(iv.serialize()).toBe('EQCApwj5-38f');

            const ret = PokemonIv.deserialize('EQCApwj5-38f');
            compareIv(iv, ret);
        });

        test('set Bewear parameter', () => {
            const iv = new PokemonIv('Bewear');
            iv.level = 24;
            iv.nature = new Nature("Impish");
            iv.skillLevel = 5;
            iv.subSkills.lv10 = new SubSkill("Berry Finding S");
            iv.subSkills.lv25 = new SubSkill("Helping Speed S");
            iv.subSkills.lv50 = new SubSkill("Ingredient Finder M");
            iv.subSkills.lv75 = new SubSkill("Inventory Up L");
            iv.subSkills.lv100 = new SubSkill("Skill Level Up S");
            expect(iv.serialize()).toBe('gS8AppABDSUL');

            const ret = PokemonIv.deserialize('gS8AppABDSUL');
            compareIv(iv, ret);
        });

        test('Pikachu (Halloween)', () => {
            const iv = new PokemonIv('Pikachu (Halloween)');
            iv.skillLevel = 3;
            expect(iv.serialize()).toBe('kQGBpwj5-38f');
            expect(iv.form).toBe(1);
            expect(iv.idForm).toBe(25 + 0x1000);

            const ret = PokemonIv.deserialize('kQGBpwj5-38f');
            compareIv(iv, ret);
        });

        test('ribbon', () => {
            const iv = new PokemonIv('Bulbasaur');
            iv.ribbon = 4;
            expect(iv.serialize()).toBe('EQCApwD5-3+f');

            const ret = PokemonIv.deserialize('EQCApwD5-3+f');
            compareIv(iv, ret);
        });

        test('idForm', () => {
            const iv = new PokemonIv('Vulpix (Alola)');
            expect(iv.idForm).toBe(37 + 0x3000);
            expect(PokemonIv.getFormByIdForm(37 + 0x3000)).toBe(3);
            expect(PokemonIv.getIdByIdForm(37 + 0x3000)).toBe(37);
        });

        test('import old darkrai', () => {
            const ret = PokemonIv.deserialize("sR4ApwT5-38f");
            expect(ret.pokemon.name).toBe("Darkrai");
            expect(ret.mythIng1).toBe("sausage");
            expect(ret.mythIng2).toBe("unknown");
            expect(ret.mythIng3).toBe("unknown");
        });

        test('mythical ingredients (coffee/apple/unknown)', () => {
            const iv = new PokemonIv('Darkrai');
            iv.mythIng1 = "coffee";
            iv.mythIng2 = "apple";
            iv.mythIng3 = "unknown";

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("apple");
            expect(ret.mythIng3).toBe("unknown");
        });

        test('mythical ingredients (coffee/apple/soy)', () => {
            const iv = new PokemonIv('Darkrai');
            iv.mythIng1 = "coffee";
            iv.mythIng2 = "apple";
            iv.mythIng3 = "soy";

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("apple");
            expect(ret.mythIng3).toBe("soy");
        });

        test('mythical ingredients (coffee/coffee/coffee)', () => {
            const iv = new PokemonIv('Darkrai');
            iv.mythIng1 = "coffee";
            iv.mythIng2 = "coffee";
            iv.mythIng3 = "coffee";

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("coffee");
            expect(ret.mythIng3).toBe("coffee");
        });

        test('Toxtricity (Amped)', () => {
            const iv = new PokemonIv('Toxtricity (Amped)');
            expect(iv.serialize()).toBe('ETWFp0T4-38f');

            const ret = PokemonIv.deserialize('ETWFp0T4-38f');
            compareIv(iv, ret);
        });

        test('Toxtricity (Low Key)', () => {
            const iv = new PokemonIv('Toxtricity (Low Key)');
            expect(iv.serialize()).toBe('ETWGpwT5-38f');

            const ret = PokemonIv.deserialize('ETWGpwT5-38f');
            compareIv(iv, ret);
        });
    });

    function compareIv(iv1: PokemonIv, iv2: PokemonIv) {
        expect(iv2.pokemon.name).toBe(iv1.pokemon.name);
        expect(iv2.idForm).toBe(iv1.idForm);
        expect(iv2.level).toBe(iv1.level);
        expect(iv2.ingredient).toBe(iv1.ingredient);
        expect(iv2.nature.name).toBe(iv1.nature.name);
        expect(iv2.skillLevel).toBe(iv1.skillLevel);
        expect(iv2.subSkills.lv10?.name).toBe(iv1.subSkills.lv10?.name);
        expect(iv2.subSkills.lv25?.name).toBe(iv1.subSkills.lv25?.name);
        expect(iv2.subSkills.lv50?.name).toBe(iv1.subSkills.lv50?.name);
        expect(iv2.subSkills.lv75?.name).toBe(iv1.subSkills.lv75?.name);
        expect(iv2.subSkills.lv100?.name).toBe(iv1.subSkills.lv100?.name);
        expect(iv2.ribbon).toBe(iv1.ribbon);
    }
});
