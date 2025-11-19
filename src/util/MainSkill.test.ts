import { describe, expect, test } from 'vitest';
import { getMaxSkillLevel, matchMainSkillName } from './MainSkill';
import Nature from './Nature';
import PokemonIv from './PokemonIv';
import pokemons from '../data/pokemons';

describe('MainSkill', () => {
    describe('getMaxSkillLevel', () => {
        test('returns 8 for Dream Shard Magnet S', () => {
            expect(getMaxSkillLevel('Dream Shard Magnet S')).toBe(8);
            expect(getMaxSkillLevel('Dream Shard Magnet S (Random)')).toBe(8);
        });

        test('returns 7 for skills with max level 7', () => {
            expect(getMaxSkillLevel('Ingredient Magnet S')).toBe(7);
            expect(getMaxSkillLevel('Charge Strength M')).toBe(7);
            expect(getMaxSkillLevel('Extra Helpful S')).toBe(7);
            expect(getMaxSkillLevel('Cooking Power-Up S')).toBe(7);
            expect(getMaxSkillLevel('Metronome')).toBe(7);
        });

        test('returns 6 for most skills', () => {
            expect(getMaxSkillLevel('Charge Energy S')).toBe(6);
            expect(getMaxSkillLevel('Energizing Cheer S')).toBe(6);
            expect(getMaxSkillLevel('Energy for Everyone S')).toBe(6);
            expect(getMaxSkillLevel('Helper Boost')).toBe(6);
            expect(getMaxSkillLevel('Tasty Chance S')).toBe(6);
            expect(getMaxSkillLevel('Berry Burst')).toBe(6);
        });
    });

    describe('matchMainSkillName', () => {
        test('matches skill name by prefix', () => {
            const pikachu = pokemons.find(x => x.name === 'Pikachu');
            if (pikachu === undefined) {
                throw new Error('Pikachu not found in pokemons data');
            }
            expect(matchMainSkillName(pikachu, 'Ingredient Magnet S')).toBe(false);
            expect(matchMainSkillName(pikachu, 'Charge Strength S')).toBe(true);
        });

        test('special case: Energy for Everyone S (Lunar Blessing) matches Berry Burst', () => {
            const cresselia = pokemons.find(x => x.name === 'Cresselia');
            if (cresselia === undefined) {
                throw new Error('Cresselia not found in pokemons data');
            }
            expect(matchMainSkillName(cresselia, 'Ingredient Magnet S')).toBe(false);
            expect(matchMainSkillName(cresselia, 'Berry Burst')).toBe(true);
            expect(matchMainSkillName(cresselia, 'Energy for Everyone S')).toBe(true);
        });

        test('special case: Cooking Power-Up S (Minus) matches Energizing Cheer S', () => {
            const minun = pokemons.find(x => x.name === 'Minun');
            if (minun === undefined) {
                throw new Error('Toxel not found in pokemons data');
            }

            expect(matchMainSkillName(minun, 'Energizing Cheer S')).toBe(true);
            expect(matchMainSkillName(minun, 'Cooking Power-Up S')).toBe(true);
        });

        test('special case: Ingredient Draw S (Super Luck) matches Dream Shard Magnet S', () => {
            const murkrow = pokemons.find(x => x.name === 'Murkrow');
            if (murkrow === undefined) {
                throw new Error('Murkrow not found in pokemons data');
            }

            expect(matchMainSkillName(murkrow, 'Dream Shard Magnet S')).toBe(true);
            expect(matchMainSkillName(murkrow, 'Ingredient Draw S')).toBe(true);
            expect(matchMainSkillName(murkrow, 'Energy for Everyone S')).toBe(false);
        });

        describe('Toxel evolution special cases', () => {
            test('Toxel with Amped nature evolves to Ingredient Magnet S (Plus)', () => {
                const toxel = pokemons.find(x => x.name === 'Toxel');
                if (toxel === undefined) {
                    throw new Error('Toxel not found in pokemons data');
                }
                const iv = new PokemonIv('Toxel');
                iv.nature = new Nature('Hardy'); // Amped nature

                expect(matchMainSkillName(toxel, 'Ingredient Magnet S', true, iv)).toBe(true);
                expect(matchMainSkillName(toxel, 'Cooking Power-Up S', true, iv)).toBe(false);
            });

            test('Toxel with Low Key nature evolves to Cooking Power-Up S (Minus)', () => {
                const toxel = pokemons.find(x => x.name === 'Toxel');
                if (toxel === undefined) {
                    throw new Error('Toxel not found in pokemons data');
                }
                const iv = new PokemonIv('Toxel');
                iv.nature = new Nature('Bold'); // Low Key nature

                expect(matchMainSkillName(toxel, 'Cooking Power-Up S', true, iv)).toBe(true);
                expect(matchMainSkillName(toxel, 'Ingredient Magnet S', true, iv)).toBe(false);
            });

            test('Non-Toxel pokemon ignores evolution parameters', () => {
                const pikachu = pokemons.find(x => x.name === 'Pikachu');
                if (pikachu === undefined) {
                    throw new Error('Pikachu not found in pokemons data');
                }
                const iv = new PokemonIv('Pikachu');
                iv.nature = new Nature('Hardy');

                // Should always match based on normal skill, regardless of evolved flag
                expect(matchMainSkillName(pikachu, 'Charge Strength S', true, iv)).toBe(true);
                expect(matchMainSkillName(pikachu, 'Ingredient Magnet S', true, iv)).toBe(false);
            });
        });
    });
});
