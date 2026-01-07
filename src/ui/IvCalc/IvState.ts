import PokemonIv from '../../util/PokemonIv';
import { getEventBonus } from '../../data/events';
import { PokemonTypes } from '../../data/pokemons';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import { StrengthParameter, loadStrengthParameter } from '../../util/PokemonStrength';
import { isExpertField } from '../../data/fields';

export type IvAction = {
    type: "add"|"export"|"exportClose"|"import"|"importClose"|
        "deleteAll" | "deleteAllClose" | "saveItem"|"restoreItem"|
        "editDialogClose"|"closeAlert"|"openEnergyDialog"|"closeEnergyDialog";
}|{
    type: "select"|"edit"|"dup"|"remove";
    payload: {id: number};
}|{
    type: "addOrEditDone";
    payload: {item: PokemonBoxItem};
}|{
    type: "updateIv";
    payload: {iv: PokemonIv};
}|{
    type: "addThis";
    payload: {iv: PokemonIv; nickname?: string};
}|{
    type: "changeUpperTab"|"changeLowerTab",
    payload: {index: number},
}|{
    type: "changeParameter",
    payload: {parameter: StrengthParameter},
}|{
    type: "showAlert",
    payload: {message: string},
};

const initialBox = new PokemonBox();
initialBox.load();

type IvState = {
    tabIndex: number;
    lowerTabIndex: number;
    pokemonIv: PokemonIv;
    parameter: StrengthParameter;
    box: PokemonBox;
    selectedItemId: number;
    energyDialogOpen: boolean;
    boxItemDialogOpen: boolean;
    boxItemDialogKey: string;
    boxItemDialogIsEdit: boolean;
    boxExportDialogOpen: boolean;
    boxImportDialogOpen: boolean;
    boxDeleteAllDialogOpen: boolean;
    alertMessage: string;
};

/**
 * IvState saved to localStorage.
 */
type IvStateCache = {
    tabIndex: number;
    lowerTabIndex: number;
    iv: string;
    selectedIv: string;
};

/**
 * Get initial IvState object.
 * @returns Initial IvState.
 */
export function getInitialIvState(): IvState {
    const cache = loadInitialIvStateCache();
    let iv = new PokemonIv("Venusaur");
    if (cache.iv !== "") {
        try {
            iv = PokemonIv.deserialize(cache.iv);
        }
        catch {
            // ignore deserialization error (e.g. corrupted cache)
        }
    }
    let selectedItemId = -1;
    if (cache.selectedIv !== "") {
        try {
            const selectedIv = PokemonIv.deserialize(cache.selectedIv);
            const selectedIndex = initialBox.items.findIndex(x => x.iv.isEqual(selectedIv));
            if (selectedIndex >= 0) {
                selectedItemId = initialBox.items[selectedIndex].id;
            }
        }
        catch {
            // ignore deserialization error (e.g. corrupted cache)
        }
    }

    const ret: IvState = {
        tabIndex: cache.tabIndex,
        lowerTabIndex: cache.lowerTabIndex,
        pokemonIv: iv,
        parameter: loadStrengthParameter(),
        box: initialBox,
        selectedItemId,
        energyDialogOpen: false,
        boxItemDialogOpen: false,
        boxItemDialogKey: "",
        boxItemDialogIsEdit: false,
        boxExportDialogOpen: false,
        boxImportDialogOpen: false,
        boxDeleteAllDialogOpen: false,
        alertMessage: "",
    };

    // Update initial pokemonIv
    const m = document.location.hash.match(/#p=(.*)/);
    if (m !== null) {
        try {
            ret.pokemonIv = PokemonIv.deserialize(m[1]);
        }
        catch {
            // ignore deserialization error (e.g. corrupted cache)
        }
    }

    return ret;
}

/**
 * Load IvStateCache from localStorage.
 * @returns Loaded IvStateCache.
 */
function loadInitialIvStateCache(): IvStateCache {
    const ret: IvStateCache = {tabIndex: 0, lowerTabIndex: 0, iv: "", selectedIv: ""};

    const settings = localStorage.getItem('PstIvState');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.tabIndex) === "number" &&
        json.tabIndex >= 0 && json.tabIndex <= 2) {
        ret.tabIndex = json.tabIndex;
    }
    if (typeof(json.lowerTabIndex) === "number" &&
        json.lowerTabIndex >= 0 && json.lowerTabIndex <= 2) {
        ret.lowerTabIndex = json.lowerTabIndex;
    }
    if (typeof(json.iv) === "string") {
        ret.iv = json.iv;
    }
    if (typeof(json.selectedIv) === "string") {
        ret.selectedIv = json.selectedIv;
    }
    return ret;
}

