import parseTsv from './RpParse';

describe('Energy', () => {
    test('Lvl1-9', () => {
        const ret = parseTsv('Arcanine	3	715	Lax	2');
        expect('Arcanine' in ret).toBe(true);
        expect(ret['Arcanine'].length).toBe(1);
        expect(ret['Arcanine'][0].iv.level).toBe(3);
        expect(ret['Arcanine'][0].rp).toBe(715);
        expect(ret['Arcanine'][0].iv.nature.name).toBe('Lax');
        expect(ret['Arcanine'][0].iv.skillLevel).toBe(2);
    });

    test('Lvl10-19', () => {
        const ret = parseTsv('Abomasnow	17	766	Adamant	1	Inventory Up S		');
        expect('Abomasnow' in ret).toBe(true);
        expect(ret['Abomasnow'].length).toBe(1);
        expect(ret['Abomasnow'][0].iv.level).toBe(17);
        expect(ret['Abomasnow'][0].rp).toBe(766);
        expect(ret['Abomasnow'][0].iv.nature.name).toBe('Adamant');
        expect(ret['Abomasnow'][0].iv.skillLevel).toBe(1);
        expect(ret['Abomasnow'][0].iv.subSkills.lv10?.name).toBe('Inventory Up S');
    });

    test('Lvl25-29', () => {
        const ret = parseTsv('Abomasnow	25	1053	Quiet	1	Ingredient Finder S	Inventory Up M	');
        expect('Abomasnow' in ret).toBe(true);
        expect(ret['Abomasnow'].length).toBe(1);
        expect(ret['Abomasnow'][0].iv.level).toBe(25);
        expect(ret['Abomasnow'][0].rp).toBe(1053);
        expect(ret['Abomasnow'][0].iv.nature.name).toBe('Quiet');
        expect(ret['Abomasnow'][0].iv.skillLevel).toBe(1);
        expect(ret['Abomasnow'][0].iv.subSkills.lv10?.name).toBe('Ingredient Finder S');
        expect(ret['Abomasnow'][0].iv.subSkills.lv25?.name).toBe('Inventory Up M');
    });

    test('Lvl30-49', () => {
        const ret = parseTsv('Abomasnow	30	1580	Bashful	2	Helping Speed M	Ingredient Finder M	Fancy Egg');
        expect('Abomasnow' in ret).toBe(true);
        expect(ret['Abomasnow'].length).toBe(1);
        expect(ret['Abomasnow'][0].iv.level).toBe(30);
        expect(ret['Abomasnow'][0].rp).toBe(1580);
        expect(ret['Abomasnow'][0].iv.nature.name).toBe('Bashful');
        expect(ret['Abomasnow'][0].iv.skillLevel).toBe(2);
        expect(ret['Abomasnow'][0].iv.subSkills.lv10?.name).toBe('Helping Speed M');
        expect(ret['Abomasnow'][0].iv.subSkills.lv25?.name).toBe('Ingredient Finder M');
        expect(ret['Abomasnow'][0].iv.ingredient.charAt(1)).toBe('B');
    });

    test('Lvl50-59', () => {
        const ret = parseTsv('Blastoise	50	3025	Impish	3	Berry Finding S	Ingredient Finder M	Helping Speed M	Soothing Cacao');
        expect('Blastoise' in ret).toBe(true);
        expect(ret['Blastoise'].length).toBe(1);
        expect(ret['Blastoise'][0].iv.level).toBe(50);
        expect(ret['Blastoise'][0].rp).toBe(3025);
        expect(ret['Blastoise'][0].iv.nature.name).toBe('Impish');
        expect(ret['Blastoise'][0].iv.skillLevel).toBe(3);
        expect(ret['Blastoise'][0].iv.subSkills.lv10?.name).toBe('Berry Finding S');
        expect(ret['Blastoise'][0].iv.subSkills.lv25?.name).toBe('Ingredient Finder M');
        expect(ret['Blastoise'][0].iv.subSkills.lv50?.name).toBe('Helping Speed M');
        expect(ret['Blastoise'][0].iv.ingredient.charAt(1)).toBe('B');
    });

    test('Lvl60-', () => {
        const ret = parseTsv('Blastoise	60	3692	Lonely	3	Ingredient Finder M	Ingredient Finder S	Skill Trigger M	Soothing Cacao	Soothing Cacao');
        expect('Blastoise' in ret).toBe(true);
        expect(ret['Blastoise'].length).toBe(1);
        expect(ret['Blastoise'][0].iv.level).toBe(60);
        expect(ret['Blastoise'][0].rp).toBe(3692);
        expect(ret['Blastoise'][0].iv.nature.name).toBe('Lonely');
        expect(ret['Blastoise'][0].iv.skillLevel).toBe(3);
        expect(ret['Blastoise'][0].iv.subSkills.lv10?.name).toBe('Ingredient Finder M');
        expect(ret['Blastoise'][0].iv.subSkills.lv25?.name).toBe('Ingredient Finder S');
        expect(ret['Blastoise'][0].iv.subSkills.lv50?.name).toBe('Skill Trigger M');
        expect(ret['Blastoise'][0].iv.ingredient.charAt(1)).toBe('B');
        expect(ret['Blastoise'][0].iv.ingredient.charAt(2)).toBe('B');
    });

    test('Submissions 10', () => {
        const ret = parseTsv('Wobbuffet	11	667	Careful	1	Inventory Up S				');
        expect('Wobbuffet' in ret).toBe(true);
        expect(ret['Wobbuffet'].length).toBe(1);
        expect(ret['Wobbuffet'][0].iv.level).toBe(11);
        expect(ret['Wobbuffet'][0].rp).toBe(667);
        expect(ret['Wobbuffet'][0].iv.nature.name).toBe('Careful');
        expect(ret['Wobbuffet'][0].iv.skillLevel).toBe(1);
        expect(ret['Wobbuffet'][0].iv.subSkills.lv10?.name).toBe('Inventory Up S');
    });

    test('Submissions 30', () => {
        const ret = parseTsv('Comfey	30	1380	Gentle	1	Skill Trigger S	Ingredient Finder S		Warming Ginger	');
        expect('Comfey' in ret).toBe(true);
        expect(ret['Comfey'].length).toBe(1);
        expect(ret['Comfey'][0].iv.level).toBe(30);
        expect(ret['Comfey'][0].rp).toBe(1380);
        expect(ret['Comfey'][0].iv.nature.name).toBe('Gentle');
        expect(ret['Comfey'][0].iv.skillLevel).toBe(1);
        expect(ret['Comfey'][0].iv.subSkills.lv10?.name).toBe('Skill Trigger S');
        expect(ret['Comfey'][0].iv.subSkills.lv25?.name).toBe('Ingredient Finder S');
        expect(ret['Comfey'][0].iv.ingredient.charAt(1)).toBe('B');
    });
});
