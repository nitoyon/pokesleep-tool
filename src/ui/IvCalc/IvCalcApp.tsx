import React from 'react';
import { styled } from '@mui/system';
import { Tab, Tabs } from '@mui/material'; 
import PokemonIv from '../../util/PokemonIv';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import { CalculateParameter, loadCalculateParameter } from '../../util/PokemonStrength';
import LowerTabHeader from './LowerTabHeader';
import BoxView from './BoxView';
import IvForm from './IvForm';
import StrengthSettingForm from './StrengthParameterForm';
import RpView from './RpView';
import StrengthView from './StrengthView';
import RatingView from './RatingView';
import BoxItemDialog from './BoxItemDialog';
import BoxExportDialog from './BoxExportDialog';
import BoxImportDialog from './BoxImportDialog';
import { Button, Snackbar }  from '@mui/material';
import { useTranslation } from 'react-i18next';

export const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: '.7rem',
});
export const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const defaultCalculateParameter = loadCalculateParameter();

export type IvAction = {
    type: "add"|"unselect"|"export"|"exportClose"|"import"|"importClose"|
        "saveItem"|"restoreItem"|
        "editDialogClose"|"closeAlert";
}|{
    type: "select"|"edit"|"dup"|"remove";
    payload: {id: number};
}|{
    type: "addOrEditDone";
    payload: {item: PokemonBoxItem};
}|{
    type: "addThis";
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
    boxItemDialogOpen: boolean;
    boxItemDialogKey: string;
    boxItemDialogIsEdit: boolean;
    boxExportDialogOpen: boolean;
    boxImportDialogOpen: boolean;
    alertMessage: string;
};
const initialIvState: IvState = {
    tabIndex: 0,
    lowerTabIndex: 0,
    pokemonIv: new PokemonIv("Venusaur"),
    parameter: defaultCalculateParameter,
    box: initialBox,
    selectedItemId: -1,
    boxItemDialogOpen: false,
    boxItemDialogKey: "",
    boxItemDialogIsEdit: false,
    boxExportDialogOpen: false,
    boxImportDialogOpen: false,
    alertMessage: "",
};

