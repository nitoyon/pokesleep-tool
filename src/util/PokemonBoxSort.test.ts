import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    SimpleStrengthResult, StrengthCalculator,
    sortPokemonItems, loadBoxSortConfig,
 } from './PokemonBoxSort';
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

        const [result, error] = sortPokemonItems([], 'level', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'level', 'unknown',
                'Energy for Everyone S', parameter, mockT);
            expect(error).toBe('');
            expect(result.length).toBe(3);
            expect(result[0].iv.level).toBe(50);
            expect(result[1].iv.level).toBe(25);
            expect(result[2].iv.level).toBe(10);
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

            const [result, error] = sortPokemonItems(items, 'level', 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(error).toBe('');
            expect(result.length).toBe(2);
            // Secondary sort by ID is descending (higher IDs first)
            expect(result[0].iv.pokemonName).toBe('Pikachu');
            expect(result[1].iv.pokemonName).toBe('Bulbasaur');
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

            const [result, error] = sortPokemonItems(items, 'name', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'name', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'pokedexno', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'pokedexno', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'rp', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'total strength', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'berry', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'ingredient', 'unknown',
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
            const [result1, error1] = sortPokemonItems(items, 'ingredient', 'count',
                'Energy for Everyone S', parameter, mockT, calculator);
            expect(error1).toBe('');
            expect(result1.length).toBe(2);
            expect(result1[0].iv.pokemon.name).toBe('Pikachu');
            expect(result1[1].iv.pokemon.name).toBe('Eevee (Halloween)');

            // Sort by ingredient strength
            const [result2, error2] = sortPokemonItems(items, 'ingredient', 'strength',
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

            const [result, error] = sortPokemonItems(items, 'ingredient', 'sausage',
                'Energy for Everyone S', parameter, mockT);

            // If no Pokemon produce the specified ingredient
            if (result.length === 0) {
                expect(error).toBe('no pokemon found');
            }
        });
    });

    describe('skill count sort', () => {
        test('returns error when tapFrequency is none', () => {
            const parameter = createStrengthParameter({});
            parameter.tapFrequency = 'none';

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
            ];

            const [result, error] = sortPokemonItems(items, 'skill count', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'skill count', 'unknown',
                'Energy for Everyone S', parameter, mockT);

            expect(result).toEqual([]);
            expect(error).toBe('no skill');
        });

        test('filters by main skill and sorts by skill count', () => {
            const parameter = createStrengthParameter({});

            const iv1 = new PokemonIv('Pikachu'); // Has Charge Strength S
            iv1.level = 50;
            const iv2 = new PokemonIv('Eevee'); // Different skill
            iv2.level = 50;

            const items = [
                new PokemonBoxItem(iv1),
                new PokemonBoxItem(iv2),
            ];

            const [result] = sortPokemonItems(items, 'skill count', 'unknown',
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

            const [result, error] = sortPokemonItems(items, 'skill count', 'unknown',
                'Dream Shard Magnet S', parameter, mockT);

            // Pikachu doesn't have Dream Shard Magnet S
            expect(result.length).toBe(0);
            expect(error).toBe('no pokemon found');
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
        const sortTypes = ['level', 'name', 'pokedexno', 'rp', 'berry', 'total strength', 'ingredient', 'skill count'];

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
});

function createStrengthResult(template: Partial<SimpleStrengthResult>): SimpleStrengthResult {
    return {
        totalStrength: template.totalStrength ?? 0,
        berryTotalStrength: template.berryTotalStrength ?? 0,
        ingredients: template.ingredients ?? [],
        skillCount: template.skillCount ?? 0,
    };
}
