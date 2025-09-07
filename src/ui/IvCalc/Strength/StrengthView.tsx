import React from 'react';
import IvState, { IvAction } from '../IvState';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import StrengthParameterSummary from './StrengthParameterSummary';
import { Collapse } from '@mui/material';

const StrengthView = React.memo(({state, dispatch}: {
    state: IvState,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const pokemonIv = state.pokemonIv;
    const parameter = state.parameter;
    const lowerTabIndex = state.lowerTabIndex;

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}
            energyDialogOpen={state.energyDialogOpen} dispatch={dispatch}/>
        <Collapse in={lowerTabIndex !== 2}>
            <StrengthParameterSummary state={state} dispatch={dispatch}/>
        </Collapse>
    </div>);
});

export default StrengthView;
