import Nature from './Nature';
import PokemonIv from './PokemonIv';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';

describe('PokemonIV', () => {
    describe('constructor', () => {
        test('with string parameter', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });

            expect(iv.pokemonName).toBe('Pikachu');
            expect(iv.level).toBe(30);
            expect(iv.skillLevel).toBe(2);
            expect(iv.ribbon).toBe(0);
        });

        test('with minimal object parameter', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });

            expect(iv.pokemonName).toBe('Pikachu');
            expect(iv.level).toBe(30);
            expect(iv.skillLevel).toBe(2);
            expect(iv.ribbon).toBe(0);
        });

        test('with full object parameter', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 50,
                skillLevel: 3,
                ingredient: 'ABB',
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                }),
                nature: new Nature('Adamant'),
                ribbon: 2,
            });

            expect(iv.pokemonName).toBe('Pikachu');
            expect(iv.level).toBe(50);
            expect(iv.skillLevel).toBe(3);
            expect(iv.ingredient).toBe('ABB');
            expect(iv.subSkills.lv10?.name).toBe('Berry Finding S');
            expect(iv.nature.name).toBe('Adamant');
            expect(iv.ribbon).toBe(2);
        });

        test('normalization happens automatically', () => {
            const iv = new PokemonIv({
                pokemonName: 'Feraligatr',
                ingredient: 'ABC', // Feraligatr doesn't have ing3
            });

            expect(iv.ingredient).toBe('ABA'); // 'C' replaced with 'A'
        });

        test('overrides skillRate and ingRate when specified', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                skillRate: 0.5,
                ingRate: 0.3,
            });

            expect(iv.pokemon.skillRate).toBe(0.5);
            expect(iv.pokemon.ingRate).toBe(0.3);
        });

        test('uses default skillRate and ingRate when not specified', () => {
            const iv1 = new PokemonIv({ pokemonName: 'Pikachu' });
            const iv2 = new PokemonIv({ pokemonName: 'Pikachu' });

            // Both should have the same default values from pokemon data
            expect(iv1.pokemon.skillRate).toBe(iv2.pokemon.skillRate);
            expect(iv1.pokemon.ingRate).toBe(iv2.pokemon.ingRate);
            expect(iv1.pokemon.skillRate).toBeGreaterThan(0);
            expect(iv1.pokemon.ingRate).toBeGreaterThan(0);
        });
    });

    describe('clone', () => {
        test('same pokemon', () => {
            const iv = new PokemonIv({ pokemonName: 'Bulbasaur' });
            expect(iv.skillLevel).toBe(1);

            const iv2 = iv.clone({skillLevel: 2});
            expect(iv2.skillLevel).toBe(2);
            expect(iv).not.toBe(iv2);
        });

        test('clone() verifies immutability - original unchanged', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 30,
                skillLevel: 3,
                ribbon: 2,
            });

            const cloned = iv.clone({ level: 50, ribbon: 4 });

            // Original should be unchanged
            expect(iv.level).toBe(30);
            expect(iv.skillLevel).toBe(3);
            expect(iv.ribbon).toBe(2);

            // Cloned should have new values
            expect(cloned.level).toBe(50);
            expect(cloned.skillLevel).toBe(3);
            expect(cloned.ribbon).toBe(4);
        });

        test('evolved pokemon (normal)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                skillLevel: 2,
            });
            expect(iv.skillLevel).toBe(2);

            const iv2 = iv.clone({pokemonName: 'Venusaur'});
            expect(iv2.skillLevel).toBe(4);
        });

        test('evolved pokemon (max skill level 7)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                skillLevel: 5,
            });

            const iv2 = iv.clone({pokemonName: 'Venusaur'});
            expect(iv2.skillLevel).toBe(7);
        });

        test('reverse evolve underflow', () => {
            const iv = new PokemonIv({
                pokemonName: 'Venusaur',
                skillLevel: 2,
            });

            const iv2 = iv.clone({pokemonName: 'Bulbasaur'});
            expect(iv2.skillLevel).toBe(1);
        });

        test('evolved to toxtricity (Amped)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                nature: new Nature("Relaxed"),
            });

            const iv2 = iv.clone({pokemonName: 'Toxtricity (Amped)'});
            expect(iv2.nature.name).toBe("Impish");
        });

        test('evolved to toxtricity (Low Key)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Toxel',
                nature: new Nature("Impish"),
            });

            const iv2 = iv.clone({pokemonName: 'Toxtricity (Low Key)'});
            expect(iv2.nature.name).toBe("Bold");
        });
    });

    describe('rate', () => {
        test('ingredientRate is cached', () => {
            const iv = new PokemonIv({pokemonName: 'Magnezone', level: 35});
            const rate1 = iv.ingredientRate;
            const rate2 = iv.ingredientRate;
            expect(rate1).toBe(rate2);
        });

        test('skillRate is cached', () => {
            const iv = new PokemonIv({pokemonName: 'Magnezone', level: 35});
            const rate1 = iv.skillRate;
            const rate2 = iv.skillRate;
            expect(rate1).toBe(rate2);
        });
    });

    test('changeLevel', () => {
        const iv = new PokemonIv({
            pokemonName: 'Bulbasaur',
            level: 15,
            skillLevel: 3,
            subSkills: new SubSkillList({
                lv10: new SubSkill('Skill Level Up M'),
                lv25: new SubSkill('Skill Level Up S'),
            }),
        });

        expect(iv.changeLevel(9).skillLevel).toBe(1);
        expect(iv.changeLevel(25).skillLevel).toBe(4);
    });

    describe('changeSubSkills', () => {
        test('removing skill level up sub-skills decreases skill level', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 30,
                skillLevel: 5,
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Skill Level Up M'),  // +2
                    lv25: new SubSkill('Skill Level Up S'),  // +1
                }),
            });

            // Skill level should decrease by 2
            const newSubskills = new SubSkillList({
                lv10: new SubSkill('Skill Level Up S'),  // +1
            });
            const result = iv.changeSubSkills(newSubskills);
            expect(result.skillLevel).toBe(3);
        });

        test('skill level overflow is handled', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 30,
                skillLevel: 6,
            });

            // Skill level should be at most 7
            // because max skill level of 'Ingredient Magnet S' is 7
            const newSubSkills = new SubSkillList({
                lv10: new SubSkill('Skill Level Up M'),  // +2
            });
            const result = iv.changeSubSkills(newSubSkills);
            expect(result.skillLevel).toBe(7);
        });
    });

    describe('toProps', () => {
        test('extracts all properties correctly for normal pokemon', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                level: 50,
                skillLevel: 5,
                ingredient: 'ABB',
                ribbon: 3,
                nature: new Nature('Adamant'),
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                    lv25: new SubSkill('Helping Speed M'),
                }),
            });

            const params = iv.toProps();

            expect(params.pokemonName).toBe('Bulbasaur');
            expect(params.level).toBe(50);
            expect(params.skillLevel).toBe(5);
            expect(params.ingredient).toBe('ABB');
            expect(params.ribbon).toBe(3);
            expect(params.nature).toBe(iv.nature);
            expect(params.subSkills).toBe(iv.subSkills);
            expect(params.skillRate).toBe(iv.pokemon.skillRate);
            expect(params.ingRate).toBe(iv.pokemon.ingRate);
        });

        test('extracts mythical pokemon ingredients correctly', () => {
            const iv = new PokemonIv({
                pokemonName: 'Darkrai',
                mythIng1: 'coffee',
                mythIng2: 'apple',
                mythIng3: 'soy',
            });

            const params = iv.toProps();

            expect(params.mythIng1).toBe('coffee');
            expect(params.mythIng2).toBe('apple');
            expect(params.mythIng3).toBe('soy');
        });

        test('extracts all properties for pokemon with form', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu (Halloween)',
                level: 75,
                skillLevel: 6,
                ribbon: 4,
            });

            const params = iv.toProps();

            expect(params.pokemonName).toBe('Pikachu (Halloween)');
            expect(params.level).toBe(75);
            expect(params.skillLevel).toBe(6);
            expect(params.ribbon).toBe(4);
        });

        test('returns same subSkills reference (not a clone)', () => {
            const iv = new PokemonIv({ pokemonName: 'Bulbasaur' });
            const params = iv.toProps();

            // Should be the same object reference
            expect(params.subSkills).toBe(iv.subSkills);
        });

        test('returns same nature reference', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                nature: new Nature('Jolly'),
            });
            const params = iv.toProps();

            // Should be the same object reference
            expect(params.nature).toBe(iv.nature);
        });
    });

    describe('decendants', () => {
        test('Bulbasaur', () => {
            const iv = new PokemonIv({ pokemonName: 'Bulbasaur' });

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
            const ivAmped = new PokemonIv({
                pokemonName: 'Toxel',
                nature: new Nature("Docile"),
            });
            const ampedDecendants = ivAmped.decendants;
            expect(ampedDecendants.length).toBe(1);
            expect(ampedDecendants[0].name).toBe('Toxtricity (Amped)');

            const ivLow = new PokemonIv({
                pokemonName: 'Toxel',
                nature: new Nature("Serious"),
            });
            const lowDecendants = ivLow.decendants;
            expect(lowDecendants.length).toBe(1);
            expect(lowDecendants[0].name).toBe('Toxtricity (Low Key)');
        });
    });

    describe('serialize', () => {
        test('empty Bulbasaur', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                skillLevel: 3,
            });
            expect(iv.serialize()).toBe('EQCApwj5-38f');

            const ret = PokemonIv.deserialize('EQCApwj5-38f');
            compareIv(iv, ret);
        });

        test('set Bewear parameter', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bewear',
                level: 24,
                nature: new Nature("Impish"),
                skillLevel: 5,
                subSkills: new SubSkillList({
                    lv10: new SubSkill("Berry Finding S"),
                    lv25: new SubSkill("Helping Speed S"),
                    lv50: new SubSkill("Ingredient Finder M"),
                    lv75: new SubSkill("Inventory Up L"),
                    lv100: new SubSkill("Skill Level Up S"),
                }),
            });
            expect(iv.serialize()).toBe('gS8AppABDSUL');

            const ret = PokemonIv.deserialize('gS8AppABDSUL');
            compareIv(iv, ret);
        });

        test('Pikachu (Halloween)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu (Halloween)',
                skillLevel: 3,
            });
            expect(iv.serialize()).toBe('kQGBpwj5-38f');
            expect(iv.form).toBe(1);
            expect(iv.idForm).toBe(25 + 0x1000);

            const ret = PokemonIv.deserialize('kQGBpwj5-38f');
            compareIv(iv, ret);
        });

        test('ribbon', () => {
            const iv = new PokemonIv({
                pokemonName: 'Bulbasaur',
                ribbon: 4,
            });
            expect(iv.serialize()).toBe('EQCApwD5-3+f');

            const ret = PokemonIv.deserialize('EQCApwD5-3+f');
            compareIv(iv, ret);
        });

        test('idForm', () => {
            const iv = new PokemonIv({ pokemonName: 'Vulpix (Alola)' });
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
            const iv = new PokemonIv({
                pokemonName: 'Darkrai',
                mythIng1: "coffee",
                mythIng2: "apple",
                mythIng3: "unknown",
            });

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("apple");
            expect(ret.mythIng3).toBe("unknown");
        });

        test('mythical ingredients (coffee/apple/soy)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Darkrai',
                mythIng1: "coffee",
                mythIng2: "apple",
                mythIng3: "soy",
            });

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("apple");
            expect(ret.mythIng3).toBe("soy");
        });

        test('mythical ingredients (coffee/coffee/coffee)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Darkrai',
                mythIng1: "coffee",
                mythIng2: "coffee",
                mythIng3: "coffee",
            });

            const ret = PokemonIv.deserialize(iv.serialize());
            expect(ret.mythIng1).toBe("coffee");
            expect(ret.mythIng2).toBe("coffee");
            expect(ret.mythIng3).toBe("coffee");
        });

        test('Toxtricity (Amped)', () => {
            const iv = new PokemonIv({ pokemonName: 'Toxtricity (Amped)' });
            expect(iv.serialize()).toBe('ETWFp0T4-38f');

            const ret = PokemonIv.deserialize('ETWFp0T4-38f');
            compareIv(iv, ret);
        });

        test('Toxtricity (Low Key)', () => {
            const iv = new PokemonIv({ pokemonName: 'Toxtricity (Low Key)' });
            expect(iv.serialize()).toBe('ETWGpwT5-38f');

            const ret = PokemonIv.deserialize('ETWGpwT5-38f');
            compareIv(iv, ret);
        });
    });

    describe('normalize (static)', () => {
        test('throws error when pokemonName is missing', () => {
            expect(() => PokemonIv.normalize({}))
                .toThrow('pokemonName is required');
        });

        test('throws error when pokemonName is invalid', () => {
            expect(() => PokemonIv.normalize({ pokemonName: 'InvalidPokemon' }))
                .toThrow('Unknown name: InvalidPokemon');
        });

        test('applies default values with minimal params (pokemonName only)', () => {
            const result = PokemonIv.normalize({ pokemonName: 'Bulbasaur' });

            expect(result.pokemonName).toBe('Bulbasaur');
            expect(result.level).toBe(30);
            expect(result.skillLevel).toBe(1); // evolutionCount=0, so max(0+1,1)=1
            expect(result.ingredient).toBe('ABC'); // has ing3
            expect(result.nature.name).toBe('Serious'); // default nature
            expect(result.ribbon).toBe(0);
            expect(result.mythIng1).toBe('unknown');
            expect(result.mythIng2).toBe('unknown');
            expect(result.mythIng3).toBe('unknown');
            expect(result.subSkills).toBeInstanceOf(SubSkillList);
        });

        test('applies default ingredient "ABB" for pokemon without ing3', () => {
            const result = PokemonIv.normalize({ pokemonName: 'Feraligatr' });

            // Feraligatr doesn't have ing3
            expect(result.ingredient).toBe('ABB');
        });

        test('preserves provided values (partial params)', () => {
            const result = PokemonIv.normalize({
                pokemonName: 'Bulbasaur',
                level: 50,
                skillLevel: 5,
                ingredient: 'ABB',
                subSkills: new SubSkillList({
                    lv10: new SubSkill('Berry Finding S'),
                }),
                nature: new Nature('Adamant'),
                ribbon: 3,
            });

            expect(result.pokemonName).toBe('Bulbasaur');
            expect(result.level).toBe(50);
            expect(result.skillLevel).toBe(5);
            expect(result.ingredient).toBe('ABB');
            expect(result.subSkills.lv10?.name).toBe('Berry Finding S');
            expect(result.nature?.name).toBe('Adamant');
            expect(result.ribbon).toBe(3);
        });

        test('clamps skillLevel to valid range', () => {
            // Bulbasaur has "Ingredient Magnet S" skill, max level is 7
            const result1 = PokemonIv.normalize({
                pokemonName: 'Bulbasaur',
                skillLevel: 999,
            });
            expect(result1.skillLevel).toBe(7);

            const result2 = PokemonIv.normalize({
                pokemonName: 'Bulbasaur',
                skillLevel: -5,
            });

            expect(result2.skillLevel).toBe(1);
        });

        test('handles mythical pokemon ingredient defaults', () => {
            const result = PokemonIv.normalize({
                pokemonName: 'Darkrai',
            });

            // mythIng1 should default to "sausage" for mythical pokemon
            expect(result.mythIng1).toBe('sausage');
            expect(result.mythIng2).toBe('unknown');
            expect(result.mythIng3).toBe('unknown');
        });

        test('preserves mythical pokemon ingredients when provided', () => {
            const result = PokemonIv.normalize({
                pokemonName: 'Darkrai',
                mythIng1: 'coffee',
                mythIng2: 'apple',
                mythIng3: 'soy',
            });

            expect(result.mythIng1).toBe('coffee');
            expect(result.mythIng2).toBe('apple');
            expect(result.mythIng3).toBe('soy');
        });

        test('normalizes nature for Toxtricity (Amped)', () => {
            // Amped: default nature is Hardy
            const result1 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Amped)',
            });
            expect(result1.nature.name).toBe('Hardy');

            // Amped: Serious -> Hardy
            const result2 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Amped)',
                nature: new Nature('Serious'),
            });
            expect(result2.nature.isAmped).toBe(true);
            expect(result2.nature.name).toBe('Hardy');

            // Amped: Lonely -> Adamant
            const result3 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Amped)',
                nature: new Nature('Lonely'),
            });
            expect(result3.nature.isAmped).toBe(true);
            expect(result3.nature.name).toBe('Adamant');

            // Amped: keep valid Amped nature
            const result4 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Amped)',
                nature: new Nature('Adamant'),
            });
            expect(result4.nature.name).toBe('Adamant');
        });

        test('normalizes nature for Toxtricity (Low Key)', () => {
            // Low Key: default nature is Serious
            const result1 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Low Key)',
            });
            expect(result1.nature.name).toBe('Serious');

            // Low Key: Hardy -> Bashful
            const result2 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Low Key)',
                nature: new Nature('Hardy'),
            });
            expect(result2.nature.isLowKey).toBe(true);
            expect(result2.nature.name).toBe('Bashful');

            // Low Key: Adamant -> Lonely
            const result3 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Low Key)',
                nature: new Nature('Adamant'),
            });
            expect(result3.nature.isLowKey).toBe(true);
            expect(result3.nature.name).toBe('Lonely');

            // Low Key: keep valid Low Key nature
            const result4 = PokemonIv.normalize({
                pokemonName: 'Toxtricity (Low Key)',
                nature: new Nature('Lonely'),
            });
            expect(result4.nature.name).toBe('Lonely');
        });

        test('handles pokemon with forms correctly', () => {
            const result = PokemonIv.normalize({
                pokemonName: 'Pikachu (Halloween)',
                level: 75,
            });

            expect(result.pokemonName).toBe('Pikachu (Halloween)');
            expect(result.level).toBe(75);
        });

        test('preserves skillRate and ingRate when provided', () => {
            const result = PokemonIv.normalize({
                pokemonName: 'Bulbasaur',
                skillRate: 0.5,
                ingRate: 0.3,
            });

            expect(result.skillRate).toBe(0.5);
            expect(result.ingRate).toBe(0.3);
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
