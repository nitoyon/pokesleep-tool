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

export type BoxItemActionType = "select"|"add"|"edit"|"dup"|"remove"|
    "addToBox"|"export"|"import";

const box = new PokemonBox();
box.load();
const initialBoxItems = box.items;

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
    const [items, setItems] = React.useState<PokemonBoxItem[]>(initialBoxItems);
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
    const onBoxChange = React.useCallback((id: number, action: BoxItemActionType) => {
        if (action === "add") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }
            setBoxItemDialogOpen(true);
            setBoxItemDialogKey("dlg" + (new Date()).getTime().toString());
            setBoxItemDialogIsEdit(false);
            return;
        }
        if (action === "addToBox") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }

            const id: number = box.add(pokemonIv);
            box.save();
            setItems(box.items);
            setSelectedItemId(id);
            return;
        }
        if (action === "export") {
            setBoxExportDialogOpen(true);
            return;
        }
        if (action === "import") {
            if (!box.canAdd) {
                setAlertMessage(t('box is full'));
                return;
            }
    
            setBoxImportDialogOpen(true);
            return;
        }
 
        // following action requires item
        const item = box.getById(id);
        if (item === null) { return; }
        if (action === "select") {
            setSelectedItemId(id);
            onChange(item.iv);
        }
        else if (action === "edit") {
            setBoxItemDialogOpen(true);
            setBoxItemDialogKey("dlg" + (new Date()).getTime().toString());
            setBoxItemDialogIsEdit(true);
        }
        else if (action === "dup") {
            const id: number = box.add(item.iv.clone(), item.nickname);
            box.save();
            setItems(box.items);
            setSelectedItemId(id);
        }
        else if (action === "remove") {
            box.remove(id);
            box.save();
            setItems(box.items);
        }
    }, [pokemonIv, t, onChange]);

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
        if (selectedItem !== null) {
            onChange(selectedItem.iv);
        }
    }, [onChange, selectedItem]);
    const onSaveClick = React.useCallback(() => {
        box.set(selectedItemId, pokemonIv);
        box.save();
        setItems(box.items);
    }, [pokemonIv, selectedItemId]);

    const onAlertMessageClose = React.useCallback(() => {
        setAlertMessage("");
    }, [])

    const onBoxItemEditDialogClose = React.useCallback(() => {
        setBoxItemDialogOpen(false);
    }, []);

    const onBoxItemDialogChange = React.useCallback((value: PokemonBoxItem) => {
        if (value.id === -1) {
            const id = box.add(value.iv, value.nickname);
            setSelectedItemId(id);
        }
        else {
            box.set(value.id, value.iv, value.nickname);
        }
        box.save();
        setItems(box.items);
        onChange(value.iv);
    }, [onChange]);

    const isSelectedItemEdited = selectedItem !== null &&
        !selectedItem.iv.isEqual(pokemonIv);

    const onHeaderMenuClick = React.useCallback((type: string) => {
        onBoxChange(-1, type as BoxItemActionType);
    }, [onBoxChange]);
    const onBoxExportDialogClose = React.useCallback(() => {
        setBoxExportDialogOpen(false);
    }, []);
    const onBoxImportDialogClose = React.useCallback(() => {
        setBoxImportDialogOpen(false);
        setItems(box.items);
    }, []);

    return (<div>
        <LowerTabHeader upperTabIndex={upperTabIndex} tabIndex={tabIndex}
            isBoxEmpty={box.items.length === 0} onChange={onTabIndexChange}
            onMenuItemClick={onHeaderMenuClick}/>

        {tabIndex === 0 &&
            <IvForm pokemonIv={pokemonIv} onChange={onFormChange}/>}
        {tabIndex === 1 &&
            <BoxView items={items}
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