/**
 * Save IvState to localStorage.
 * @param state IvState.
 */
function saveIvStateCache(state: IvState) {
    const selectedItem = state.box.getById(state.selectedItemId);
    const cache: IvStateCache = {
        tabIndex: state.tabIndex,
        lowerTabIndex: state.lowerTabIndex,
        iv: state.pokemonIv.serialize(),
        selectedIv: selectedItem === null ? "" : selectedItem.iv.serialize(),
    };
    localStorage.setItem("PstIvState", JSON.stringify(cache));
}

export function ivStateReducer(state: IvState, action: IvAction): IvState {
    const type = action.type;
    const selectedItem = state.box.getById(state.selectedItemId);
    if (type === "changeUpperTab") {
        const value = action.payload.index;
        let lowerTabIndex = state.lowerTabIndex;
        if (value !== 1 && lowerTabIndex === 2) {
            lowerTabIndex = 0;
        }
        const newState = {...state, tabIndex: value, lowerTabIndex};
        saveIvStateCache(newState);
        return newState;
    }
    if (type === "changeLowerTab") {
        const newState = {...state, lowerTabIndex: action.payload.index};
        saveIvStateCache(newState);
        return newState;
    }
    if (type === "changeParameter") {
        const value = action.payload.parameter;
        const newState = normalizeState({...state, parameter: value});
        localStorage.setItem('PstStrenghParam', JSON.stringify(newState.parameter));
        return newState;
    }
    if (type === "openEnergyDialog") {
        return {...state, energyDialogOpen: true};
    }
    if (type === "closeEnergyDialog") {
        return {...state, energyDialogOpen: false};
    }
    if (type === "add") {
        if (!state.box.canAdd) {
            return {...state, alertMessage: 'box is full'};
        }
        return {...state,
            boxItemDialogOpen: true,
            boxItemDialogKey: "dlg" + (new Date()).getTime().toString(),
            boxItemDialogIsEdit: false,
        };
    }
    if (type === "updateIv") {
        const newState = normalizeState({...state, pokemonIv: action.payload.iv});
        saveIvStateCache(newState);
        return newState;
    }
    if (type === "addThis") {
        if (!state.box.canAdd) {
            return {...state, alertMessage: 'box is full'};
        }

        const box = new PokemonBox(state.box.items);
        const selectedItemId: number = box.add(action.payload.iv, action.payload.nickname);
        box.save();
        return {...state, box, selectedItemId};
    }
    if (type === "export") {
        return {...state, boxExportDialogOpen: true};
    }
    if (type === "exportClose") {
        return {...state, boxExportDialogOpen: false};
    }
    if (type === "import") {
        if (!state.box.canAdd) {
            return {...state, alertMessage: 'box is full'};
        }

        return {...state, boxImportDialogOpen: true};
    }
    if (type === "importClose") {
        const box = new PokemonBox(state.box.items);
        return {...state, box, boxImportDialogOpen: false};
    }
    if (type === "deleteAll") {
        return {...state, boxDeleteAllDialogOpen: true};
    }
    if (type === "deleteAllClose") {
        return {...state, boxDeleteAllDialogOpen: false};
    }
    if (type === "restoreItem") {
        if (selectedItem !== null) {
            const newValue = normalizeState({...state, pokemonIv: selectedItem.iv});
            saveIvStateCache(newValue);
            return newValue;
        }
        return state;
    }
    if (type === "saveItem") {
        const nickName = state.box.getById(state.selectedItemId)?.nickname;
        const box = new PokemonBox(state.box.items);
        box.set(state.selectedItemId, state.pokemonIv, nickName);
        box.save();
        const newState = {...state, box};
        saveIvStateCache(newState);
        return newState;
    }

    if (type === "editDialogClose") {
        return {...state, boxItemDialogOpen: false};
    }
    if (type === "addOrEditDone") {
        const value = action.payload.item;
        const box = new PokemonBox(state.box.items);
        let selectedItemId = state.selectedItemId;
        if (value.id === -1) {
            selectedItemId = box.add(value.iv, value.nickname);
        }
        else {
            box.set(value.id, value.iv, value.nickname);
        }
        box.save();
        const newState = normalizeState({...state, pokemonIv: value.iv, box});
        newState.selectedItemId = selectedItemId;
        saveIvStateCache(newState);
        return newState;
    }

    if (type === "showAlert") {
        return {...state, alertMessage: action.payload.message};
    }
    if (type === "closeAlert") {
        return {...state, alertMessage: ""};
    }

    // following action requires item
    if (type !== "select" && type !== "edit" &&
        type !== "dup" && type !== "remove") {
        return state;
    }
    const id = action.payload.id;
    const item = state.box.getById(id);
    if (item === null) { return state; }
    if (type === "select") {
        const newState = normalizeState({...state, pokemonIv: item.iv});
        newState.selectedItemId = id;
        saveIvStateCache(newState);
        return newState;
    }
    else if (type === "edit") {
        return {...state,
            boxItemDialogOpen: true,
            boxItemDialogKey: "dlg" + (new Date()).getTime().toString(),
            boxItemDialogIsEdit: true,
        };
    }
    else if (type === "dup") {
        const box = new PokemonBox(state.box.items);
        const selectedItemId: number = box.add(item.iv.clone(), item.nickname);
        box.save();
        return {...state, box, selectedItemId};
    }
    else if (type === "remove") {
        const box = new PokemonBox(state.box.items);
        box.remove(id);
        box.save();
        return {...state, box};
    }
    return state;
}

