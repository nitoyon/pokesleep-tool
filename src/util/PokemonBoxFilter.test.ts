import { describe, test, expect, vi } from 'vitest';
import BoxFilterConfig from './PokemonBoxFilter';
import PokemonIv from './PokemonIv';
import { PokemonBoxItem } from './PokemonBox';
import Nature from './Nature';
import SubSkill from './SubSkill';
import SubSkillList from './SubSkillList';
import type { TFunction } from 'i18next';

// Mock translation function
const mockT = vi.fn((key: string) => {
    if (key === 'pokemons.Bulbasaur') return 'Bulbasaur';
    if (key === 'pokemons.Pikachu') return 'Pikachu';
    if (key === 'pokemons.Eevee') return 'Eevee';
    return key;
}) as unknown as TFunction;

describe('BoxFilterConfig', () => {
    describe('constructor', () => {
        test('initializes with default values when empty config provided', () => {
            const config = new BoxFilterConfig({});

            expect(config.name).toBe("");
            expect(config.filterTypes).toEqual([]);
            expect(config.filterSpecialty).toEqual([]);
            expect(config.ingredientName).toBeUndefined();
            expect(config.ingredientUnlockedOnly).toBe(false);
            expect(config.mainSkillNames).toEqual([]);
            expect(config.subSkillNames).toEqual([]);
            expect(config.subSkillUnlockedOnly).toBe(true);
            expect(config.subSkillAnd).toBe(true);
            expect(config.neutralNature).toBe(false);
            expect(config.upNature).toBe("No effect");
            expect(config.downNature).toBe("No effect");
        });

        test('initializes with provided values', () => {
            const config = new BoxFilterConfig({
                name: "test",
                filterTypes: ["electric"],
                filterSpecialty: ["Berries"],
                ingredientName: "apple",
                ingredientUnlockedOnly: true,
                mainSkillNames: ["Charge Strength S"],
                subSkillNames: ["Helping Speed M"],
                subSkillUnlockedOnly: false,
                subSkillAnd: false,
                neutralNature: true,
                upNature: "Energy recovery",
                downNature: "Speed of help"
            });

            expect(config.name).toBe("test");
            expect(config.filterTypes).toEqual(["electric"]);
            expect(config.filterSpecialty).toEqual(["Berries"]);
            expect(config.ingredientName).toBe("apple");
            expect(config.ingredientUnlockedOnly).toBe(true);
            expect(config.mainSkillNames).toEqual(["Charge Strength S"]);
            expect(config.subSkillNames).toEqual(["Helping Speed M"]);
            expect(config.subSkillUnlockedOnly).toBe(false);
            expect(config.subSkillAnd).toBe(false);
            expect(config.neutralNature).toBe(true);
            expect(config.upNature).toBe("Energy recovery");
            expect(config.downNature).toBe("Speed of help");
        });
    });

    describe('filter', () => {
        test('returns all items when no filters are set', () => {
            const config = new BoxFilterConfig({});

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Eevee'))
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(2);
            expect(filtered).toEqual(items);
        });

        test('filters by name (nickname match)', () => {
            const config = new BoxFilterConfig({ name: "sp" });

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'Sparky'),
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'Thunder'),
                new PokemonBoxItem(new PokemonIv('Eevee'), 'Fluffy')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('Sparky');
        });

        test('filters by name (pokemon name match)', () => {
            const config = new BoxFilterConfig({ name: "pika" });

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'x'),
                new PokemonBoxItem(new PokemonIv('Eevee'), 'y')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].iv.pokemonName).toBe('Pikachu');
        });

        test('filters by name (case insensitive for Pokemon name)', () => {
            const config = new BoxFilterConfig({ name: "PIKA" });

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu'), 'x'),
                new PokemonBoxItem(new PokemonIv('Eevee'), 'y')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].iv.pokemonName).toBe('Pikachu');
        });

        test('filters by type', () => {
            const config = new BoxFilterConfig({ filterTypes: ["electric"] });

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Eevee'))
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].iv.pokemonName).toBe('Pikachu');
        });

        test('filters by multiple types', () => {
            const config = new BoxFilterConfig({ filterTypes: ["electric", "normal"] });

            const items = [
                new PokemonBoxItem(new PokemonIv('Bulbasaur')),
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Eevee')),
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(2);
            expect(filtered[0].iv.pokemonName).toBe('Pikachu');
            expect(filtered[1].iv.pokemonName).toBe('Eevee');
        });

        test('filters by specialty', () => {
            const config = new BoxFilterConfig({ filterSpecialty: ["Berries"] });

            const items = [
                new PokemonBoxItem(new PokemonIv('Bulbasaur')),
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Eevee')),
            ];

            const filtered = config.filter(items, false, mockT);
            // Pikachu's specialty is "Berries" so it should be in the results
            expect(filtered.length).toBe(1);
            expect(filtered[0].iv.pokemonName).toBe('Pikachu');
        });

        test('filters by main skill (Toxel with evolved=true, Amped nature)', () => {
            const config = new BoxFilterConfig({ mainSkillNames: ["Ingredient Magnet S"] });

            const toxelAmped = new PokemonIv('Toxel');
            toxelAmped.nature = new Nature('Hardy'); // Amped nature -> Ingredient Magnet S

            const toxelLowKey = new PokemonIv('Toxel');
            toxelLowKey.nature = new Nature('Bold'); // Low Key nature -> Cooking Power-Up S

            const items = [
                new PokemonBoxItem(toxelAmped, 'AmpedForm'),
                new PokemonBoxItem(toxelLowKey, 'LowKeyForm')
            ];

            const filtered = config.filter(items, true, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('AmpedForm');
        });

        test('filters by main skill (Toxel with evolved=true, Low Key nature)', () => {
            const config = new BoxFilterConfig({ mainSkillNames: ["Cooking Power-Up S"] });

            const toxelAmped = new PokemonIv('Toxel');
            toxelAmped.nature = new Nature('Hardy'); // Amped nature -> Ingredient Magnet S

            const toxelLowKey = new PokemonIv('Toxel');
            toxelLowKey.nature = new Nature('Bold'); // Low Key nature -> Cooking Power-Up S

            const items = [
                new PokemonBoxItem(toxelAmped, 'AmpedForm'),
                new PokemonBoxItem(toxelLowKey, 'LowKeyForm')
            ];

            // With evolved=true, should match Low Key Toxel (evolves to Cooking Power-Up S)
            const filtered = config.filter(items, true, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('LowKeyForm');
        });

        test('filters by sub skills (AND logic)', () => {
            const config = new BoxFilterConfig({
                subSkillNames: ["Helping Speed M", "Berry Finding S"],
                subSkillAnd: true,
                subSkillUnlockedOnly: false
            });

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 100;
            iv1.subSkills = new SubSkillList({
                lv10: new SubSkill("Helping Speed M"),
                lv25: new SubSkill("Berry Finding S"),
            });

            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 100;
            iv2.subSkills = new SubSkillList({ lv10: new SubSkill("Helping Speed M") });

            const items = [
                new PokemonBoxItem(iv1, 'HasBoth'),
                new PokemonBoxItem(iv2, 'HasOne')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('HasBoth');
        });

        test('filters by sub skills (OR logic)', () => {
            const config = new BoxFilterConfig({
                subSkillNames: ["Helping Speed M", "Berry Finding S"],
                subSkillAnd: false,
                subSkillUnlockedOnly: false
            });

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 100;
            iv1.subSkills = new SubSkillList({ lv10: new SubSkill("Helping Speed M") });

            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 100;
            iv2.subSkills = new SubSkillList({ lv10: new SubSkill("Berry Finding S") });

            const iv3 = new PokemonIv('Pikachu');
            iv3.level = 100;
            iv3.subSkills = new SubSkillList({ lv10: new SubSkill("Skill Trigger M") });

            const items = [
                new PokemonBoxItem(iv1, 'HasFirst'),
                new PokemonBoxItem(iv2, 'HasSecond'),
                new PokemonBoxItem(iv3, 'HasNeither')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(2);
            expect(filtered.map(x => x.nickname).sort()).toEqual(['HasFirst', 'HasSecond']);
        });

        test('filters by sub skills (unlocked only)', () => {
            const config = new BoxFilterConfig({
                subSkillNames: ["Helping Speed M"],
                subSkillUnlockedOnly: true
            });

            const iv1 = new PokemonIv('Pikachu');
            iv1.level = 5;
            iv1.subSkills = new SubSkillList({ lv10: new SubSkill("Helping Speed M") });

            const iv2 = new PokemonIv('Pikachu');
            iv2.level = 10;
            iv2.subSkills = new SubSkillList({ lv10: new SubSkill("Helping Speed M") });

            const items = [
                new PokemonBoxItem(iv1, 'Level5'),
                new PokemonBoxItem(iv2, 'Level10')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('Level10');
        });

        test('filters by neutral nature', () => {
            const config = new BoxFilterConfig({ neutralNature: true });

            const iv1 = new PokemonIv('Pikachu');
            iv1.nature = new Nature("Bashful"); // Neutral nature

            const iv2 = new PokemonIv('Pikachu');
            iv2.nature = new Nature("Bold"); // Non-neutral nature

            const items = [
                new PokemonBoxItem(iv1, 'Neutral'),
                new PokemonBoxItem(iv2, 'NonNeutral')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('Neutral');
        });

        test('filters by up nature', () => {
            const config = new BoxFilterConfig({ upNature: "Energy recovery" });

            const iv1 = new PokemonIv('Pikachu');
            iv1.nature = new Nature("Bold"); // Energy recovery up

            const iv2 = new PokemonIv('Pikachu');
            iv2.nature = new Nature("Adamant"); // Speed of help up

            const items = [
                new PokemonBoxItem(iv1, 'EnergyUp'),
                new PokemonBoxItem(iv2, 'SpeedUp')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('EnergyUp');
        });

        test('filters by down nature', () => {
            const config = new BoxFilterConfig({ downNature: "Speed of help" });

            const iv1 = new PokemonIv('Pikachu');
            iv1.nature = new Nature("Bold"); // Speed of help down

            const iv2 = new PokemonIv('Pikachu');
            iv2.nature = new Nature("Adamant"); // EXP gains down

            const items = [
                new PokemonBoxItem(iv1, 'SpeedDown'),
                new PokemonBoxItem(iv2, 'ExpDown')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('SpeedDown');
        });

        test('combines multiple filters (all must pass)', () => {
            const config = new BoxFilterConfig({
                filterTypes: ["electric"],
                neutralNature: true
            });

            const iv1 = new PokemonIv('Pikachu');
            iv1.nature = new Nature("Bashful"); // Electric + Neutral

            const iv2 = new PokemonIv('Pikachu');
            iv2.nature = new Nature("Bold"); // Electric + Non-neutral

            const iv3 = new PokemonIv('Eevee');
            iv3.nature = new Nature("Bashful"); // Non-electric + Neutral

            const items = [
                new PokemonBoxItem(iv1, 'Match'),
                new PokemonBoxItem(iv2, 'WrongNature'),
                new PokemonBoxItem(iv3, 'WrongType')
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(1);
            expect(filtered[0].nickname).toBe('Match');
        });

        test('returns empty array when no items match', () => {
            const config = new BoxFilterConfig({ filterTypes: ["dragon"] });

            const items = [
                new PokemonBoxItem(new PokemonIv('Pikachu')),
                new PokemonBoxItem(new PokemonIv('Eevee'))
            ];

            const filtered = config.filter(items, false, mockT);
            expect(filtered.length).toBe(0);
        });

        test('filters empty array', () => {
            const config = new BoxFilterConfig({ filterTypes: ["electric"] });
            const filtered = config.filter([], false, mockT);
            expect(filtered.length).toBe(0);
        });
    });

    describe('defaultTabIndex', () => {
        test('returns 0 for type filter', () => {
            const config = new BoxFilterConfig({ filterTypes: ["electric"] });
            expect(config.defaultTabIndex).toBe(0);
        });

        test('returns 0 for specialty filter', () => {
            const config = new BoxFilterConfig({ filterSpecialty: ["Berries"] });
            expect(config.defaultTabIndex).toBe(0);
        });

        test('returns 1 for ingredient filter', () => {
            const config = new BoxFilterConfig({ ingredientName: "apple" });
            expect(config.defaultTabIndex).toBe(1);
        });

        test('returns 2 for main skill filter', () => {
            const config = new BoxFilterConfig({ mainSkillNames: ["Charge Strength S"] });
            expect(config.defaultTabIndex).toBe(2);
        });

        test('returns 3 for sub skill filter', () => {
            const config = new BoxFilterConfig({ subSkillNames: ["Helping Speed M"] });
            expect(config.defaultTabIndex).toBe(3);
        });

        test('returns 4 for nature filter (neutral)', () => {
            const config = new BoxFilterConfig({ neutralNature: true });
            expect(config.defaultTabIndex).toBe(4);
        });

        test('returns 4 for nature filter (up)', () => {
            const config = new BoxFilterConfig({ upNature: "Energy recovery" });
            expect(config.defaultTabIndex).toBe(4);
        });

        test('returns 4 for nature filter (down)', () => {
            const config = new BoxFilterConfig({ downNature: "Speed of help" });
            expect(config.defaultTabIndex).toBe(4);
        });

        test('returns 0 when no filters are set', () => {
            const config = new BoxFilterConfig({});
            expect(config.defaultTabIndex).toBe(0);
        });

        test('prioritizes type/specialty over other filters', () => {
            const config = new BoxFilterConfig({
                filterTypes: ["electric"],
                mainSkillNames: ["Charge Strength S"]
            });
            expect(config.defaultTabIndex).toBe(0);
        });

        test('prioritizes ingredient over main skill', () => {
            const config = new BoxFilterConfig({
                ingredientName: "apple",
                mainSkillNames: ["Charge Strength S"]
            });
            expect(config.defaultTabIndex).toBe(1);
        });
    });

    describe('isEmpty', () => {
        test('returns true when all filters are empty/default', () => {
            const config = new BoxFilterConfig({});
            expect(config.isEmpty).toBe(true);
        });

        test('returns false when name is set', () => {
            const config = new BoxFilterConfig({ name: "test" });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when filterTypes is set', () => {
            const config = new BoxFilterConfig({ filterTypes: ["electric"] });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when filterSpecialty is set', () => {
            const config = new BoxFilterConfig({ filterSpecialty: ["Berries"] });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when ingredientName is set', () => {
            const config = new BoxFilterConfig({ ingredientName: "apple" });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when mainSkillNames is set', () => {
            const config = new BoxFilterConfig({ mainSkillNames: ["Charge Strength S"] });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when subSkillNames is set', () => {
            const config = new BoxFilterConfig({ subSkillNames: ["Helping Speed M"] });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when neutralNature is true', () => {
            const config = new BoxFilterConfig({ neutralNature: true });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when upNature is set', () => {
            const config = new BoxFilterConfig({ upNature: "Energy recovery" });
            expect(config.isEmpty).toBe(false);
        });

        test('returns false when downNature is set', () => {
            const config = new BoxFilterConfig({ downNature: "Speed of help" });
            expect(config.isEmpty).toBe(false);
        });

        test('returns true even when boolean flags are set to their default values', () => {
            const config = new BoxFilterConfig({
                ingredientUnlockedOnly: false,
                subSkillUnlockedOnly: true,
                subSkillAnd: true
            });
            expect(config.isEmpty).toBe(true);
        });
    });
});