const ResearchCalcApp = React.memo(() => {
    const [state, setState] = React.useState<IvState>(initialIvState);
    const { t } = useTranslation();
    const width = useDomWidth();

    const selectedItem = state.box.getById(state.selectedItemId);

    const getStateWhenPokemonIvChange = React.useCallback((value: PokemonIv): IvState => {
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
    }, [selectedItem, state]);

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
        setState(getStateWhenPokemonIvChange(value));
    }, [getStateWhenPokemonIvChange]);

    const onParameterEdit = React.useCallback(() => {
        setState({...state, lowerTabIndex: 2});
    }, [state]);

    // called when user edit pokemon in BoxView
    const onBoxChange = React.useCallback((action: IvAction) => {
        const type = action.type;
        if (type === "changeUpperTab") {
            let value = action.payload.index;
            if (value !== 1 && state.lowerTabIndex === 2) {
                value = 0;
            }
            setState({...state, tabIndex: value});
            return;
        }
        if (type === "changeLowerTab") {
            setState({...state, lowerTabIndex: action.payload.index});
            return;
        }
        if (type === "changeParameter") {
            const value = action.payload.parameter;
            setState({...state, parameter: value});
            localStorage.setItem('PstStrenghParam', JSON.stringify(value));
            return;
        }
        if (type === "add") {
            if (!state.box.canAdd) {
                setState({...state, alertMessage: t('box is full')});
                return;
            }
            setState({...state,
                boxItemDialogOpen: true,
                boxItemDialogKey: "dlg" + (new Date()).getTime().toString(),
                boxItemDialogIsEdit: false,
            });
            return;
        }
        if (type === "addThis") {
            if (!state.box.canAdd) {
                setState({...state, alertMessage: t('box is full')});
                return;
            }

            const box = new PokemonBox(state.box.items);
            const selectedItemId: number = box.add(state.pokemonIv);
            box.save();
            setState({...state, box, selectedItemId});
            return;
        }
        if (type === "export") {
            setState({...state, boxExportDialogOpen: true});
            return;
        }
        if (type === "exportClose") {
            setState({...state, boxExportDialogOpen: false});
            return;
        }
        if (type === "import") {
            if (!state.box.canAdd) {
                setState({...state, alertMessage: t('box is full')});
                return;
            }
    
            setState({...state, boxImportDialogOpen: true});
            return;
        }
        if (type === "importClose") {
            const box = new PokemonBox(state.box.items);
            setState({...state, box, boxImportDialogOpen: false});
            return;
        }
        if (type === "restoreItem") {
            if (selectedItem !== null) {
                setState({...getStateWhenPokemonIvChange(selectedItem.iv)});
            }
            return;
        }
        if (type === "saveItem") {
            const box = new PokemonBox(state.box.items);
            box.set(state.selectedItemId, state.pokemonIv);
            box.save();
            setState({...state, box});
            return;
        }

        if (type === "editDialogClose") {
            setState({...state, boxItemDialogOpen: false});
            return;
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
            const s = getStateWhenPokemonIvChange(value.iv);
            setState({...s, box, selectedItemId});
            return;
        }

        if (type === "closeAlert") {
            setState({...state, alertMessage: ""});
            return;
        }

        // following action requires item
        if (type !== "select" && type !== "edit" &&
            type !== "dup" && type !== "remove")
        {
            return;
        }
        const id = action.payload.id;
        const item = state.box.getById(id);
        if (item === null) { return; }
        if (type === "select") {
            const s = getStateWhenPokemonIvChange(item.iv);
            setState({...s, selectedItemId: id});
        }
        else if (type === "edit") {
            setState({...state,
                boxItemDialogOpen: true,
                boxItemDialogKey: "dlg" + (new Date()).getTime().toString(),
                boxItemDialogIsEdit: true,
            });
        }
        else if (type === "dup") {
            const box = new PokemonBox(state.box.items);
            const selectedItemId: number = box.add(item.iv.clone(), item.nickname);
            box.save();
            setState({...state, box, selectedItemId});
        }
        else if (type === "remove") {
            const box = new PokemonBox(state.box.items);
            box.remove(id);
            box.save();
            setState({...state, box});
        }
    }, [getStateWhenPokemonIvChange, selectedItem, state, t]);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        onBoxChange({type: "changeUpperTab", payload: {index: newValue}});
    }, [onBoxChange]);

    const onParameterChange = React.useCallback((value: CalculateParameter) => {
        onBoxChange({type: "changeParameter", payload: {parameter: value}});
    }, [onBoxChange]);

    const onRestoreClick = React.useCallback(() => {
        onBoxChange({type: "restoreItem"});
    }, [onBoxChange]);
    const onSaveClick = React.useCallback(() => {
        onBoxChange({type: "saveItem"});
    }, [onBoxChange]);

    const onAlertMessageClose = React.useCallback(() => {
        onBoxChange({type: "closeAlert"});
    }, [onBoxChange])

    const onBoxItemEditDialogClose = React.useCallback(() => {
        onBoxChange({type: "editDialogClose"});
    }, [onBoxChange]);

    const onBoxItemDialogChange = React.useCallback((value: PokemonBoxItem) => {
        onBoxChange({type: "addOrEditDone", payload: {item: value}});
    }, [onBoxChange]);

    const isSelectedItemEdited = selectedItem !== null &&
        !selectedItem.iv.isEqual(state.pokemonIv);

    const onHeaderMenuClick = React.useCallback((type: string) => {
        onBoxChange({type} as IvAction);
    }, [onBoxChange]);
    const onBoxExportDialogClose = React.useCallback(() => {
        onBoxChange({type: "exportClose"});
    }, [onBoxChange]);
    const onBoxImportDialogClose = React.useCallback(() => {
        onBoxChange({type: "importClose"});
    }, [onBoxChange]);
    const onLowerTabChange = React.useCallback((value: number) => {
        onBoxChange({type: "changeLowerTab", payload: {index: value}});
    }, [onBoxChange]);

    return <div style={{margin: "0 .5rem 10rem"}}>
        <StyledTabs value={state.tabIndex} onChange={onTabChange}>
            <StyledTab label={t('rp')}/>
            <StyledTab label={t('strength2')}/>
            <StyledTab label={t('rating')}/>
        </StyledTabs>
        {state.tabIndex === 0 && <RpView pokemonIv={state.pokemonIv} width={width}/>}
        {state.tabIndex === 1 && <StrengthView pokemonIv={state.pokemonIv}
            lowerTabIndex={state.lowerTabIndex} parameter={state.parameter}
            onParameterEdit={onParameterEdit}/>}
        {state.tabIndex === 2 && <RatingView pokemonIv={state.pokemonIv} width={width}/>}
        <div>
            <LowerTabHeader upperTabIndex={state.tabIndex} tabIndex={state.lowerTabIndex}
                isBoxEmpty={state.box.items.length === 0}
                onChange={onLowerTabChange}
                onMenuItemClick={onHeaderMenuClick}/>

            {state.lowerTabIndex === 0 &&
                <IvForm pokemonIv={state.pokemonIv} onChange={onPokemonIvChange}/>}
            {state.lowerTabIndex === 1 &&
                <BoxView items={state.box.items}
                    selectedId={state.selectedItemId} onChange={onBoxChange}/>}
            {state.lowerTabIndex === 2 && 
                <StrengthSettingForm value={state.parameter}
                    hasHelpingBonus={state.pokemonIv.hasHelpingBonusInActiveSubSkills}
                    onChange={onParameterChange}/>}
        </div>
        <BoxItemDialog key={state.boxItemDialogKey}
            open={state.boxItemDialogOpen} boxItem={selectedItem}
            isEdit={state.boxItemDialogIsEdit}
            onClose={onBoxItemEditDialogClose} onChange={onBoxItemDialogChange}/>
        <BoxExportDialog box={state.box}
            open={state.boxExportDialogOpen} onClose={onBoxExportDialogClose}/>
        <BoxImportDialog box={state.box}
            open={state.boxImportDialogOpen} onClose={onBoxImportDialogClose}/>
        <Snackbar open={state.alertMessage !== ""} message={state.alertMessage}
            autoHideDuration={2000} onClose={onAlertMessageClose}/>
        <Snackbar open={isSelectedItemEdited} message={t('pokemon in the box is edited')}
            action={<>
                <Button onClick={onRestoreClick}>{t('reset')}</Button>
                <Button onClick={onSaveClick}>{t('save')}</Button>
            </>}/>
    </div>;
});


function useDomWidth() {
    const [width, setWidth] = React.useState(0);
    React.useEffect(() => {
        const handler = () => {
            setWidth(document.documentElement.clientWidth);
        };
        handler();
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("resize", handler);
        };
    }, []);
    return width;
}

export default ResearchCalcApp;