export function normalizeState(state: IvState): IvState {
    const selectedItem = state.box.getById(state.selectedItemId);
    state.pokemonIv.normalize();

    // apply event fixedBerries type
    const event = getEventBonus(state.parameter.event,
        state.parameter.customEventBonus);
    if (event !== undefined &&
        event.fixedBerries !== undefined &&
        event.fixedBerries?.length === 3 &&
        event.fixedAreas?.includes(state.parameter.fieldIndex)
    ) {
        let fixRequired = false;
        const isExpert = isExpertField(state.parameter.fieldIndex);
        for (let i = 0; i < 3; i++) {
            if (event.fixedBerries[i] !== null) {
                if (
                    (isExpert && !state.parameter.favoriteType.includes(event.fixedBerries[i])) ||
                    (!isExpert && state.parameter.favoriteType[i] !== event.fixedBerries[i])
                ) {
                    fixRequired = true;
                    break;
                }
            }
        }
        if (fixRequired) {
            state.parameter.favoriteType = [...event.fixedBerries];
            if (state.parameter.favoriteType[1] === null) {
                state.parameter.favoriteType[1] = PokemonTypes
                    .find(x => !state.parameter.favoriteType.includes(x)) ?? "normal";
            }
            if (state.parameter.favoriteType[2] === null) {
                state.parameter.favoriteType[2] = PokemonTypes
                    .find(x => !state.parameter.favoriteType.includes(x)) ?? "normal";
            }
        }
    }

    // fix species count
    if (!state.parameter.berryBurstTeam.auto &&
        state.pokemonIv.pokemon.skill === "Energy for Everyone S (Lunar Blessing)"
    ) {
        const species = state.parameter.berryBurstTeam.members
            .filter(x => x.type === state.pokemonIv.pokemon.type).length + 1;
        if (species <= 2) {
            state.parameter.berryBurstTeam.species = species;
        }
        else {
            state.parameter.berryBurstTeam.species = Math.min(species,
                state.parameter.berryBurstTeam.species);
        }
    }

    // if form pokemon differs from the selected pokemon in the box,
    // unselect the pokemon in the box
    let selectedItemId = state.selectedItemId;
    if (selectedItem !== null) {
        // Ancestor of Evolving pokemon has changed
        if (selectedItem.iv.pokemon.ancestor !== state.pokemonIv.pokemon.ancestor) {
            selectedItemId = -1;
        }
        // Non-evolving pokemon has changed
        if (selectedItem.iv.pokemon.ancestor === null &&
            selectedItem.iv.pokemon.id !== state.pokemonIv.pokemon.id) {
            selectedItemId = -1;
        }
    }

    return {...state, selectedItemId};
}

export default IvState;
