import React from 'react';
import IvState, { IvAction } from '../IvState';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import StrengthParameterSummary from './StrengthParameterSummary';
import { Collapse } from '@mui/material';
import { useTranslation } from 'react-i18next';

const StrengthView = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const pokemonIv = state.pokemonIv;
    const parameter = state.parameter;
    const lowerTabIndex = state.lowerTabIndex;

    return (<>
        <div style={{padding: "0 .5rem"}}>
            <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}
                energyDialogOpen={state.energyDialogOpen} dispatch={dispatch}/>
            <Collapse in={lowerTabIndex !== 2}>
                <StrengthParameterSummary state={state} dispatch={dispatch}/>
            </Collapse>
        </div>
        {state.pokemonIv.pokemon.rateNotFixed && <div style={{
            border: '1px solid red',
            background: '#ffeeee',
            color: 'red',
            fontSize: '0.9rem',
            borderRadius: '0.5rem',
            margin: '3px 0.5rem',
            padding: '0 0.3rem',
        }}>{t('ratio is not fixed')}</div>}
    </>);
});

export default StrengthView;
