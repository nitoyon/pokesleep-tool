import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import StrengthSettingForm from './StrengthSettingForm';

export type PeriodType = "1day"|"1week"|"whistle";

const StrengthView = React.memo(({pokemonIv, parameter, onParameterChange}: {
    pokemonIv: PokemonIv,
    parameter: CalculateParameter,
    onParameterChange: (value: CalculateParameter) => void,
}) => {
    const hasHelpingBonus = pokemonIv.hasHelpingBonusInActiveSubSkills;
    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={parameter}/>
        <StrengthSettingForm value={parameter} onChange={onParameterChange}
            hasHelpingBonus={hasHelpingBonus}/>
    </div>);
});

export default StrengthView;
