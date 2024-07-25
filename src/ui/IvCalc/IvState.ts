import PokemonIv from '../../util/PokemonIv';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import { CalculateParameter, loadCalculateParameter } from '../../util/PokemonStrength';

const defaultCalculateParameter = loadCalculateParameter();

export type IvAction = {
    type: "add"|"unselect"|"export"|"exportClose"|"import"|"importClose"|
        "deleteAll" | "deleteAllClose" | "saveItem"|"restoreItem"|
        "editDialogClose"|"closeAlert"|"openEnergyDialog"|"closeEnergyDialog";
}|{
    type: "select"|"edit"|"dup"|"remove";
    payload: {id: number};
}|{
    type: "addOrEditDone";
    payload: {item: PokemonBoxItem};
}|{
    type: "addThis"|"updateIv";
    payload: {iv: PokemonIv};
}|{
    type: "changeUpperTab"|"changeLowerTab",
    payload: {index: number},
}|{
    type: "changeParameter",
    payload: {parameter: CalculateParameter},
};

const initialBox = new PokemonBox();
initialBox.load();

type IvState = {
    tabIndex: number;
    lowerTabIndex: number;
    pokemonIv: PokemonIv;
    parameter: CalculateParameter;
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
export const initialIvState: IvState = {
    tabIndex: 0,
    lowerTabIndex: 0,
    pokemonIv: new PokemonIv("Venusaur"),
    parameter: defaultCalculateParameter,
    box: initialBox,
    selectedItemId: -1,
    energyDialogOpen: false,
    boxItemDialogOpen: false,
    boxItemDialogKey: "",
    boxItemDialogIsEdit: false,
    boxExportDialogOpen: false,
    boxImportDialogOpen: false,
    boxDeleteAllDialogOpen: false,
    alertMessage: "",
};

export function ivStateReducer(state: IvState, action: IvAction): IvState {
    const type = action.type;
    const selectedItem = state.box.getById(state.selectedItemId);
    if (type === "changeUpperTab") {
        let value = action.payload.index;
        let lowerTabIndex = state.lowerTabIndex;
        if (value !== 1 && lowerTabIndex === 2) {
            lowerTabIndex = 0;
        }
        return {...state, tabIndex: value, lowerTabIndex};
    }
    if (type === "changeLowerTab") {
        return {...state, lowerTabIndex: action.payload.index};
    }
    if (type === "changeParameter") {
        const value = action.payload.parameter;
        localStorage.setItem('PstStrenghParam', JSON.stringify(value));
        return {...state, parameter: value};
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
        return getStateWhenPokemonIvChange(state, action.payload.iv);
    }
    if (type === "addThis") {
        if (!state.box.canAdd) {
            return {...state, alertMessage: 'box is full'};
        }

        const box = new PokemonBox(state.box.items);
        const selectedItemId: number = box.add(state.pokemonIv);
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
            return {...getStateWhenPokemonIvChange(state, selectedItem.iv)};
        }
        return state;
    }
    if (type === "saveItem") {
        const box = new PokemonBox(state.box.items);
        box.set(state.selectedItemId, state.pokemonIv);
        box.save();
        return {...state, box};
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
        const s = getStateWhenPokemonIvChange(state, value.iv);
        return {...s, box, selectedItemId};
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
        const s = getStateWhenPokemonIvChange(state, item.iv);
        return {...s, selectedItemId: id};
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

function getStateWhenPokemonIvChange(state: IvState, value: PokemonIv): IvState {
    const selectedItem = state.box.getById(state.selectedItemId);

    // fix helpingBonusCount
    const hasHelpingBonus = value.hasHelpingBonusInActiveSubSkills;
    const prevHasHelpingBonus = state.pokemonIv.hasHelpingBonusInActiveSubSkills;
    let parameter = state.parameter;
    if (hasHelpingBonus && parameter.helpBonusCount === 0) {
        parameter = {...parameter, helpBonusCount: 1};
    } else if (state.parameter.helpBonusCount === 1 && !hasHelpingBonus &&
        prevHasHelpingBonus) {
        parameter = {...parameter, helpBonusCount: 0};
    } else if (!hasHelpingBonus && parameter.helpBonusCount === 5) {
        parameter = {...parameter, helpBonusCount: 4};
    }

    // fix recoveryBonusCount
    const hasRecoveryBonus = value.hasEnergyRecoveryBonusInActiveSubSkills;
    const prevHasRecoveryBonus = state.pokemonIv.hasEnergyRecoveryBonusInActiveSubSkills;
    if (hasRecoveryBonus && parameter.recoveryBonusCount === 0) {
        parameter = {...parameter, recoveryBonusCount: 1};
    } else if (state.parameter.recoveryBonusCount === 1 && !hasRecoveryBonus &&
        prevHasRecoveryBonus) {
        parameter = {...parameter, recoveryBonusCount: 0};
    } else if (!hasRecoveryBonus && parameter.recoveryBonusCount === 5) {
        parameter = {...parameter, recoveryBonusCount: 4};
    }

    value.normalize();

    // if form pokemon differs from the selected pokemon in the box,
    // unselect the pokemon in the box
    let selectedItemId = state.selectedItemId;
    if (selectedItem !== null) {
        // Ancestor of Evolving pokemon has changed
        if (selectedItem.iv.pokemon.ancestor !== value.pokemon.ancestor) {
            selectedItemId = -1;
        }
        // Non-evolving pokemon has changed
        if (selectedItem.iv.pokemon.ancestor === null &&
            selectedItem.iv.pokemon.id !== value.pokemon.id) {
                selectedItemId = -1;
            }
    }

    return {...state, pokemonIv: value, parameter, selectedItemId};
}

export default IvState;
