import PokemonRp from './PokemonRp';
import Nature from './Nature';
import SubSkill from './SubSkill';

describe('PokemonRP', () => {
    describe('frequency', () => {
        test('test no subskill', () => {
            const rp = new PokemonRp('Wigglytuff');
            rp.level = 31;
            expect(Math.floor(rp.frequency)).toBe(45 * 60 + 26);
        });

        test('test with Helping Speed M', () => {
            const rp = new PokemonRp('Wigglytuff');
            rp.level = 50;
            rp.subSkills.lv50 = new SubSkill("Helping Speed M");
            expect(Math.floor(rp.frequency)).toBe(37 * 60 + 29);
        });

        test('test with Helping Speed M and nature', () => {
            const rp = new PokemonRp('Raichu');
            rp.level = 25;
            rp.subSkills.lv25 = new SubSkill("Helping Speed M");
            rp.nature = new Nature("Brave");
            expect(Math.floor(rp.frequency)).toBe(27 * 60);
        });
    });
});
