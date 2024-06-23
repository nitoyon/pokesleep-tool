import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

describe('PokemonRP', () => {
    describe('frequency', () => {
        test('test no subskill', () => {
            const iv = new PokemonIv('Wigglytuff');
            iv.level = 31;
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(45 * 60 + 26);
        });

        test('test with Helping Speed M', () => {
            const iv = new PokemonIv('Wigglytuff');
            iv.level = 50;
            iv.subSkills.lv50 = new SubSkill("Helping Speed M");
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(37 * 60 + 29);
        });

        test('test with Helping Speed M and nature', () => {
            const iv = new PokemonIv('Raichu');
            iv.level = 25;
            iv.subSkills.lv25 = new SubSkill("Helping Speed M");
            iv.nature = new Nature("Brave");
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(27 * 60);
        });
    });

    describe('RP', () => {
        test('Magnezone Lv35', () => {
            const iv = new PokemonIv('Magnezone');
            iv.level = 35;
            iv.ingredient = "ABA";
            iv.subSkills = new SubSkillList([
                new SubSkill('Helping Speed M'),
                new SubSkill('Skill Level Up M')
            ]);
            iv.nature = new Nature('Adamant');
            iv.skillLevel = 5;
            const rp = new PokemonRp(iv);

            expect(rp.helpCountPer5Hour).toBe(8);
            expect(rp.Rp).toBe(2443);
        });
    });
});
