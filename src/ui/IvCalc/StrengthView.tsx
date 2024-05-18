import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter, loadCalculateParameter } from '../../util/PokemonStrength';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import StrengthSettingForm from './StrengthSettingForm';

export type PeriodType = "1day"|"1week"|"whistle";

const StrengthView = React.memo(({pokemonIv}: {pokemonIv: PokemonIv}) => {
    let [settings, setAdvancedSettings] = React.useState<CalculateParameter|null>(null);
    if (settings === null) {
        settings = loadCalculateParameter();
    }

    const onAdvancedSettingsChange = React.useCallback((value: CalculateParameter) => {
        setAdvancedSettings(value);
        localStorage.setItem('PstStrenghParam', JSON.stringify(value));
    }, [setAdvancedSettings]);

    // fix helpingBonusCount
    const hasHelpingBonus = pokemonIv.hasHelpingBonusInActiveSubSkills;
    const prevHasHelpingBonus = React.useRef<boolean>(hasHelpingBonus);
    React.useEffect(() => {
        prevHasHelpingBonus.current = hasHelpingBonus;
    }, [hasHelpingBonus]);
    if (hasHelpingBonus && settings.helpBonusCount === 0) {
        settings.helpBonusCount = 1;
    } else if (settings.helpBonusCount === 1 && !hasHelpingBonus &&
        prevHasHelpingBonus.current) {
        settings.helpBonusCount = 0;
    } else if (!hasHelpingBonus && settings.helpBonusCount === 5) {
        settings.helpBonusCount = 4;
    }

    return (<div>
        <StrengthBerryIngSkillView pokemonIv={pokemonIv} settings={settings}/>
        <StrengthSettingForm value={settings} onChange={onAdvancedSettingsChange}
            hasHelpingBonus={hasHelpingBonus}/>
    </div>);
});

export default StrengthView;
