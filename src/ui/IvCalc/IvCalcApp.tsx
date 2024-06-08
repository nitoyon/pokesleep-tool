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
};

const initialBox = new PokemonBox();
initialBox.load();

const ResearchCalcApp = React.memo(() => {
    const [tabIndex, setTabIndex] = React.useState(0);
    const [lowerTabIndex, setLowerTabIndex] = React.useState(0);
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Venusaur"));
    const [parameter, setParameter] = React.useState(defaultCalculateParameter);
    const [box, setBox] = React.useState<PokemonBox>(initialBox);
    const [selectedItemId, setSelectedItemId] = React.useState(-1);
    const [boxItemDialogOpen, setBoxItemDialogOpen] = React.useState(false);
    const [boxItemDialogKey, setBoxItemDialogKey] = React.useState("");
    const [boxItemDialogIsEdit, setBoxItemDialogIsEdit] = React.useState(false);
    const [boxExportDialogOpen, setBoxExportDialogOpen] = React.useState(false);
    const [boxImportDialogOpen, setBoxImportDialogOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const { t } = useTranslation();
    const width = useDomWidth();

    const selectedItem = box.getById(selectedItemId);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        if (newValue !== 1 && lowerTabIndex === 2) {
            setLowerTabIndex(0);
        }
    }, [lowerTabIndex, setTabIndex, setLowerTabIndex]);

    const onParameterChange = React.useCallback((value: CalculateParameter) => {
        setParameter(value);
        localStorage.setItem('PstStrenghParam', JSON.stringify(value));
    }, [setParameter]);

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
        // fix helpingBonusCount
        const hasHelpingBonus = value.hasHelpingBonusInActiveSubSkills;
        const prevHasHelpingBonus = pokemonIv.hasHelpingBonusInActiveSubSkills;
        if (hasHelpingBonus && parameter.helpBonusCount === 0) {
            onParameterChange({...parameter, helpBonusCount: 1});
        } else if (parameter.helpBonusCount === 1 && !hasHelpingBonus &&
            prevHasHelpingBonus) {
            onParameterChange({...parameter, helpBonusCount: 0});
        } else if (!hasHelpingBonus && parameter.helpBonusCount === 5) {
            onParameterChange({...parameter, helpBonusCount: 4});
        }

        value.normalize();

        // if form pokemon differs from the selected pokemon in the box,
        // unselect the pokemon in the box
        if (selectedItem !== null) {
            // Ancestor of Evolving pokemon has changed
            if (selectedItem.iv.pokemon.ancestor !== value.pokemon.ancestor) {
                setSelectedItemId(-1);
            }
            // Non-evolving pokemon has changed
            if (selectedItem.iv.pokemon.ancestor === null &&
                selectedItem.iv.pokemon.id !== value.pokemon.id) {
                setSelectedItemId(-1);
            }
        }

        setPokemonIv(value);
    }, [parameter, pokemonIv, selectedItem, setPokemonIv, onParameterChange]);

    const onParameterEdit = React.useCallback(() => {
        setLowerTabIndex(2);
    }, [setLowerTabIndex]);

    // called when user edit pokemon in BoxView
    const onBoxChange = React.useCallback((action: IvAction) => {
        const type = action.type;
        if (type === "add") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }
            setBoxItemDialogOpen(true);
            setBoxItemDialogKey("dlg" + (new Date()).getTime().toString());
            setBoxItemDialogIsEdit(false);
            return;
        }
        if (type === "addThis") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }

            const newBox = new PokemonBox(box.items);
            const id: number = newBox.add(pokemonIv);
            newBox.save();
            setBox(newBox);
            setSelectedItemId(id);
            return;
        }
        if (type === "export") {
            setBoxExportDialogOpen(true);
            return;
        }
        if (type === "exportClose") {
            setBoxExportDialogOpen(false);
            return;
        }
        if (type === "import") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }
    
            setBoxImportDialogOpen(true);
            return;
        }
        if (type === "importClose") {
            setBoxImportDialogOpen(false);
            const newBox = new PokemonBox(box.items);
            setBox(newBox);
            return;
        }
        if (type === "restoreItem") {
            if (selectedItem !== null) {
                onPokemonIvChange(selectedItem.iv);
            }
            return;
        }
        if (type === "saveItem") {
            const newBox = new PokemonBox(box.items);
            newBox.set(selectedItemId, pokemonIv);
            newBox.save();
            setBox(newBox);
            return;
        }

        if (type === "editDialogClose") {
            setBoxItemDialogOpen(false);
            return;
        }
        if (type === "addOrEditDone") {
            const value = action.payload.item;
            const newBox = new PokemonBox(box.items);
            if (value.id === -1) {
                const id = newBox.add(value.iv, value.nickname);
                setSelectedItemId(id);
            }
            else {
                newBox.set(value.id, value.iv, value.nickname);
            }
            newBox.save();
            setBox(newBox);
            onPokemonIvChange(value.iv);
            return;
        }

        if (type === "closeAlert") {
            setAlertMessage("");
            return;
        }

        // following action requires item
        if (type !== "select" && type !== "edit" &&
            type !== "dup" && type !== "remove")
        {
            return;
        }
        const id = action.payload.id;
        const item = box.getById(id);
        if (item === null) { return; }
        if (type === "select") {
            setSelectedItemId(id);
            onPokemonIvChange(item.iv);
        }
        else if (type === "edit") {
            setBoxItemDialogOpen(true);
            setBoxItemDialogKey("dlg" + (new Date()).getTime().toString());
            setBoxItemDialogIsEdit(true);
        }
        else if (type === "dup") {
            const newBox = new PokemonBox(box.items);
            const id: number = newBox.add(item.iv.clone(), item.nickname);
            newBox.save();
            setBox(newBox);
            setSelectedItemId(id);
        }
        else if (type === "remove") {
            const newBox = new PokemonBox(box.items);
            newBox.remove(id);
            newBox.save();
            setBox(newBox);
        }
    }, [box, pokemonIv, selectedItem, selectedItemId, t, onPokemonIvChange]);

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
        !selectedItem.iv.isEqual(pokemonIv);

    const onHeaderMenuClick = React.useCallback((type: string) => {
        onBoxChange({type} as IvAction);
    }, [onBoxChange]);
    const onBoxExportDialogClose = React.useCallback(() => {
        onBoxChange({type: "exportClose"});
    }, [onBoxChange]);
    const onBoxImportDialogClose = React.useCallback(() => {
        onBoxChange({type: "importClose"});
    }, [onBoxChange]);

    return <div style={{margin: "0 .5rem 10rem"}}>
        <StyledTabs value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('rp')}/>
            <StyledTab label={t('strength2')}/>
            <StyledTab label={t('rating')}/>
        </StyledTabs>
        {tabIndex === 0 && <RpView pokemonIv={pokemonIv} width={width}/>}
        {tabIndex === 1 && <StrengthView pokemonIv={pokemonIv}
            lowerTabIndex={lowerTabIndex} parameter={parameter}
            onParameterEdit={onParameterEdit}/>}
        {tabIndex === 2 && <RatingView pokemonIv={pokemonIv} width={width}/>}
        <div>
            <LowerTabHeader upperTabIndex={tabIndex} tabIndex={lowerTabIndex}
                isBoxEmpty={box.items.length === 0} onChange={setLowerTabIndex}
                onMenuItemClick={onHeaderMenuClick}/>

            {lowerTabIndex === 0 &&
                <IvForm pokemonIv={pokemonIv} onChange={onPokemonIvChange}/>}
            {lowerTabIndex === 1 &&
                <BoxView items={box.items}
                    selectedId={selectedItemId} onChange={onBoxChange}/>}
            {lowerTabIndex === 2 && 
                <StrengthSettingForm value={parameter}
                    hasHelpingBonus={pokemonIv.hasHelpingBonusInActiveSubSkills}
                    onChange={onParameterChange}/>}
        </div>
        <BoxItemDialog key={boxItemDialogKey}
            open={boxItemDialogOpen} boxItem={selectedItem}
            isEdit={boxItemDialogIsEdit}
            onClose={onBoxItemEditDialogClose} onChange={onBoxItemDialogChange}/>
        <BoxExportDialog box={box}
            open={boxExportDialogOpen} onClose={onBoxExportDialogClose}/>
        <BoxImportDialog box={box}
            open={boxImportDialogOpen} onClose={onBoxImportDialogClose}/>
        <Snackbar open={alertMessage !== ""} message={alertMessage}
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
