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

        test('test with ribbon', () => {
            const iv = new PokemonIv('Pichu');
            iv.level = 1;

            iv.ribbon = 0;
            expect(new PokemonRp(iv).frequency).toBe(4300);

            iv.ribbon = 1;
            expect(new PokemonRp(iv).frequency).toBe(4300);

            iv.ribbon = 2;
            expect(Math.floor(new PokemonRp(iv).frequency)).toBe(3827);

            iv.ribbon = 3;
            expect(Math.floor(new PokemonRp(iv).frequency)).toBe(3827);

            iv.ribbon = 4;
            expect(Math.floor(new PokemonRp(iv).frequency)).toBe(3225);
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

        test('Blastoise Lv60 (floating-point error)', () => {
            const iv = new PokemonIv('Blastoise');
            iv.level = 60;
            iv.ingredient = "AAA";
            iv.subSkills = new SubSkillList([
                new SubSkill('Helping Speed M'),
                new SubSkill('Sleep EXP Bonus'),
                new SubSkill('Ingredient Finder M'),
            ]);
            iv.nature = new Nature('Serious');
            iv.skillLevel = 3;
            const rp = new PokemonRp(iv);

            expect(rp.Rp).toBe(4545);
        });

        test('Absol Lv41 (floating-point error)', () => {
            const iv = new PokemonIv('Absol');
            iv.level = 41;
            iv.ingredient = "ABA";
            iv.subSkills = new SubSkillList([
                new SubSkill('Inventory Up M'),
                new SubSkill('Ingredient Finder M'),
            ]);
            iv.nature = new Nature('Adamant');
            iv.skillLevel = 1;
            const rp = new PokemonRp(iv);

            expect(rp.Rp).toBe(1865);
        });
    });
});
