import React from 'react';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import BoxView from './BoxView';
import IvForm from './IvForm';
import BoxItemDialog from './BoxItemDialog';
import BoxExportDialog from './BoxExportDialog';
import BoxImportDialog from './BoxImportDialog';
import StrengthSettingForm from './StrengthParameterForm';
import LowerTabHeader from './LowerTabHeader';
import { Button, Snackbar }  from '@mui/material';
import { useTranslation } from 'react-i18next';

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

const LowerTabView = React.memo(({
    pokemonIv, parameter, upperTabIndex, tabIndex,
    onChange, onTabIndexChange, onParameterChange,
}: {
    pokemonIv: PokemonIv,
    parameter: CalculateParameter,
    upperTabIndex: number,
    tabIndex: number,
    onChange: (value: PokemonIv) => void,
    onTabIndexChange: (value: number) => void,
    onParameterChange: (value: CalculateParameter) => void,
}) => {
    const [box, setBox] = React.useState<PokemonBox>(initialBox);
    const [selectedItemId, setSelectedItemId] = React.useState(-1);
    const [boxItemDialogOpen, setBoxItemDialogOpen] = React.useState(false);
    const [boxItemDialogKey, setBoxItemDialogKey] = React.useState("");
    const [boxItemDialogIsEdit, setBoxItemDialogIsEdit] = React.useState(false);
    const [boxExportDialogOpen, setBoxExportDialogOpen] = React.useState(false);
    const [boxImportDialogOpen, setBoxImportDialogOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const { t } = useTranslation();

    const selectedItem = box.getById(selectedItemId);

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
                onChange(selectedItem.iv);
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
            onChange(value.iv);
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
            onChange(item.iv);
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
    }, [box, pokemonIv, selectedItem, selectedItemId, t, onChange]);

    // called when IV is edited in IvForm
    const onFormChange = React.useCallback((iv: PokemonIv) => {
        // if form pokemon differs from the selected pokemon in the box,
        // unselect the pokemon in the box
        if (selectedItem !== null) {
            // Ancestor of Evolving pokemon has changed
            if (selectedItem.iv.pokemon.ancestor !== iv.pokemon.ancestor) {
                setSelectedItemId(-1);
            }
            // Non-evolving pokemon has changed
            if (selectedItem.iv.pokemon.ancestor === null &&
                selectedItem.iv.pokemon.id !== iv.pokemon.id) {
                setSelectedItemId(-1);
            }
        }

        // notify to parent component
        onChange(iv);
    }, [selectedItem, onChange]);

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

    return (<div>
        <LowerTabHeader upperTabIndex={upperTabIndex} tabIndex={tabIndex}
            isBoxEmpty={box.items.length === 0} onChange={onTabIndexChange}
            onMenuItemClick={onHeaderMenuClick}/>

        {tabIndex === 0 &&
            <IvForm pokemonIv={pokemonIv} onChange={onFormChange}/>}
        {tabIndex === 1 &&
            <BoxView items={box.items}
                selectedId={selectedItemId} onChange={onBoxChange}/>}
        {tabIndex === 2 && 
            <StrengthSettingForm value={parameter}
                hasHelpingBonus={pokemonIv.hasHelpingBonusInActiveSubSkills}
                onChange={onParameterChange}/>}
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
    </div>);
});

export default LowerTabView;
