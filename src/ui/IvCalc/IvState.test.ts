import { describe, test, expect, beforeEach } from 'vitest';
import PokemonIv from '../../util/PokemonIv';
import PokemonBox from '../../util/PokemonBox';
import { normalizeState } from './IvState';
import type IvState from './IvState';
import { loadStrengthParameter } from '../../util/PokemonStrength';

describe('normalizeState', () => {
    let baseState: IvState;

    beforeEach(() => {
        baseState = {
            tabIndex: 0,
            lowerTabIndex: 0,
            pokemonIv: new PokemonIv('Venusaur'),
            parameter: loadStrengthParameter(),
            box: new PokemonBox(),
            selectedItemId: -1,
            energyDialogOpen: false,
            boxItemDialogOpen: false,
            boxItemDialogKey: '',
            boxItemDialogIsEdit: false,
            boxExportDialogOpen: false,
            boxImportDialogOpen: false,
            boxDeleteAllDialogOpen: false,
            alertMessage: '',
        };
    });

    describe('PokemonIv normalization', () => {
        test('should call normalize on the PokemonIv', () => {
            const iv = new PokemonIv('Pikachu');
            iv.skillLevel = 0;
            const newState = normalizeState(baseState, iv);

            expect(newState.pokemonIv).toBe(iv);
            expect(newState.pokemonIv.skillLevel).toBe(1);
        });
    });

    describe('Event fixedBerries handling', () => {
        test('should update favoriteType when event has one fixedBerries', () => {
            const state = { ...baseState };
            state.parameter.event = 'halloween 2024';
            state.parameter.fieldIndex = 0;
            state.parameter.favoriteType = ['normal', 'bug', 'rock'];

            const iv = new PokemonIv('Venusaur');
            const newState = normalizeState(state, iv);

            // The favoriteType should be updated if the event has fixedBerries
            expect(newState.parameter.favoriteType[0]).toBe("ghost");
            expect(newState.parameter.favoriteType[1]).toBe("normal");
            expect(newState.parameter.favoriteType[2]).toBe("fire");
        });

        test('should not update favoriteType when event is not active on the field', () => {
            const state = { ...baseState };
            state.parameter.event = 'halloween2024';
            state.parameter.fieldIndex = 1;
            state.parameter.favoriteType = ['normal', 'normal', 'normal'];

            const iv = new PokemonIv('Venusaur');
            const newState = normalizeState(state, iv);

            // The favoriteType shouldn't be updated
            expect(newState.parameter.favoriteType[0]).toBe("normal");
        });

        test('should update favoriteType when event has three fixedBerries', () => {
            const state = { ...baseState };
            state.parameter.event = 'raikou entei suicune research 1st week';
            state.parameter.fieldIndex = 0;
            state.parameter.favoriteType = ['normal', 'normal', 'normal'];

            const iv = new PokemonIv('Venusaur');
            const newState = normalizeState(state, iv);

            // The favoriteType should be updated if the event has fixedBerries
            expect(newState.parameter.favoriteType[0]).toBe("electric");
            expect(newState.parameter.favoriteType[1]).toBe("fire");
            expect(newState.parameter.favoriteType[2]).toBe("water");
        });
    });

    describe('BerryBurstTeam species count handling', () => {
        test('should count up species from 1 to 2 for Lunar Blessing Pokemon', () => {
            const state = { ...baseState };
            // Cresselia has "Energy for Everyone S (Lunar Blessing)" skill
            state.pokemonIv = new PokemonIv('Cresselia');
            state.parameter.berryBurstTeam.auto = false;
            state.parameter.berryBurstTeam.members = [
                { type: 'psychic', level: 50 },
                { type: 'ghost', level: 50 },
                { type: 'ghost', level: 50 },
                { type: 'ghost', level: 50 },
            ];
            state.parameter.berryBurstTeam.species = 1;

            const iv = new PokemonIv('Cresselia');
            const newState = normalizeState(state, iv);

            // Species count should be updated based on team members of same type
            expect(newState.parameter.berryBurstTeam.species).toBe(2);
        });

        test('should use min when species count > 2', () => {
            const state = { ...baseState };
            state.pokemonIv = new PokemonIv('Cresselia');
            state.parameter.berryBurstTeam.auto = false;
            state.parameter.berryBurstTeam.members = [
                { type: 'psychic', level: 50 },
                { type: 'ghost', level: 50 },
                { type: 'ghost', level: 50 },
                { type: 'ghost', level: 50 },
            ];
            state.parameter.berryBurstTeam.species = 3;

            const iv = new PokemonIv('Cresselia'); // psychic type
            const newState = normalizeState(state, iv);

            expect(newState.parameter.berryBurstTeam.species).toBe(2);
        });
    });

    describe('State immutability', () => {
        test('should return new state object', () => {
            const iv = new PokemonIv('Pikachu');
            const newState = normalizeState(baseState, iv);

            expect(newState).not.toBe(baseState);
        });

        test('should update pokemonIv reference', () => {
            const iv = new PokemonIv('Pikachu');
            const newState = normalizeState(baseState, iv);

            expect(newState.pokemonIv).toBe(iv);
            expect(newState.pokemonIv).not.toBe(baseState.pokemonIv);
        });
    });
});
