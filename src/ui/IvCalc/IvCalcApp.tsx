import React from 'react';
import { styled } from '@mui/system';
import { Button, Snackbar, Tab, Tabs } from '@mui/material'; 
import PokemonIv from '../../util/PokemonIv';
import { PokemonBoxItem } from '../../util/PokemonBox';
import { toolBarHeight } from '../ToolBar';
import { getInitialIvState, ivStateReducer } from './IvState';
import UpperTabContainer from './UpperTabContainer';
import LowerTabContainer from './LowerTabContainer';
import LowerTabHeader, { lowerTabHeaderHeight } from './LowerTabHeader';
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

/** Height of the upper tab (in pixels) */
const upperTabHeaderHeight = 40;

const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: '4px',
    padding: "0 .5rem",
});
const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const initialIvState = getInitialIvState();

const ResearchCalcApp = React.memo(() => {
    const [state, dispatch] = React.useReducer(ivStateReducer, initialIvState);
    const [upperTabHeight, setUpperTabHeight] = React.useState(0);
    const { t } = useTranslation();
    const width = useDomWidth();

    const selectedItem = state.box.getById(state.selectedItemId);

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
        dispatch({type: "updateIv", payload: {iv: value}});
    }, []);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        dispatch({type: "changeUpperTab", payload: {index: newValue}});
    }, []);

    const onUpperTabSwipe = React.useCallback((newValue: number) => {
        dispatch({type: "changeUpperTab", payload: {index: newValue}});
    }, []);

    const onLowerTabSwipe = React.useCallback((newValue: number) => {
        dispatch({type: "changeLowerTab", payload: {index: newValue}});
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

    const lowerTabBodyY = toolBarHeight + upperTabHeaderHeight +
        upperTabHeight + lowerTabHeaderHeight + 5;

    return <>
        <div style={{position: 'fixed', top: toolBarHeight, width: '100%',
            zIndex: 1, background: '#f9f9f9',
        }}>
            <StyledTabs value={state.tabIndex} onChange={onTabChange}>
                <StyledTab label={t('rp')}/>
                <StyledTab label={t('strength2')}/>
                <StyledTab label={t('rating')}/>
            </StyledTabs>
            <UpperTabContainer index={state.tabIndex} width={width}
                height={upperTabHeight} onHeightChange={setUpperTabHeight}
                onChange={onUpperTabSwipe}
            >
                <div className="tabChild">
                    <RpView state={state} width={width}/>
                </div>
                <div className="tabChild">
                    <StrengthView state={state} dispatch={dispatch}/>
                </div>
                <div className="tabChild">
                    <RatingView pokemonIv={state.pokemonIv} width={width}/>
                </div>
            </UpperTabContainer>
            <LowerTabHeader state={state}
                dispatch={dispatch} isBoxEmpty={state.box.items.length === 0}/>
        </div>
        <LowerTabContainer index={state.lowerTabIndex} y={lowerTabBodyY}
            width={width} onChange={onLowerTabSwipe}
        >
            <div className="tabChild">
                <div style={{margin: '0 0.5rem 10rem 0.5rem'}}>
                    <IvForm pokemonIv={state.pokemonIv} onChange={onPokemonIvChange}/>
                </div>
            </div>
            <div className="tabChild">
                <BoxView items={state.box.items} iv={state.pokemonIv}
                    selectedId={state.selectedItemId} dispatch={dispatch}
                    parameter={state.parameter}/>
            </div>
            <div className="tabChild">
                <StrengthSettingForm value={state.parameter}
                    hasHelpingBonus={state.pokemonIv.hasHelpingBonusInActiveSubSkills}
                    dispatch={dispatch}/>
            </div>
        </LowerTabContainer>
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
