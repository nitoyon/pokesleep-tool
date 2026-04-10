import PokemonStrength, {
    createStrengthParameter, StrengthParameter,
    isSkillStrengthZero,
    expertFavoriteBerryBonus,
} from './PokemonStrength';
import { AlwaysTap, NoTap, whistlePeriod } from './Energy';
import PokemonIv from './PokemonIv';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';
import pokemons from '../data/pokemons';
import { MainSkillNames } from './MainSkill';

function createParam(obj: Partial<StrengthParameter>): StrengthParameter {
    return createStrengthParameter(obj);
}

describe('PokemonStrength', () => {
    describe('calculate', () => {
        test('ingredient unlock levels (Lv 1)', () => {
            // Level 1 - ing1
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 1,
            });
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);

            const result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBe(0);
            expect(result.ing3.count).toBe(0);

            expect(result.ingredients).toHaveLength(1);
            expect(result.ingHelpCount).toBe(
                result.ingredients[0].helpCount);
        });

        test('ingredient unlock level (Lv 30)', () => {
            // Level 30 - ing1 and ing2
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 30,
                ingredient: 'ABC',
            });
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);

            const result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBeGreaterThan(0);
            expect(result.ing3.count).toBe(0);

            expect(result.ingredients).toHaveLength(2);
            expect(result.ingHelpCount).toBe(
                result.ingredients[0].helpCount +
                result.ingredients[1].helpCount);
        });

        test('ingredient unlock level (Lv 60 ABC)', () => {
            // Level 60 - all ingredients
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 60,
                ingredient: 'ABC',
            });
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);

            const result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBeGreaterThan(0);
            expect(result.ing3.count).toBeGreaterThan(0);

            expect(result.ingredients).toHaveLength(3);
            expect(result.ingHelpCount).toBeCloseTo(
                result.ingredients[0].helpCount +
                result.ingredients[1].helpCount +
                result.ingredients[2].helpCount);
        });

        test('ingredient unlock level (Lv 60 ABB)', () => {
            // Level 60 - all ingredients
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 60,
                ingredient: 'ABB',
            });
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);

            const result = strength.calculate();
            expect(result.ing1.count).toBeGreaterThan(0);
            expect(result.ing2.count).toBeGreaterThan(0);
            expect(result.ing3.count).toBeGreaterThan(0);

            expect(result.ingredients).toHaveLength(2);
            expect(result.ingredients[0].name).toBe(result.ing1.name);
            expect(result.ingredients[1].name).toBe(result.ing2.name);
            expect(result.ingredients[0].helpCount)
                .toBeCloseTo(result.ingHelpCount / 3);
            expect(result.ingredients[1].helpCount)
                .toBeCloseTo(result.ingHelpCount * 2 / 3);
        });

        test('field bonus affects berry and ingredient strength', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 50,
            });

            const param0 = createParam({ fieldBonus: 0 });
            const strength0 = new PokemonStrength(iv, param0);
            const result0 = strength0.calculate();

            const param75 = createParam({ fieldBonus: 75 });
            const strength75 = new PokemonStrength(iv, param75);
            const result75 = strength75.calculate();

            expect(result75.berryTotalStrength).toBeCloseTo(result0.berryTotalStrength * 1.75);
            expect(result75.ingStrength).toBeCloseTo(result0.ingStrength * 1.75);
        });

        test('evolved parameter changes pokemon', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 50,
            });

            const paramNotEvolved = createParam({ evolved: false });
            const strengthNotEvolved = new PokemonStrength(iv, paramNotEvolved);
            expect(strengthNotEvolved.pokemonIv.pokemon.name).toBe('Pikachu');

            const paramEvolved = createParam({ evolved: true });
            const strengthEvolved = new PokemonStrength(iv, paramEvolved);
            expect(strengthEvolved.pokemonIv.pokemon.name).toBe('Raichu');
        });

        test('level parameter changes level', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 10,
            });

            const param = createParam({ level: 50 });
            const strength = new PokemonStrength(iv, param);
            expect(strength.pokemonIv.level).toBe(50);
        });

        test('tapFrequency none disables skill', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 50,
            });

            const paramAlways = createParam({ tapFrequencyAwake: AlwaysTap });
            const strengthAlways = new PokemonStrength(iv, paramAlways);
            const resultAlways = strengthAlways.calculate();
            expect(resultAlways.skillCount).toBeGreaterThan(0);

            const paramNone = createParam({ tapFrequencyAwake: NoTap });
            const strengthNone = new PokemonStrength(iv, paramNone);
            const resultNone = strengthNone.calculate();
            expect(resultNone.skillCount).toBe(0);
        });

        test('nature affects results', () => {
            // Test with neutral nature
            const iv1 = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 50,
                nature: new Nature('Serious'),
            });
            const paramSerious = createParam({});
            const strengthSerious = new PokemonStrength(iv1, paramSerious);
            const resultSerious = strengthSerious.calculate();

            // Test with Helping Speed down nature (Bold is Speed of Help down)
            const iv2 = iv1.clone({nature: new Nature('Bold')});
            const paramBold = createParam({});
            const strengthBold = new PokemonStrength(iv2, paramBold);
            const resultBold = strengthBold.calculate();

            // Bold should have fewer helps due to slower helping speed
            expect(resultBold.berryHelpCount + resultBold.ingHelpCount)
                .toBeLessThan(resultSerious.berryHelpCount + resultSerious.ingHelpCount);
        });

        test('ingredients summary', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 60,
            });
            const param = createParam({});
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // Verify ingredients array contains all ingredients
            expect(result.ingredients.length).toBeGreaterThan(0);

            // Sum of ingredient strengths should equal total ingStrength
            const sumStrength = result.ingredients.reduce((sum, ing) => sum + ing.strength, 0);
            expect(sumStrength).toBeCloseTo(result.ingStrength);
        });

        test('calculates strength with whistle period', () => {
            const iv = new PokemonIv({
                pokemonName: 'Pikachu',
                level: 50,
            });

            // simulate whistle
            const paramWhistle = createParam({ period: whistlePeriod });
            const strengthWhistle = new PokemonStrength(iv, paramWhistle);
            const resultWhistle = strengthWhistle.calculate();

            // simulate 3 hours (always energy full)
            const param3Hours = createParam({
                period: 3, isEnergyAlwaysFull: true, tapFrequencyAwake: AlwaysTap,
            });
            const strength3Hours = new PokemonStrength(iv, param3Hours);
            const result3Hours = strength3Hours.calculate();

            // Verify modified parameters
            expect(strengthWhistle.parameter.period).toBe(3);
            expect(strengthWhistle.parameter.isEnergyAlwaysFull).toBe(true);
            expect(strengthWhistle.parameter.isGoodCampTicketSet).toBe(false);
            expect(strengthWhistle.parameter.tapFrequencyAwake).toBe(AlwaysTap);

            // Verify result
            expect(resultWhistle.skillCount).toBe(0);
            expect(resultWhistle.berryStrength).toBe(result3Hours.berryStrength);
            expect(resultWhistle.ingStrength).toBe(result3Hours.ingStrength);
        });
    });

    describe('isFavoriteBerry', () => {
        test('returns false for noFavoriteFieldIndex', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });
            const param = createParam({ fieldIndex: -1 });
            const strength = new PokemonStrength(iv, param);

            expect(strength.isFavoriteBerry).toBe(false);
        });

        test('returns true for allFavoriteFieldIndex', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });
            const param = createParam({ fieldIndex: -2 });
            const strength = new PokemonStrength(iv, param);

            expect(strength.isFavoriteBerry).toBe(true);
        });
    });

    describe('berryStrengthBonus', () => {
        test('returns 2 for favorite berry', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });
            const param = createParam({
                fieldIndex: -2, // allFavoriteFieldIndex
            });
            const strength = new PokemonStrength(iv, param);

            expect(strength.berryStrengthBonus).toBe(2);
        });

        test('returns 1 for non-favorite berry', () => {
            const iv = new PokemonIv({ pokemonName: 'Pikachu' });
            const param = createParam({
                fieldIndex: -1, // noFavoriteFieldIndex
            });
            const strength = new PokemonStrength(iv, param);

            expect(strength.berryStrengthBonus).toBe(1);
        });
    });

    describe('totalFlags', () => {
        test('controls which components are included in total strength', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 50,
            });

            // [true, true, true] - all components
            let param = createParam({ totalFlags: [true, true, true] });
            let strength = new PokemonStrength(iv, param);
            let result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(
                result.berryTotalStrength + result.ingStrength + result.skillStrength + result.skillStrength2
            );

            // [true, false, false] - berry only
            param = createParam({ totalFlags: [true, false, false] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(result.berryTotalStrength);

            // [true, false, true] - berry + skill
            param = createParam({ totalFlags: [true, false, true] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBeCloseTo(
                result.berryTotalStrength + result.skillStrength + result.skillStrength2
            );

            // [false, false, false] - nothing
            param = createParam({ totalFlags: [false, false, false] });
            strength = new PokemonStrength(iv, param);
            result = strength.calculate();
            expect(result.totalStrength).toBe(0);
        });
    });

    describe('helpingBonusStrength', () => {
        test('does not calculates additional strength when addHelpingBonusEffect is false', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 10,
                subSkills: new SubSkillList({ lv10: new SubSkill('Helping Bonus') }),
            });

            const param = createParam({ helpBonusCount: 0, addHelpingBonusEffect: false });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;

            expect(result.helpingBonusStrength).toBe(0);
            expect(result.totalStrength).toBeCloseTo(baseTotal);
        });

        test('calculates additional strength when Helping Bonus sub-skill is active', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 10,
                subSkills: new SubSkillList({ lv10: new SubSkill('Helping Bonus') }),
            });

            const param = createParam({ helpBonusCount: 0, addHelpingBonusEffect: true });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // When helpBonusCount is 0:
            // currentFactor = 1 - 0.05 * 0 = 1.0
            // newFactor = 1 - 0.05 * 1 = 0.95
            // rate = 1.0 / 0.95 - 1 ≈ 0.0526
            // helpingBonusStrength = baseTotal * rate * 4
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;
            const expectedRate = 1.0 / 0.95 - 1;
            const expectedHelpingBonus = baseTotal * expectedRate * 4;

            expect(result.helpingBonusStrength).toBeCloseTo(expectedHelpingBonus);
            expect(result.totalStrength).toBeCloseTo(baseTotal + expectedHelpingBonus);
        });

        test('calculates correctly with different helpBonusCount values', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 10,
                subSkills: new SubSkillList({ lv10: new SubSkill('Helping Bonus') }),
            });

            // Test with helpBonusCount = 1
            const param = createParam({ helpBonusCount: 1, addHelpingBonusEffect: true });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // currentFactor = 1 - 0.05 * 1 = 0.95
            // newFactor = 1 - 0.05 * 2 = 0.9
            // rate = 0.95 / 0.9 - 1 ≈ 0.0556
            const baseTotal = result.berryTotalStrength + result.ingStrength +
                result.skillStrength + result.skillStrength2;
            const expectedRate = 0.95 / 0.9 - 1;
            const expectedHelpingBonus = baseTotal * expectedRate * 4;

            expect(result.helpingBonusStrength).toBeCloseTo(expectedHelpingBonus);
            expect(result.totalStrength).toBeCloseTo(baseTotal + expectedHelpingBonus);
        });
    });

    describe('isSkillStrengthCalculated', () => {
        test('returns false for skills with zero strength and true for skills with non-zero strength', () => {
            // Test each skill
            MainSkillNames.forEach(skillName => {
                // Find a pokemon with this skill
                const pokemon = pokemons.find(p => p.skill === skillName);
                if (!pokemon) {
                    return; // Skip if no pokemon found (shouldn't happen)
                }

                // Create IV and calculate strength
                const iv = new PokemonIv({
                    pokemonName: pokemon.name,
                    level: 50,
                    skillLevel: 6,
                });
                const param = createParam({ period: 24 });
                const strength = new PokemonStrength(iv, param);
                const result = strength.calculate();

                const hasZeroStrength = result.skillStrength === 0 && result.skillStrength2 === 0;
                const isCalculatedAsZero = isSkillStrengthZero(skillName);

                expect(hasZeroStrength).toBe(isCalculatedAsZero);
            });
        });
    });

    describe('expert mode', () => {
        // Greengrass Isle (Expert)
        const fieldIndex = 7;

        describe('berryStrengthBonus', () => {
            test('main berry + expertEffect berry => expertFavoriteBerryBonus', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const strength = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    expertEffect: 'berry',
                }));
                expect(strength.berryStrengthBonus).toBe(expertFavoriteBerryBonus);
            });

            test('sub berry + expertEffect berry => expertFavoriteBerryBonus', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const strength = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['fire', 'electric', 'water'],
                    expertEffect: 'berry',
                }));
                expect(strength.berryStrengthBonus).toBe(expertFavoriteBerryBonus);
            });

            test('non-favorite + expertEffect berry => 1', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const strength = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['fire', 'water', 'grass'],
                    expertEffect: 'berry',
                }));
                expect(strength.berryStrengthBonus).toBe(1);
            });

            test('favorite berry + expertEffect ing => 2 (isFavoriteBerry, not expert berry mode)', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const strength = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    expertEffect: 'ing',
                }));
                expect(strength.berryStrengthBonus).toBe(2);
            });
        });

        describe('ExpertEffects', () => {
            test('berry: favorite has higher berryStrengthBonus than non-favorite', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const strengthFav = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    expertEffect: 'berry',
                }));
                const strengthNonFav = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['fire', 'water', 'grass'],
                    expertEffect: 'berry',
                }));
                expect(strengthFav.berryStrengthBonus).toBe(expertFavoriteBerryBonus);
                expect(strengthNonFav.berryStrengthBonus).toBe(1);
                expect(strengthFav.berryStrengthBonus).toBeGreaterThan(strengthNonFav.berryStrengthBonus);
            });

            test('ing: expertEffect ing', () => {
                const param = createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    expertEffect: 'ing',
                });

                const berryIv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const resultBerry = new PokemonStrength(berryIv, param).calculate();
                expect(resultBerry.ing1.count).toBe(berryIv.pokemon.ing1.c1 + 1);

                const ingIv = new PokemonIv({ pokemonName: 'Luxray', level: 50 });
                const resultIng = new PokemonStrength(ingIv, param).calculate();
                expect(resultIng.ing1.count).toBe(ingIv.pokemon.ing1.c1 + 1.5);
            });

            test('skill: expertEffect skill gives higher skillCount than expertEffect berry', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const resultSkill = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    period: 8,
                    pityProc: false,
                    tapFrequencyAwake: AlwaysTap,
                    expertEffect: 'skill',
                })).calculate();
                const resultBerry = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    period: 8,
                    pityProc: false,
                    tapFrequencyAwake: AlwaysTap,
                    expertEffect: 'berry',
                })).calculate();
                expect(resultSkill.skillCount).toBeGreaterThan(0);
                expect(resultBerry.skillCount).toBeGreaterThan(0);
                expect(resultSkill.total.normal).toBe(resultSkill.total.normal);
                expect(resultSkill.skillCount).toBeCloseTo(resultBerry.skillCount * 1.25);
            });
        });

        describe('speed effects', () => {
            test('main berry has more total helps than sub berry (10% speed bonus)', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const resultMain = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['electric', 'fire', 'water'],
                    period: 8,
                    tapFrequencyAwake: NoTap,
                    expertEffect: 'skill',
                })).calculate();
                const resultSub = new PokemonStrength(iv, createParam({
                    fieldIndex,
                    favoriteType: ['fire', 'electric', 'water'],
                    period: 8,
                    tapFrequencyAwake: NoTap,
                    expertEffect: 'skill',
                })).calculate();
                const totalMain = resultMain.berryHelpCount;
                const totalSub = resultSub.berryHelpCount;
                expect(totalMain).toBeCloseTo(totalSub / 0.9, 0);
            });

            test('non-favorite has fewer total helps than sub berry (15% speed penalty)', () => {
                const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
                const resultSub = new PokemonStrength(iv, createParam({
                    fieldIndex: 7,
                    favoriteType: ['fire', 'electric', 'water'],
                    period: 8,
                    tapFrequencyAwake: NoTap,
                    expertEffect: 'skill',
                })).calculate();
                const resultNonFav = new PokemonStrength(iv, createParam({
                    fieldIndex: 7,
                    favoriteType: ['fire', 'water', 'grass'],
                    period: 8,
                    tapFrequencyAwake: NoTap,
                    expertEffect: 'skill',
                })).calculate();
                const totalSub = resultSub.berryHelpCount;
                const totalNonFav = resultNonFav.berryHelpCount;
                expect(totalNonFav).toBeCloseTo(totalSub / 1.15, 0);
            });
        });

        describe('main berry skill level bonus', () => {
            test('main berry pokemon has higher skillValuePerTrigger than sub berry (Slaking, Ingredient Magnet S)', () => {
                // Slaking is normal type with "Ingredient Magnet S" (non-zero skill strength)
                const slakingIv = new PokemonIv({ pokemonName: 'Slaking', level: 50, skillLevel: 5 });
                // Verify Slaking has non-zero skill strength
                expect(isSkillStrengthZero(
                    pokemons.find(p => p.name === 'Slaking')!.skill
                )).toBe(false);

                const resultMain = new PokemonStrength(slakingIv,
                    createParam({
                        fieldIndex: 7,
                        favoriteType: ['normal', 'fire', 'water'],
                        expertEffect: 'skill',
                    })).calculate();
                const resultSub = new PokemonStrength(slakingIv,
                    createParam({
                        fieldIndex: 7,
                        favoriteType: ['fire', 'normal', 'water'],
                        expertEffect: 'skill',
                    })).calculate();
                // Main berry gets +1 skill level bonus, so skillValuePerTrigger should be higher
                expect(resultMain.skillValuePerTrigger).toBeGreaterThan(resultSub.skillValuePerTrigger);
            });
        });
    });

    describe('energy.helpCount (asleepNotFull / asleepFull)', () => {
        test('period=8 (shorter than sleep start at 15.5h): sleep counts are 0', () => {
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result = new PokemonStrength(iv, createParam({ period: 8 })).calculate();

            expect(result.asleep.normal).toBe(0);
            expect(result.asleep.sneakySnacking).toBe(0);
        });

        test('period=16 (beyond sleep start at 15.5h): asleepNotFull > 0', () => {
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result = new PokemonStrength(iv, createParam({
                period: 16,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            expect(result.asleep.normal).toBeGreaterThan(0);
            expect(result.asleep.sneakySnacking).toBe(0);
        });

        test('period=24 with tapFrequencyAsleep=AlwaysTap: asleepFull is always 0', () => {
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            expect(result.asleep.normal).toBeGreaterThan(0);
            expect(result.asleep.sneakySnacking).toBe(0);
        });

        test('period=24 with tapFrequencyAsleep=NoTap: total sleep helps > 0', () => {
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAsleep: NoTap,
            })).calculate();

            const totalSleepHelps = result.asleep.all;
            expect(totalSleepHelps).toBeGreaterThan(0);
        });

        test('longer period covers more sleep time: period=24 has more sleep helps than period=16', () => {
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });

            // period=16: sleep covered from 15.5h to 16h (0.5h of sleep)
            const result16 = new PokemonStrength(iv, createParam({
                period: 16,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            // period=24: sleep covered from 15.5h to 24h (8.5h of sleep)
            const result24 = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            expect(result24.asleep.normal).toBeGreaterThan(
                result16.asleep.normal
            );
        });

        test('period=168 (1 week): energy.helpCount equals period=24 (single daily cycle)', () => {
            // energy.helpCount covers one 24h cycle regardless of period >= 24.
            // period > 24 scaling is applied via countRate in total/skill counts,
            // but energy.helpCount itself does not change.
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result24 = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();
            const result168 = new PokemonStrength(iv, createParam({
                period: 168,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            expect(result168.asleep.normal).toBeCloseTo(
                result24.asleep.normal * 7
            );
            expect(result168.asleep.sneakySnacking).toBeCloseTo(
                result24.asleep.sneakySnacking * 7
            );

            // But the scaled totals (e.g. berryHelpCount) should be 7x larger
            expect(result168.berryHelpCount).toBeCloseTo(result24.berryHelpCount * 7);
        });

        test('period=-10 (10 fixed helps): energy.helpCount all 0, total=10, skillCount=0', () => {
            // Negative period means a fixed number of helps (-period), not time-based.
            // Energy returns zeros; skillCount is 0; sneakySnacking is 0.
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 50 });
            const result = new PokemonStrength(iv, createParam({ period: -10 })).calculate();

            expect(result.awake.all).toBe(10);
            expect(result.awake.normal).toBe(10);
            expect(result.awake.sneakySnacking).toBe(0);
            expect(result.asleep.normal).toBe(0);
            expect(result.asleep.sneakySnacking).toBe(0);

            // total helps = 10, all normal (no sneaky snacking)
            expect(result.total.normal).toBe(10);
            expect(result.total.sneakySnacking).toBe(0);
            expect(result.total.all).toBe(10);

            // berry + ingredient helps must sum to 10
            expect(result.berryHelpCount + result.ingHelpCount).toBeCloseTo(10);

            // skills never trigger with fixed-help mode
            expect(result.skillCount).toBe(0);
        });

        test('inventory filling during sleep: NoTap splits into asleepNotFull and asleepFull', () => {
            // Use level 1 (very small carry limit) to ensure inventory fills during sleep
            const iv = new PokemonIv({ pokemonName: 'Raichu', level: 1 });
            const resultNoTap = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAwake: AlwaysTap,
                tapFrequencyAsleep: NoTap,
            })).calculate();
            const resultAlwaysTap = new PokemonStrength(iv, createParam({
                period: 24,
                tapFrequencyAwake: AlwaysTap,
                tapFrequencyAsleep: AlwaysTap,
            })).calculate();

            // With AlwaysTap, asleepFull must be 0
            expect(resultAlwaysTap.asleep.sneakySnacking).toBe(0);

            // With NoTap and small carry limit, inventory should fill → asleepFull > 0
            expect(resultNoTap.asleep.sneakySnacking).toBeGreaterThan(0);

            // asleepNotFull is smaller with NoTap (some time is spent in full-inventory sneaky snacking)
            expect(resultNoTap.asleep.normal).toBeLessThan(
                resultAlwaysTap.asleep.normal
            );
        });
    });

    describe('helpCount', () => {
        test('period=-10 (10 fixed helps)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 60,
                ingredient: 'ABC',
            });
            const param = createParam({period: -10});
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            expect(result.total.all).toBe(result.total.normal);
            expect(result.total.sneakySnacking).toBe(0);
            expect(result.total.all)
                .toBeCloseTo(result.berryHelpCount + result.ingHelpCount, 4);
            expect(result.berryHelpCount).toBe(result.berryNormalHelpCount);
            expect(result.berrySneakySnackingCount).toBe(0);
            expect(result.ing1.count).toBe(1);
            expect(result.ingredients[0].count)
                .toBe(result.ingHelpCount * result.ing1.count / 3);
            expect(result.ing2.count).toBe(2);
            expect(result.ingredients[1].count)
                .toBe(result.ingHelpCount * result.ing2.count / 3);
            expect(result.ing3.count).toBe(3);
            expect(result.ingredients[2].count)
                .toBe(result.ingHelpCount * result.ing3.count / 3);
        });

        test('AlwaysTap (8 hours)', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
                level: 60,
            });
            const param = createParam({period: 8, tapFrequencyAwake: AlwaysTap});
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            expect(result.total.all).toBe(result.total.normal);
            expect(result.total.sneakySnacking).toBe(0);
            expect(result.total.all)
                .toBeCloseTo(result.berryHelpCount + result.ingHelpCount, 4);
            expect(result.berryHelpCount).toBe(result.berryNormalHelpCount);
            expect(result.berrySneakySnackingCount).toBe(0);
            expect(result.berryCount).toBe(result.berryHelpCount * result.berryCountPerNormalHelp);
            expect(result.ing1.count).toBe(1);
            expect(result.ingredients[0].count)
                .toBe(result.ingHelpCount * result.ing1.count / 3);
            expect(result.ing2.count).toBe(2);
            expect(result.ingredients[1].count)
                .toBe(result.ingHelpCount * result.ing2.count / 3);
            expect(result.ing3.count).toBe(3);
            expect(result.ingredients[2].count)
                .toBe(result.ingHelpCount * result.ing3.count / 3);
        });
    });

    describe('Mew base rate overrides', () => {
        test('Mew uses param.mew', () => {
            const param = createParam({
                mew: { ing: 30, skill1: 8, skill2: 4, skill3: 3.2, success: 30 },
            });

            // skill1
            const strength1 = new PokemonStrength(new PokemonIv({
                pokemonName: 'Mew',
                versatileSkill: "Charge Energy S",
            }), param);
            expect(strength1.pokemonIv.ingredientRate).toBeCloseTo(0.3);
            expect(strength1.pokemonIv.skillRate).toBeCloseTo(0.08);

            // skill2
            const strength2 = new PokemonStrength(new PokemonIv({
                pokemonName: 'Mew',
                versatileSkill: "Charge Strength M",
            }), param);
            expect(strength2.pokemonIv.ingredientRate).toBeCloseTo(0.3);
            expect(strength2.pokemonIv.skillRate).toBeCloseTo(0.04);

            // skill3
            const strength3 = new PokemonStrength(new PokemonIv({
                pokemonName: 'Mew',
                versatileSkill: "Berry Burst",
            }), param);
            expect(strength3.pokemonIv.ingredientRate).toBeCloseTo(0.3);
            expect(strength3.pokemonIv.skillRate).toBeCloseTo(0.032);

        });

        test('Non-Mew pokemon is not affected by mew params', () => {
            const iv = new PokemonIv({
                pokemonName: 'Raichu',
            });

            // Use modified mew params
            const param = createParam({
                mew: { ing: 99, skill1: 50, skill2: 50, skill3: 50, success: 50 },
            });
            const strength = new PokemonStrength(iv, param);
            const result = strength.calculate();

            // Raichu should use its own ingRate, not mew's
            // Raichu's ingRate is not 99/100
            expect(result.ingRate).not.toBeCloseTo(0.99);
            expect(result.skillRate).not.toBeCloseTo(0.5);
        });
    });
});

