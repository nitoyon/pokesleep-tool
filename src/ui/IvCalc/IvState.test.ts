import { describe, test, expect, beforeEach } from 'vitest';
import PokemonIv from '../../util/PokemonIv';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import { normalizeState, ivStateReducer } from './IvState';
import type IvState from './IvState';
import type { IvAction } from './IvState';
import { loadStrengthParameter } from '../../util/PokemonStrength';

function createBaseState(): IvState {
    return {
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
}

describe('normalizeState', () => {
    let baseState: IvState;

    beforeEach(() => { baseState = createBaseState() });

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

describe('ivStateReducer', () => {
    let baseState: IvState;

    beforeEach(() => { baseState = createBaseState() });

    describe('changeParameter action', () => {
        test('should normalize PokemonIv when parameter changes', () => {
            const state = { ...baseState };
            state.pokemonIv.skillLevel = 0; // Invalid skill level

            const newParameter = loadStrengthParameter();
            const action: IvAction = {
                type: 'changeParameter',
                payload: { parameter: newParameter },
            };

            const newState = ivStateReducer(state, action);

            // normalizeState should have normalized the skillLevel
            expect(newState.pokemonIv.skillLevel).toBe(1);
        });
    });

    describe('updateIv action', () => {
        test('should normalize state when IV is updated', () => {
            const newIv = new PokemonIv('Pikachu');
            newIv.skillLevel = 0; // Invalid skill level

            const action: IvAction = {
                type: 'updateIv',
                payload: { iv: newIv },
            };

            const newState = ivStateReducer(baseState, action);

            // normalizeState should have normalized the skillLevel
            expect(newState.pokemonIv).toBe(newIv);
            expect(newState.pokemonIv.skillLevel).toBe(1);
        });
    });

    describe('restoreItem action', () => {
        test('should restore item change', () => {
            const box = new PokemonBox();
            const iv = new PokemonIv('Venusaur');
            iv.skillLevel = 1;
            const itemId = box.add(iv);

            const pokemonIv = new PokemonIv('Venusaur');
            pokemonIv.skillLevel = 3;

            const state = { ...baseState, box, pokemonIv, selectedItemId: itemId };
            const action: IvAction = {
                type: 'restoreItem',
            };

            const newState = ivStateReducer(state, action);

            // skill level is restored
            expect(newState.pokemonIv.pokemon.name).toBe('Venusaur');
            expect(newState.pokemonIv.skillLevel).toBe(1);
        });

        test('should not change state when no item is selected', () => {
            const action: IvAction = {
                type: 'restoreItem',
            };

            const newState = ivStateReducer(baseState, action);

            expect(newState).toBe(baseState);
        });
    });

    describe('addOrEditDone action', () => {
        test('should normalize state when adding new item', () => {
            const iv = new PokemonIv('Blastoise');
            iv.skillLevel = 0; // Will be normalized

            const item = new PokemonBoxItem(iv, 'MyBlastoise', -1);

            const action: IvAction = {
                type: 'addOrEditDone',
                payload: { item },
            };

            const newState = ivStateReducer(baseState, action);

            // normalizeState should have normalized the IV
            expect(newState.pokemonIv.pokemon.name).toBe('Blastoise');
            expect(newState.pokemonIv.skillLevel).toBe(1);
            expect(newState.selectedItemId).toBeGreaterThan(-1);
        });

        test('should normalize state when editing existing item', () => {
            const box = new PokemonBox();
            const originalIv = new PokemonIv('Raichu');
            const itemId = box.add(originalIv);

            const state = { ...baseState, box, selectedItemId: itemId };

            const editedIv = new PokemonIv('Pikachu');
            editedIv.skillLevel = 0; // Will be normalized

            const item = new PokemonBoxItem(editedIv, 'EditedPikachu', itemId);

            const action: IvAction = {
                type: 'addOrEditDone',
                payload: { item },
            };

            const newState = ivStateReducer(state, action);

            // normalizeState should have normalized the edited IV
            expect(newState.pokemonIv.pokemon.name).toBe('Pikachu');
            expect(newState.pokemonIv.skillLevel).toBe(1);
        });
    });

    describe('select action', () => {
        test('should normalize state when selecting item from box', () => {
            const box = new PokemonBox();
            const iv = new PokemonIv('Raichu');
            iv.skillLevel = 0; // Will be normalized
            const itemId = box.add(iv);

            const state = { ...baseState, box };

            const action: IvAction = {
                type: 'select',
                payload: { id: itemId },
            };

            const newState = ivStateReducer(state, action);

            // normalizeState should have normalized the selected IV
            expect(newState.pokemonIv.pokemon.name).toBe('Raichu');
            expect(newState.pokemonIv.skillLevel).toBe(1);
            expect(newState.selectedItemId).toBe(itemId);
        });

        test('should not change state when item not found', () => {
            const action: IvAction = {
                type: 'select',
                payload: { id: 999 }, // Non-existent ID
            };

            const newState = ivStateReducer(baseState, action);

            expect(newState).toBe(baseState);
        });
    });
});
