import React from 'react';
import { styled } from '@mui/system';
import { StyledTab, StyledTabs } from './IvCalcApp';
import PokemonBox, { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import BoxView from './BoxView';
import IvForm from './IvForm';
import BoxItemDialog from './BoxItemDialog';
import BoxExportDialog from './BoxExportDialog';
import BoxImportDialog from './BoxImportDialog';
import StrengthSettingForm from './StrengthParameterForm';
import { Button, IconButton, ListItemIcon, Menu, MenuItem, MenuList,
    Snackbar }  from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MoreIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

export type BoxItemActionType = "select"|"add"|"edit"|"dup"|"remove";

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
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const [boxItemDialogOpen, setBoxItemDialogOpen] = React.useState(false);
    const [boxItemDialogKey, setBoxItemDialogKey] = React.useState("");
    const [boxItemDialogIsEdit, setBoxItemDialogIsEdit] = React.useState(false);
    const [boxExportDialogOpen, setBoxExportDialogOpen] = React.useState(false);
    const [boxImportDialogOpen, setBoxImportDialogOpen] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const { t } = useTranslation();

    const isIvMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 0;
    const isBoxMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 1;
    const boxTabRef = React.useRef<HTMLDivElement | null>(null);
    const selectedItem = box.getById(selectedItemId);

    const onAddToBoxClick = React.useCallback(() => {
        setMoreMenuAnchor(null);

        if (!box.canAdd) {
            setAlertMessage(t('box is full'));
            return;
        }

        const id: number = box.add(pokemonIv);
        box.save();
        setItems(box.items);
        setSelectedItemId(id);
        startAddToBoxAnimation(boxTabRef.current);
    }, [pokemonIv, t]);

    const onPokemonTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        onTabIndexChange(newValue);
        setMoreMenuAnchor(null);
    }, [onTabIndexChange]);
    const moreButtonClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    }, [setMoreMenuAnchor]);
    const onMoreMenuClose = React.useCallback(() => {
        setMoreMenuAnchor(null);
    }, [setMoreMenuAnchor]);

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
    }, [t, onChange]);

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

    const onBoxExportClick = React.useCallback(() => {
        setBoxExportDialogOpen(true);
        setMoreMenuAnchor(null);
    }, []);
    const onBoxExportDialogClose = React.useCallback(() => {
        setBoxExportDialogOpen(false);
    }, []);

    const onBoxImportClick = React.useCallback(() => {
        setMoreMenuAnchor(null);

        if (!box.canAdd) {
            setAlertMessage(t('box is full'));
            return;
        }

        setBoxImportDialogOpen(true);
    }, [t]);
    const onBoxImportDialogClose = React.useCallback(() => {
        setBoxImportDialogOpen(false);
        setItems(box.items);
    }, []);

    return (<StyledContainer>
        {tabIndex !== 2 && <IconButton aria-label="actions" color="inherit" onClick={moreButtonClick}>
            <MoreIcon />
        </IconButton>}
        <StyledTabs value={tabIndex} onChange={onPokemonTabChange}>
            <StyledTab label={t('pokemon')}/>
            <StyledTab label={t('box')} ref={boxTabRef}/>
            {upperTabIndex === 1 && <StyledTab label={t('parameter')}/>}
        </StyledTabs>

        {tabIndex === 0 &&
            <IvForm pokemonIv={pokemonIv} onChange={onFormChange}/>}
        {tabIndex === 1 &&
            <BoxView items={items}
                selectedId={selectedItemId} onChange={onBoxChange}/>}
        {tabIndex === 2 && 
            <StrengthSettingForm value={parameter}
                hasHelpingBonus={pokemonIv.hasHelpingBonusInActiveSubSkills}
                onChange={onParameterChange}/>}
        <Menu anchorEl={moreMenuAnchor} open={isIvMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
            <MenuList>
                <MenuItem onClick={onAddToBoxClick}>
                    <ListItemIcon><AddCircleOutlineIcon/></ListItemIcon>
                    {t('add to box')}
                </MenuItem>
            </MenuList>
        </Menu>
        <Menu anchorEl={moreMenuAnchor} open={isBoxMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
            <MenuList>
                <MenuItem disabled={box.items.length === 0} onClick={onBoxExportClick}>
                    <ListItemIcon><FileUploadIcon/></ListItemIcon>
                    {t('export')}
                </MenuItem>
                <MenuItem onClick={onBoxImportClick}>
                    <ListItemIcon><FileDownloadIcon/></ListItemIcon>
                    {t('import')}
                </MenuItem>
            </MenuList>
        </Menu>
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
    </StyledContainer>);
});

const StyledContainer = styled('div')({
    'marginTop': '0.8rem',
    '& > button.MuiIconButton-root': {
        float: 'right',
        color: '#999',
    },
});

/**
 * Starts an animation to indicate that the Pokémon has been added to the box.
 * @param elm box tab element.
 */
function startAddToBoxAnimation(elm: HTMLDivElement|null) {
    if (elm === null) { return; }
    const rect = elm.getBoundingClientRect();
    const left = rect.x + window.scrollX;
    const top = rect.y + window.scrollY;
    const fromWidth = document.documentElement.clientWidth;
    const fromHeight = 400; // height of IvForm

    const div = document.createElement('div');
    div.style.position = "absolute";
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    div.style.background = "#1976d2";
    div.style.opacity = "0.6";
    div.style.transformOrigin = "top left";
    document.body.appendChild(div);
    const animation = div.animate([
        {transform: `translateX(${-left}px) translateY(${rect.height}px) ` +
            `scale(${fromWidth / rect.width}, ${fromHeight / rect.height})`},
        {transform: 'translateX(0) translateY(0) scale(1, 1)', opacity: 0.1}
    ], {
        duration: 200,
        easing: 'ease-out',
        iterations: 1
    });
    animation.onfinish = (e: any) => {
        document.body.removeChild(div);
    };
}

export default LowerTabView;