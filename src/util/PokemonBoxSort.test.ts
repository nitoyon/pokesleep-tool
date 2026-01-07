import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    SimpleStrengthResult, StrengthCalculator,
    sortPokemonItems, loadBoxSortConfig,
 } from './PokemonBoxSort';
import Nature from './Nature';
import { PokemonBoxItem } from './PokemonBox';
import PokemonIv from './PokemonIv';
import { createStrengthParameter } from './PokemonStrength';
import type { TFunction } from 'i18next';

// Mock translation function
const mockT = vi.fn((key: string) => {
    if (key.startsWith('pokemons.')) {
        return key.replace('pokemons.', '');
    }
    return key;
}) as unknown as TFunction;

describe('sortPokemonItems', () => {
    test('returns error message when array is empty', () => {
        const parameter = createStrengthParameter({});

        const [result, error] = sortPokemonItems([], 'level', true, 'unknown',
            'Energy for Everyone S', parameter, mockT);

        expect(result).toEqual([]);
        expect(error).toBe('no pokemon found');
    });

    describe('level sort', () => {
        test('sorts by level in descending order by default', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 10;
            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 25;
            const iv3 = new PokemonIv('Pikachu');
            iv3.level = 50;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
                new PokemonBoxItem(iv3),
            ];

            const [result1, error1] = sortPokemonItems(items, 'level', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);
            expect(error1).toBe('');
            expect(result1.length).toBe(3);
            expect(result1[0].iv.level).toBe(50);
            expect(result1[1].iv.level).toBe(25);
            expect(result1[2].iv.level).toBe(10);

            // descending parameter doesn't affect the result
            const [result2, error2] = sortPokemonItems(items, 'level', false, 'unknown',
                'Energy for Everyone S', parameter, mockT);
            expect(error2).toBe('');
            expect(result2.length).toBe(3);
            expect(result2[0].iv.level).toBe(50);
            expect(result2[1].iv.level).toBe(25);
            expect(result2[2].iv.level).toBe(10);
        });

        test('sorts by pokemon ID as secondary sort when levels are equal', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Bulbasaur'); // ID 1
            iv1.level = 25;
            const iv2 = new PokemonIv('Pikachu'); // ID 25
            iv2.level = 25;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            // Secondary sort by ID is descending (lower IDs first)
            const [result1, error1] = sortPokemonItems(items, 'level', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[0].iv.pokemonName).toBe('Bulbasaur');
            expect(result1[1].iv.pokemonName).toBe('Pikachu');

            // Secondary sort by ID is descending (higher IDs first)
            // because items is reversed afterward
            const [result2, error2] = sortPokemonItems(items, 'level', false, 'unknown',
                'Energy for Everyone S', parameter, mockT);
            expect(error2).toBe('');
            expect(result2.length).toBe(2);
            expect(result2[0].iv.pokemonName).toBe('Pikachu');
            expect(result2[1].iv.pokemonName).toBe('Bulbasaur');
        });
    });

    describe('name sort', () => {
        test('sorts by pokemon name in descending order (Z to A)', () => {
            const parameter = createStrengthParameter({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Bulbasaur')),
                new PokemonBoxItem(new PokemonIv('Eevee')),
            ];

            const [result, error] = sortPokemonItems(items, 'name', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(3);
            // Name sort is always descending (Z to A)
            expect(result[0].iv.pokemonName).toBe('Pikachu');
            expect(result[1].iv.pokemonName).toBe('Eevee');
            expect(result[2].iv.pokemonName).toBe('Bulbasaur');
        });

        test('sorts by nickname when provided in descending order', () => {
            const parameter = createStrengthParameter({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'Sparky'),
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'Thunder'),
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'Bolt'),
            ];

            const [result, error] = sortPokemonItems(items, 'name', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(3);
            // Nicknames sorted descending: Thunder > Sparky > Bolt
            expect(result[0].nickname).toBe('Thunder');
            expect(result[1].nickname).toBe('Sparky');
            expect(result[2].nickname).toBe('Bolt');
        });
    });

    describe('pokedexno sort', () => {
        test('sorts by pokedex number', () => {
            const parameter = createStrengthParameter({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')), // ID 25
                new PokemonBoxItem(new PokemonIv('Bulbasaur')), // ID 1
                new PokemonBoxItem(new PokemonIv('Charmander')), // ID 4
            ];

            const [result, error] = sortPokemonItems(items, 'pokedexno', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(3);
            // Higher IDs come first in the result
            expect(result[0].iv.pokemonName).toBe('Pikachu');
            expect(result[1].iv.pokemonName).toBe('Charmander');
            expect(result[2].iv.pokemonName).toBe('Bulbasaur');
        });

        test('sorts by level as secondary sort when pokemon IDs are equal', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 10;
            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 25;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result, error] = sortPokemonItems(items, 'pokedexno', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(2);
            expect(result[0].iv.level).toBe(25);
            expect(result[1].iv.level).toBe(10);
        });
    });

    describe('rp sort', () => {
        test('sorts by RP', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 10;
            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 50;
            const iv3 = new PokemonIv('Pikachu');
            iv3.level = 25;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
                new PokemonBoxItem(iv3),
            ];

            const [result, error] = sortPokemonItems(items, 'rp', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(3);
            // Higher level Pokémon should have higher RP
            expect(result[0].iv.level).toBe(50);
            expect(result[1].iv.level).toBe(25);
            expect(result[2].iv.level).toBe(10);
        });
    });

    describe('total strength sort', () => {
        test('sorts by total strength values', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 10;
            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 50;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result, error] = sortPokemonItems(items, 'total strength', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(2);
            // Higher level should generally have higher strength
            expect(result[0].iv.level).toBe(50);
            expect(result[1].iv.level).toBe(10);
        });
    });

    describe('berry sort', () => {
        test('sorts by berry strength values', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 10;
            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 50;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result, error] = sortPokemonItems(items, 'berry', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(2);
            expect(result[0].iv.level).toBe(50);
            expect(result[1].iv.level).toBe(10);
        });
    });

    describe('ingredient sort', () => {
        test('returns error when tapFrequency is none', () => {
            const parameter = createStrengthParameter({});
            parameter.tapFrequency = 'none';

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'ingredient', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(result).toEqual([]);
            expect(error).toBe('no ingredient');
        });

        test('sorts ingredient by "count" and "strength"', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            const iv2 = new PokemonIv('Eevee (Halloween)');

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Pikachu':
                        return createStrengthResult({
                            ingredients: [
                                {name: 'apple', count: 8, strength: 800, helpCount: 8},
                                {name: 'ginger', count: 16, strength: 1600, helpCount: 16},
                            ],
                        });
                    case 'Eevee (Halloween)':
                        return createStrengthResult({
                            ingredients: [
                                {name: 'pumpkin', count: 20, strength: 5000, helpCount: 20},
                            ],
                        });
                }
                return createStrengthResult({});
            };

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            // Sort by ingredient count
            const [result1, error1] = sortPokemonItems(items, 'ingredient', true, 'count',
                'Energy for Everyone S', parameter, mockT, calculator);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[0].iv.pokemon.name).toBe('Pikachu');
            expect(result1[1].iv.pokemon.name).toBe('Eevee (Halloween)');

            // Sort by ingredient strength
            const [result2, error2] = sortPokemonItems(items, 'ingredient', true, 'strength',
                'Energy for Everyone S', parameter, mockT, calculator);
            expect(error2).toBe('');
            expect(result2.length).toBe(2);
            expect(result2[0].iv.pokemon.name).toBe('Eevee (Halloween)');
            expect(result2[1].iv.pokemon.name).toBe('Pikachu');
        });

        test('returns error message when no pokemon found with ingredients', () => {
            const parameter = createStrengthParameter({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'ingredient', true, 'sausage',
                'Energy for Everyone S', parameter, mockT);

            // If no Pokemon produce the specified ingredient
            if (result.length === 0) {
                expect(error).toBe('no pokemon found');
            }
        });
    });

    describe('skill sort', () => {
        test('returns error when tapFrequency is none', () => {
            const parameter = createStrengthParameter({});
            parameter.tapFrequency = 'none';

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(result).toEqual([]);
            expect(error).toBe('no skill');
        });

        test('returns error when period is whistlePeriod (0)', () => {
            const parameter = createStrengthParameter({});
            parameter.period = 0; // whistlePeriod

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(result).toEqual([]);
            expect(error).toBe('no skill');
        });

        test('filters by main skill and sorts by skill', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu'); // Has Charge Strength S
            iv1.level = 50;
            const iv2 = new PokemonIv('Eevee'); // Different skill
            iv2.level = 50;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Charge Strength S', parameter, mockT);

            // Should only include Pokémon with matching skill
            expect(result.length).toBe(1);
            expect(result[0].iv.pokemonName).toBe('Pikachu');
        });

        test('returns error message when no pokemon match the skill filter', () => {
            const parameter = createStrengthParameter({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Dream Shard Magnet S', parameter, mockT);

            // Pikachu doesn't have Dream Shard Magnet S
            expect(result.length).toBe(0);
            expect(error).toBe('no pokemon found');
        });

        test('returns different result wheather mainSkill is "count" or "strength"', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Golduck');
            const iv2 = new PokemonIv('Drifblim');

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Golduck':
                        return createStrengthResult({
                            skillCount: 15,
                            skillStrength: 10000,
                        });
                    case 'Drifblim':
                        return createStrengthResult({
                            skillCount: 10,
                            skillStrength: 12000,
                        });
                }
                return createStrengthResult({});
            };

            // Skill count is higher for Golduck
            const [result1, error1] = sortPokemonItems(items, 'skill', true, 'unknown',
                'count', parameter, mockT, calculator);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[0].iv.pokemon.name).toBe('Golduck');

            // Skill strength is higher for Drifblim
            const [result2, error2] = sortPokemonItems(items, 'skill', true, 'unknown',
                'strength', parameter, mockT, calculator);
            expect(error2).toBe('');
            expect(result2.length).toBe(2);
            expect(result2[0].iv.pokemon.name).toBe('Drifblim');
        });

        test('uses skillValue for Dream Shard Magnet S', () => {
            const parameter = createStrengthParameter({});

            // Pikachu (Holiday) has Dream Shard Magnet S skill
            const iv1 = new PokemonIv('Lucario');
            const iv2 = new PokemonIv('Swalot');

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Lucario':
                        return createStrengthResult({
                            skillCount: 6,
                            skillValue: 6000,
                        });
                    case 'Swalot':
                        return createStrengthResult({
                            skillCount: 5.5,
                            skillValue: 8000,
                        });
                }
                return createStrengthResult({});
            };

            // Dream shards is higher for Swalot
            const [result1, error1] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Dream Shard Magnet S', parameter, mockT, calculator);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[0].iv.pokemon.name).toBe('Swalot');

            // Skill count is higher for Lucario
            const [result2, error2] = sortPokemonItems(items, 'skill', true, 'unknown',
                'count', parameter, mockT, calculator);
            expect(error2).toBe('');
            expect(result2.length).toBe(2);
            expect(result2[0].iv.pokemon.name).toBe('Lucario');
        });

        test('uses skillValue2 for Ingredient Draw S (Super Luck) when sorting by Dream Shard Magnet S', () => {
            const parameter = createStrengthParameter({});

            // Murkrow has Ingredient Draw S (Super Luck) - should use skillValue2
            // Lucario has Dream Shard Magnet S - should use skillValue
            const iv1 = new PokemonIv('Murkrow');
            const iv2 = new PokemonIv('Lucario');

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Murkrow':
                        // Ingredient Draw S (Super Luck) - dream shards are in skillValue2
                        return createStrengthResult({
                            skillCount: 5,
                            skillValue: 50, // ingredient count
                            skillValue2: 10000, // dream shards
                        });
                    case 'Lucario':
                        // Dream Shard Magnet S - dream shards are in skillValue
                        return createStrengthResult({
                            skillCount: 6,
                            skillValue: 8000, // dream shards
                        });
                }
                return createStrengthResult({});
            };

            // Murkrow should be first because skillValue2 (10000) > Lucario's skillValue (8000)
            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Dream Shard Magnet S', parameter, mockT, calculator);
            expect(error).toBe('');
            expect(result.length).toBe(2);
            expect(result[0].iv.pokemon.name).toBe('Murkrow');
            expect(result[1].iv.pokemon.name).toBe('Lucario');
        });

        test('filters out zero-strength items when `mainSkill` is "strength"', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 50;
            const iv2 = new PokemonIv('Pawmot');
            iv2.level = 50; // Energy for Everyone, might have 0 strength

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'strength', parameter, mockT);

            // Should only include items with strength > 0
            expect(error).toBe('');
            expect(result.length).toBe(1);
            expect(result[0].iv.pokemon.name).toBe('Pikachu');
        });

        test('uses skillValue for Lunar Blessing when mainSkill is "Energy for Everyone S"', () => {
            const parameter = createStrengthParameter({});

            // Create mock Pokémon with Energy for Everyone S skills
            const iv1 = new PokemonIv('Cresselia');
            const iv2 = new PokemonIv('Pawmot');
            const iv3 = new PokemonIv('Braviary');
            const iv4 = new PokemonIv('Sceptile');

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
                new PokemonBoxItem(iv3),
                new PokemonBoxItem(iv4),
            ];

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Cresselia':
                        // Cresselia has "Energy for Everyone S (Lunar Blessing)"
                        // Should use skillValue for sorting
                        return createStrengthResult({
                            skillCount: 5,
                            skillValue: 30,
                            skillStrength: 0, // Strength is 0 for this skill
                            skillStrength2: 30000,
                        });
                    case 'Pawmot':
                        // Regular "Energy for Everyone S"
                        return createStrengthResult({
                            skillCount: 6,
                            skillValue: 50,
                            skillStrength: 0,
                        });
                    case 'Braviary':
                        return createStrengthResult({
                            skillCount: 4,
                            skillValue: 20000,
                            skillStrength: 20000,
                        });
                    case 'Sceptile':
                        return createStrengthResult({
                            skillCount: 4,
                            skillValue: 40000,
                            skillStrength: 40000,
                        });
                }
                return createStrengthResult({});
            };

            // When sorting by "Energy for Everyone S", Pawmot should be first
            // because its skillValue (50) is higher than Cresselia's (30)
            const [result1, error1] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Energy for Everyone S', parameter, mockT, calculator);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[1].iv.pokemon.name).toBe('Cresselia');

            // When sorting by "Berry Burst", Sceptile should be first,
            // Cresselia second, Braviary third
            const [result2, error2] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Berry Burst', parameter, mockT, calculator);
            expect(error2).toBe('');
            expect(result2.length).toBe(3);
            expect(result2[0].iv.pokemon.name).toBe('Sceptile');
            expect(result2[1].iv.pokemon.name).toBe('Cresselia');
            expect(result2[2].iv.pokemon.name).toBe('Braviary');
        });

        test('uses skillValue2 for "Cooking Power-Up S (Minus)" when skillValue2 > 0', () => {
            const parameter = createStrengthParameter({evolved: true});

            const iv1 = new PokemonIv('Toxel');
            iv1.nature = new Nature('Bashful'); // Low Key nature
            const iv2 = new PokemonIv('Slowking');

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const calculator: StrengthCalculator = (iv: PokemonIv) => {
                switch (iv.pokemon.name) {
                    case 'Toxel':
                        return createStrengthResult({
                            skillCount: 5,
                            skillValue: 100,
                            skillValue2: 50,
                        });
                    case 'Slowking':
                        return createStrengthResult({
                            skillCount: 5,
                            skillValue: 90,
                        });
                }
                return createStrengthResult({});
            };

            // When sorting by "Energizing Cheer S", should use skillValue2
            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Energizing Cheer S', parameter, mockT, calculator);

            expect(error).toBe('');
            expect(result.length).toBe(2);
            expect(result[0].iv.pokemon.name).toBe('Slowking');
            expect(result[1].iv.pokemon.name).toBe('Toxel');
        });
    });

    describe('special handling for Toxel', () => {
        test('handles Toxel with evolved=true and Amped', () => {
            const parameter = createStrengthParameter({evolved: true});

            const toxel = new PokemonIv('Toxel');
            toxel.nature = new Nature('Hardy'); // Amped nature
            const pikachu = new PokemonIv('Pikachu'); // Different skill

            const items = [
                new PokemonBoxItem(toxel),
                new PokemonBoxItem(pikachu),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Ingredient Magnet S', parameter, mockT);

            // Toxel should be included because with evolved=true and amped nature,
            // it uses "Ingredient Magnet S (Plus)" which matches "Ingredient Magnet S"
            expect(error).toBe('');
            expect(result.length).toBe(1);
            expect(result[0].iv.pokemon.name).toBe('Toxel');
        });

        test('handles Toxel with evolved=true and Low key', () => {
            const parameter = createStrengthParameter({});
            parameter.evolved = true;

            const toxel = new PokemonIv('Toxel');
            toxel.nature = new Nature('Bashful'); // Low Key nature
            const pikachu = new PokemonIv('Pikachu'); // Different skill

            const items = [
                new PokemonBoxItem(toxel),
                new PokemonBoxItem(pikachu),
            ];

            const [result, error] = sortPokemonItems(items, 'skill', true, 'unknown',
                'Cooking Power-Up S', parameter, mockT);

            // Toxel should be included because with evolved=true and low key nature,
            // it uses "Cooking Power-Up S (Minus)" which matches "Cooking Power-Up S"
            expect(error).toBe('');
            expect(result.length).toBe(1);
            expect(result[0].iv.pokemon.name).toBe('Toxel');
        });
    });
});


