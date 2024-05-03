import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter } from '../../util/PokemonStrength';
import StrengthBerryIngSkillView from './StrengthBerryIngSkillView';
import StrengthSettingForm from './StrengthSettingForm';

export type PeriodType = "1day"|"1week"|"whistle";

function loadDefaultSettingsProps(): CalculateParameter {
    const ret: CalculateParameter = {
        period: 24,
        fieldBonus: 0,
        favorite: false,
        helpBonusCount: 0,
        isGoodCampTicketSet: false,
        averageEfficiency: 1.8452,
        tapFrequency: "always",
        recipeBonus: 25,
        recipeLevel: 30,
        event: "none",
    };

    const settings = localStorage.getItem('PstStrenghParam');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.period) === "number" &&
        [24, 168, 3].includes(json.period)) {
        ret.period = json.period;
    }
    if (typeof(json.fieldBonus) === "number" &&
        Math.floor(json.fieldBonus / 5) === json.fieldBonus / 5 &&
        json.fieldBonus >= 0 && json.fieldBonus <= 60) {
        ret.fieldBonus = json.fieldBonus;
    }
    if (typeof(json.favorite) === "boolean") {
        ret.favorite = json.favorite;
    }
    if (typeof(json.helpBonusCount) === "number" &&
        Math.floor(json.helpBonusCount) === json.helpBonusCount &&
        json.helpBonusCount >= 0 && json.helpBonusCount <= 4) {
        ret.helpBonusCount = json.helpBonusCount;
    }
    if (typeof(json.isGoodCampTicketSet) === "boolean") {
        ret.isGoodCampTicketSet = json.isGoodCampTicketSet;
    }
    if (typeof(json.tapFrequency) === "string" &&
        ["always", "none"].includes(json.tapFrequency)) {
        ret.tapFrequency = json.tapFrequency;
    }
    if (typeof(json.recipeBonus) === "number" &&
        [0, 6, 11, 17, 25, 35, 48].includes(json.recipeBonus)) {
        ret.recipeBonus = json.recipeBonus;
    }
    if (typeof(json.recipeLevel) === "number" &&
        [1, 10, 20, 30, 40, 50, 55].includes(json.recipeLevel)) {
        ret.recipeLevel = json.recipeLevel;
    }
    if (typeof(json.event) === "string" &&
        ["none", "entei 1st week", "entei 2nd week"].includes(json.event)) {
        ret.event = json.event;
    }
    return ret;
}

const StrengthView = React.memo(({pokemonIv}: {pokemonIv: PokemonIv}) => {
    let [settings, setAdvancedSettings] = React.useState<CalculateParameter|null>(null);
    if (settings === null) {
        settings = loadDefaultSettingsProps();
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
