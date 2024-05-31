import Nature from './Nature';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';

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

        test('evolved pokemon', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            iv.skillLevel = 2;

            const iv2 = iv.clone('Venusaur');
            expect(iv2.skillLevel).toBe(4);
        });

        test('evolved pokemon (max skill level 6)', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            iv.skillLevel = 5;

            const iv2 = iv.clone('Venusaur');
            expect(iv2.skillLevel).toBe(6);
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

            const ret = PokemonIv.deserialize('kQGBpwj5-38f');
            compareIv(iv, ret);
        });
    });

    function compareIv(iv1: PokemonIv, iv2: PokemonIv) {
        expect(iv2.pokemon.name).toBe(iv1.pokemon.name);
        expect(iv2.level).toBe(iv1.level);
        expect(iv2.ingredient).toBe(iv1.ingredient);
        expect(iv2.nature.name).toBe(iv1.nature.name);
        expect(iv2.skillLevel).toBe(iv1.skillLevel);
        expect(iv2.subSkills.lv10?.name).toBe(iv1.subSkills.lv10?.name);
        expect(iv2.subSkills.lv25?.name).toBe(iv1.subSkills.lv25?.name);
        expect(iv2.subSkills.lv50?.name).toBe(iv1.subSkills.lv50?.name);
        expect(iv2.subSkills.lv75?.name).toBe(iv1.subSkills.lv75?.name);
        expect(iv2.subSkills.lv100?.name).toBe(iv1.subSkills.lv100?.name);
    }
});