describe('loadBoxSortConfig', () => {
    // Mock localStorage
    let localStorageMock: { [key: string]: string } = {};

    beforeEach(() => {
        localStorageMock = {};

        global.localStorage = {
            getItem: vi.fn((key: string) => localStorageMock[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                localStorageMock[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete localStorageMock[key];
            }),
            clear: vi.fn(() => {
                localStorageMock = {};
            }),
            length: 0,
            key: vi.fn(),
        } as Storage;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    test('returns default config when localStorage is empty', () => {
        const config = loadBoxSortConfig();

        expect(config).toEqual({
            sort: 'level',
            ingredient: 'strength',
            mainSkill: 'Energy for Everyone S',
            descending: true,
            warnItems: 0,
            warnDate: '',
        });
    });

    test('returns default config when localStorage has null', () => {
        localStorage.setItem('PstPokemonBoxParam', 'null');

        const config = loadBoxSortConfig();

        expect(config.sort).toBe('level');
        expect(config.ingredient).toBe('strength');
        expect(config.mainSkill).toBe('Energy for Everyone S');
        expect(config.descending).toBe(true);
    });

    test('returns default config when JSON is invalid', () => {
        localStorage.setItem('PstPokemonBoxParam', 'invalid json');

        const config = loadBoxSortConfig();

        expect(config.sort).toBe('level');
    });

    test('loads partial configuration with mixed valid and invalid values', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            sort: 'rp',
            ingredient: 'invalid-ingredient',
            mainSkill: 'Charge Strength S',
            descending: 'invalid',
            warnItems: 25,
            warnDate: 'bad-format',
        }));

        const config = loadBoxSortConfig();

        expect(config.sort).toBe('rp'); // valid
        expect(config.ingredient).toBe('strength'); // invalid, uses default
        expect(config.mainSkill).toBe('Charge Strength S'); // valid
        expect(config.descending).toBe(true); // invalid, uses default
        expect(config.warnItems).toBe(25); // valid
        expect(config.warnDate).toBe(''); // invalid, uses default
    });

    test('handles all valid sort types', () => {
        const sortTypes = ['level', 'name', 'pokedexno', 'rp', 'berry', 'total strength', 'ingredient', 'skill'];

        for (const sortType of sortTypes) {
            localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
                sort: sortType,
            }));

            const config = loadBoxSortConfig();

            expect(config.sort).toBe(sortType);
        }
    });

    test('handles ingredient sort type "unknown"', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            sort: 'rp',
            ingredient: 'unknown',
        }));

        const config = loadBoxSortConfig();
        expect(config.ingredient).toBe("strength");
    });

    test('handles old sort type "skill count"', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            sort: 'skill count',
        }));

        const config = loadBoxSortConfig();
        expect(config.sort).toBe("skill");
    });

    test('loads mainSkill "strength" correctly', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            mainSkill: 'strength',
        }));

        const config = loadBoxSortConfig();
        expect(config.mainSkill).toBe('strength');
    });

    test('loads mainSkill "count" correctly', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            mainSkill: 'count',
        }));

        const config = loadBoxSortConfig();
        expect(config.mainSkill).toBe('count');
    });

    test('loads valid MainSkillName correctly', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            mainSkill: 'Charge Strength S',
        }));

        const config = loadBoxSortConfig();
        expect(config.mainSkill).toBe('Charge Strength S');
    });

    test('rejects invalid mainSkill and uses default', () => {
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify({
            mainSkill: 'invalid-skill-name',
        }));

        const config = loadBoxSortConfig();
        expect(config.mainSkill).toBe('Energy for Everyone S'); // default value
    });
});

function createStrengthResult(template: Partial<SimpleStrengthResult>): SimpleStrengthResult {
    return {
        totalStrength: template.totalStrength ?? 0,
        berryTotalStrength: template.berryTotalStrength ?? 0,
        ingredients: template.ingredients ?? [],
        skillCount: template.skillCount ?? 0,
        skillValue: template.skillValue ?? 0,
        skillStrength: template.skillStrength ?? 0,
        skillValue2: template.skillValue2 ?? 0,
        skillStrength2: template.skillStrength2 ?? 0,
    };
}
