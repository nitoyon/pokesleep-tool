import React from 'react';
import { styled } from '@mui/system';
import { Button, Snackbar, Tab, Tabs } from '@mui/material'; 
import PokemonIv from '../../util/PokemonIv';
import { PokemonBoxItem } from '../../util/PokemonBox';
import { getInitialIvState, ivStateReducer } from './IvState';
import LowerTabHeader from './LowerTabHeader';
import BoxView from './Box/BoxView';
import IvForm from './IvForm/IvForm';
import StrengthSettingForm from './Strength/StrengthParameterForm';
import RpView from './Rp/RpView';
import StrengthView from './Strength/StrengthView';
import RatingView from './RatingView';
import BoxItemDialog from './Box/BoxItemDialog';
import BoxExportDialog from './Box/BoxExportDialog';
import BoxImportDialog from './Box/BoxImportDialog';
import BoxDeleteAllDialog from './Box/BoxDeleteAllDialog';
import { useTranslation } from 'react-i18next';

const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: 'clamp(.3rem, 0.6vh, .7rem)',
});
const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const initialIvState = getInitialIvState();

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

    const onBoxExportDialogClose = React.useCallback(() => {
        dispatch({type: "exportClose"});
    }, []);
    const onBoxImportDialogClose = React.useCallback(() => {
        dispatch({type: "importClose"});
    }, []);
    const onBoxDeleteAllDialogClose = React.useCallback(() => {
        dispatch({type: "deleteAllClose"});
    }, []);

    return <>
        <div style={{padding: "0 .5rem", position: 'sticky', top: 0,
            zIndex: 1, background: '#f9f9f9',
        }}>
            <StyledTabs value={state.tabIndex} onChange={onTabChange}>
                <StyledTab label={t('rp')}/>
                <StyledTab label={t('strength2')}/>
                <StyledTab label={t('rating')}/>
            </StyledTabs>
            {state.tabIndex === 0 && <RpView state={state} width={width}/>}
            {state.tabIndex === 1 && <StrengthView state={state} dispatch={dispatch}/>}
            {state.tabIndex === 2 && <RatingView pokemonIv={state.pokemonIv} width={width}/>}
            {state.pokemonIv.pokemon.rateNotFixed && <div style={{
                border: '1px solid red',
                background: '#ffeeee',
                color: 'red',
                fontSize: '0.9rem',
                borderRadius: '0.5rem',
                marginTop: '3px',
                padding: '0 0.3rem',
            }}>{t('rate is not fixed')}</div>}
            <LowerTabHeader state={state}
                dispatch={dispatch} isBoxEmpty={state.box.items.length === 0}/>
        </div>
        {state.lowerTabIndex === 0 &&
            <div style={{margin: '0 0.5rem 10rem 0.5rem'}}>
                <IvForm parameter={state.parameter} pokemonIv={state.pokemonIv}
                    dispatch={dispatch} onChange={onPokemonIvChange}/>
            </div>}
        {state.lowerTabIndex === 1 &&
            <BoxView items={state.box.items} iv={state.pokemonIv}
                selectedId={state.selectedItemId} dispatch={dispatch}
                parameter={state.parameter}/>}
        {state.lowerTabIndex === 2 &&
            <StrengthSettingForm value={state.parameter}
                hasHelpingBonus={state.pokemonIv.hasHelpingBonusInActiveSubSkills}
                dispatch={dispatch}/>}
        <BoxItemDialog key={state.boxItemDialogKey}
            open={state.boxItemDialogOpen} boxItem={selectedItem}
            isEdit={state.boxItemDialogIsEdit}
            parameter={state.parameter} dispatch={dispatch}
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
