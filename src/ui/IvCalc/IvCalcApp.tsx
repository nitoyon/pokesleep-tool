import React from 'react';
import { styled } from '@mui/system';
import { Tab, Tabs } from '@mui/material'; 
import PokemonIv from '../../util/PokemonIv';
import { CalculateParameter, loadCalculateParameter } from '../../util/PokemonStrength';
import LowerTabView from './LowerTabView';
import RpView from './RpView';
import StrengthView from './StrengthView';
import RatingView from './RatingView';
import { useTranslation } from 'react-i18next';

export const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: '.7rem',
});
export const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const defaultCalculateParameter = loadCalculateParameter();

const ResearchCalcApp = React.memo(() => {
    const [tabIndex, setTabIndex] = React.useState(0);
    const [lowerTabIndex, setLowerTabIndex] = React.useState(0);
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Venusaur"));
    const [parameter, setParameter] = React.useState(defaultCalculateParameter);
    const { t } = useTranslation();
    const width = useDomWidth();

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
        if (newValue !== 1 && lowerTabIndex === 2) {
            setLowerTabIndex(0);
        }
    }, [lowerTabIndex, setTabIndex, setLowerTabIndex]);

    const onParameterChange = React.useCallback((value: CalculateParameter) => {
        setParameter(value);
        localStorage.setItem('PstStrenghParam', JSON.stringify(value));
    }, [setParameter]);

    const onPokemonIvChange = React.useCallback((value: PokemonIv) => {
        // fix helpingBonusCount
        const hasHelpingBonus = value.hasHelpingBonusInActiveSubSkills;
        const prevHasHelpingBonus = pokemonIv.hasHelpingBonusInActiveSubSkills;
        if (hasHelpingBonus && parameter.helpBonusCount === 0) {
            onParameterChange({...parameter, helpBonusCount: 1});
        } else if (parameter.helpBonusCount === 1 && !hasHelpingBonus &&
            prevHasHelpingBonus) {
            onParameterChange({...parameter, helpBonusCount: 0});
        } else if (!hasHelpingBonus && parameter.helpBonusCount === 5) {
            onParameterChange({...parameter, helpBonusCount: 4});
        }

        value.normalize();
        setPokemonIv(value);
    }, [parameter, pokemonIv, setPokemonIv, onParameterChange]);

    const onParameterEdit = React.useCallback(() => {
        setLowerTabIndex(2);
    }, [setLowerTabIndex]);

    return <div style={{margin: "0 .5rem 10rem"}}>
        <StyledTabs value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('rp')}/>
            <StyledTab label={t('strength2')}/>
            <StyledTab label={t('rating')}/>
        </StyledTabs>
        {tabIndex === 0 && <RpView pokemonIv={pokemonIv} width={width}/>}
        {tabIndex === 1 && <StrengthView pokemonIv={pokemonIv}
            lowerTabIndex={lowerTabIndex} parameter={parameter}
            onParameterEdit={onParameterEdit}/>}
        {tabIndex === 2 && <RatingView pokemonIv={pokemonIv} width={width}/>}
        <LowerTabView pokemonIv={pokemonIv} parameter={parameter}
            upperTabIndex={tabIndex} tabIndex={lowerTabIndex}
            onChange={onPokemonIvChange}
            onTabIndexChange={setLowerTabIndex}
            onParameterChange={onParameterChange}/>
    </div>;
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
