import React from 'react';
import { styled } from '@mui/system';
import { Button, Snackbar, Tab, Tabs } from '@mui/material'; 
import PokemonIv from '../../util/PokemonIv';
import { PokemonBoxItem } from '../../util/PokemonBox';
import { IvAction, ivStateReducer, initialIvState } from './IvState';
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
import BoxDeleteAllDialog from './BoxDeleteAllDialog';
import { useTranslation } from 'react-i18next';

const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: 'clamp(.3rem, 0.6vh, .7rem)',
});
const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const ResearchCalcApp = React.memo(() => {
    const [state, dispatch] = React.useReducer(ivStateReducer, initialIvState);
    const { t } = useTranslation();
    const width = useDomWidth();

    const selectedItem = state.box.getById(state.selectedItemId);

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
        dispatch({type: "updateIv", payload: {iv: value}});
    }, []);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        dispatch({type: "changeUpperTab", payload: {index: newValue}});
    }, []);

    const onRestoreClick = React.useCallback(() => {
        dispatch({type: "restoreItem"});
    }, []);
    const onSaveClick = React.useCallback(() => {
        dispatch({type: "saveItem"});
    }, []);

    const onAlertMessageClose = React.useCallback(() => {
        dispatch({type: "closeAlert"});
    }, [])

    const onBoxItemEditDialogClose = React.useCallback(() => {
        dispatch({type: "editDialogClose"});
    }, []);

    const onBoxItemDialogChange = React.useCallback((value: PokemonBoxItem) => {
        dispatch({type: "addOrEditDone", payload: {item: value}});
    }, []);

    const isSelectedItemEdited = selectedItem !== null &&
        !selectedItem.iv.isEqual(state.pokemonIv);

    const onHeaderMenuClick = React.useCallback((type: string) => {
        dispatch({type} as IvAction);
    }, []);
    const onBoxExportDialogClose = React.useCallback(() => {
        dispatch({type: "exportClose"});
    }, []);
    const onBoxImportDialogClose = React.useCallback(() => {
        dispatch({type: "importClose"});
    }, []);
    const onBoxDeleteAllDialogClose = React.useCallback(() => {
        dispatch({type: "deleteAllClose"});
    }, []);
    const onLowerTabChange = React.useCallback((value: number) => {
        dispatch({type: "changeLowerTab", payload: {index: value}});
    }, []);

    return <>
        <div style={{margin: "0 .5rem", position: 'sticky', top: 0,
            zIndex: 1, background: '#f9f9f9',
        }}>
            <StyledTabs value={state.tabIndex} onChange={onTabChange}>
                <StyledTab label={t('rp')}/>
                <StyledTab label={t('strength2')}/>
                <StyledTab label={t('rating')}/>
            </StyledTabs>
            {state.tabIndex === 0 && <RpView pokemonIv={state.pokemonIv} width={width}/>}
            {state.tabIndex === 1 && <StrengthView state={state} dispatch={dispatch}/>}
            {state.tabIndex === 2 && <RatingView pokemonIv={state.pokemonIv} width={width}/>}
            {state.pokemonIv.pokemon.ratioNotFixed && <div style={{
                border: '1px solid red',
                background: '#ffeeee',
                color: 'red',
                fontSize: '0.9rem',
                borderRadius: '0.5rem',
                marginTop: '3px',
                padding: '0 0.3rem',
            }}>{t('ratio is not fixed')}</div>}
            <LowerTabHeader upperTabIndex={state.tabIndex} tabIndex={state.lowerTabIndex}
                isBoxEmpty={state.box.items.length === 0}
                onChange={onLowerTabChange}
                onMenuItemClick={onHeaderMenuClick}/>
        </div>
        <div style={{margin: "0 .5rem"}}>
            {state.lowerTabIndex === 0 &&
                <div style={{marginBottom: '10rem'}}>
                    <IvForm pokemonIv={state.pokemonIv} onChange={onPokemonIvChange}/>
                </div>}
            {state.lowerTabIndex === 1 &&
                <BoxView items={state.box.items}
                    selectedId={state.selectedItemId} dispatch={dispatch}/>}
            {state.lowerTabIndex === 2 && 
                <StrengthSettingForm value={state.parameter}
                    hasHelpingBonus={state.pokemonIv.hasHelpingBonusInActiveSubSkills}
                    dispatch={dispatch}/>}
        </div>
        <BoxItemDialog key={state.boxItemDialogKey}
            open={state.boxItemDialogOpen} boxItem={selectedItem}
            isEdit={state.boxItemDialogIsEdit}
            onClose={onBoxItemEditDialogClose} onChange={onBoxItemDialogChange}/>
        <BoxExportDialog box={state.box}
            open={state.boxExportDialogOpen} onClose={onBoxExportDialogClose}/>
        <BoxImportDialog box={state.box}
            open={state.boxImportDialogOpen} onClose={onBoxImportDialogClose}/>
        <BoxDeleteAllDialog box={state.box}
            open={state.boxDeleteAllDialogOpen} onClose={onBoxDeleteAllDialogClose}/>
        <Snackbar open={state.alertMessage !== ""} message={t(state.alertMessage)}
            autoHideDuration={2000} onClose={onAlertMessageClose}/>
        <Snackbar open={isSelectedItemEdited} message={t('pokemon in the box is edited')}
            action={<>
                <Button onClick={onRestoreClick}>{t('reset')}</Button>
                <Button onClick={onSaveClick}>{t('save')}</Button>
            </>}/>
    </>;
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
