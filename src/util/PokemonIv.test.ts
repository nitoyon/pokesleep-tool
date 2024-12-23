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

        test('evolved pokemon (normal)', () => {
            const iv = new PokemonIv('Bulbasaur');
            expect(iv.skillLevel).toBe(1);
            expect(iv.evolvedCount).toBe(0);
            iv.skillLevel = 2;

            const iv2 = iv.clone('Venusaur');
            expect(iv2.skillLevel).toBe(4);
            expect(iv2.evolvedCount).toBe(2);
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
            iv.evolvedCount = 1;

            const iv2 = iv.clone('Bulbasaur');
            expect(iv2.skillLevel).toBe(1);
            expect(iv2.evolvedCount).toBe(0);
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
            expect(iv.form).toBe(1);
            expect(iv.idForm).toBe(25 + 0x1000);

            const ret = PokemonIv.deserialize('kQGBpwj5-38f');
            compareIv(iv, ret);
        });

        test('evolvedCount', () => {
            const iv = new PokemonIv('Venusaur');
            iv.evolvedCount = 0;
            expect(iv.serialize()).toBe('MQCApwr5-38f');

            const ret = PokemonIv.deserialize('MQCApwr5-38f');
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
        expect(iv2.evolvedCount).toBe(iv1.evolvedCount);
        expect(iv2.ribbon).toBe(iv1.ribbon);
    }
});
