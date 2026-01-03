import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

describe('PokemonRP', () => {
    describe('frequency', () => {
        test('test no subskill', () => {
            const iv = new PokemonIv({
                pokemonName: 'Wigglytuff',
                level: 31,
            });
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(45 * 60 + 26);
        });

        test('test with Helping Speed M', () => {
            const iv = new PokemonIv({
                pokemonName: 'Wigglytuff',
                level: 50,
                subSkills: new SubSkillList({ lv50: new SubSkill("Helping Speed M") }),
            });
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(37 * 60 + 29);
        });

        test('test with Helping Speed M and nature', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 25,
                subSkills: new SubSkillList({ lv25: new SubSkill("Helping Speed M") }),
                nature: new Nature("Brave"),
            });
            const rp = new PokemonRp(iv);
            expect(Math.floor(rp.frequency)).toBe(27 * 60);
        });

        test('test with ribbon', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pichu',
                level: 1,
            });

            expect(new PokemonRp(iv.clone({ribbon: 0})).frequency).toBe(4300);
            expect(new PokemonRp(iv.clone({ribbon: 1})).frequency).toBe(4300);
            expect(Math.floor(new PokemonRp(iv.clone({ribbon: 2})).frequency)).toBe(3827);
            expect(Math.floor(new PokemonRp(iv.clone({ribbon: 3})).frequency)).toBe(3827);
            expect(Math.floor(new PokemonRp(iv.clone({ribbon: 4})).frequency)).toBe(3225);
        });
    });

    describe('RP', () => {
        test('Magnezone Lv35', () => {
            const iv = new PokemonIv({
                pokemonName: 'Magnezone',
                level: 35,
                ingredient: "ABA",
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Helping Speed M'),
                    lv25: new SubSkill('Skill Level Up M'),
                }),
                nature: new Nature('Adamant'),
                skillLevel: 5,
            });
            const rp = new PokemonRp(iv);

            expect(rp.frequency).toBe(2236.03);
            expect(rp.helpCountPer5Hour).toBe(8);
            expect(rp.Rp).toBe(2443);
        });

        test('Sylveon Lv10 (ugly hack)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Sylveon',
                level: 10,
                ingredient: "AAA",
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Helping Bonus'),
                }),
                nature: new Nature('Relaxed'),
                skillLevel: 2,
            });
            const rp = new PokemonRp(iv);

            expect(rp.frequency).toBe(2553.1);
            expect(rp.helpCountPer5Hour).toBe(7.05);
            expect(rp.Rp).toBe(1023);
        });

        test('Blastoise Lv60 (floating-point error)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Blastoise',
                level: 60,
                ingredient: "AAA",
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Helping Speed M'),
                    lv25: new SubSkill('Sleep EXP Bonus'),
                    lv50: new SubSkill('Ingredient Finder M'),
                }),
                nature: new Nature('Serious'),
                skillLevel: 3,
            });
            const rp = new PokemonRp(iv);

            expect(rp.Rp).toBe(4545);
        });

        test('Absol Lv41 (floating-point error)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Absol',
                level: 41,
                ingredient: "ABA",
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Inventory Up M'),
                    lv25: new SubSkill('Ingredient Finder M'),
                }),
                nature: new Nature('Adamant'),
                skillLevel: 1,
            });
            const rp = new PokemonRp(iv);

            expect(rp.Rp).toBe(1865);
        });
    });

    describe('memoization', () => {
        test('frequency is cached', () => {
            const iv = new PokemonIv({pokemonName: 'Wigglytuff', level: 31});
            const rp = new PokemonRp(iv);
            const freq1 = rp.frequency;
            const freq2 = rp.frequency;
            expect(freq1).toBe(freq2);
            expect(freq1).toBe(45 * 60 + 26);
        });

        test('calculate is not cached and returns same value', () => {
            const iv = new PokemonIv({pokemonName: 'Magnezone', level: 35});
            const rp = new PokemonRp(iv);
            const result1 = rp.calculate();
            const result2 = rp.calculate();
            expect(result1).not.toBe(result2); // not same object reference
            expect(result1).toEqual(result2);
        });

        test('skillValue is cached', () => {
            const iv = new PokemonIv({pokemonName: 'Magnezone', level: 35, skillLevel: 5});
            const rp = new PokemonRp(iv);
            const val1 = rp.skillValue;
            const val2 = rp.skillValue;
            expect(val1).toBe(val2);
        });

        test('ingredientRatio is cached', () => {
            const iv = new PokemonIv({pokemonName: 'Magnezone', level: 35});
            const rp = new PokemonRp(iv);
            const ratio1 = rp.ingredientRatio;
            const ratio2 = rp.ingredientRatio;
            expect(ratio1).toBe(ratio2);
        });

        test('each instance has its own cache', () => {
            const iv = new PokemonIv({pokemonName: 'Wigglytuff', level: 31});
            const rp1 = new PokemonRp(iv);
            const rp2 = new PokemonRp(iv.clone({level: 30}));

            // Each instance should compute independently
            const freq1 = rp1.frequency;
            const freq2 = rp2.frequency;

            // Values should be not equal
            expect(freq1).not.toBe(freq2);
        });
    });
});
