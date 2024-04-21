import React from 'react';
import { styled } from '@mui/system';
import { Tab, Tabs } from '@mui/material'; 
import { isSkillLevelMax7 } from '../../util/MainSkill';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import RpView from './RpView';
import StrengthView from './StrengthView';
import RatingView from './RatingView';
import IvForm from './IvForm';
import { t } from 'i18next';

const StyledTabs = styled(Tabs)({
    minHeight: '36px',
    marginBottom: '.7rem',
});
const StyledTab = styled(Tab)({
    minHeight: '36px',
    padding: '6px 16px',
});

const ResearchCalcApp = React.memo(() => {
    const [tabIndex, setTabIndex] = React.useState(0);
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Dragonite"));
    const width = useDomWidth();

    const rp = new PokemonRp(pokemonIv);
    const pokemon = rp.pokemon;
    if (pokemonIv.skillLevel === 7 && !isSkillLevelMax7(pokemon.skill)) {
        pokemonIv.skillLevel = 6;
        setPokemonIv(pokemonIv.clone());
    }

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    }, [setTabIndex]);

    return <div style={{margin: "0 .5rem"}}>
        <StyledTabs value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('rp')}/>
            <StyledTab label={t('strength2')}/>
            <StyledTab label={t('rating')}/>
        </StyledTabs>
        {tabIndex === 0 && <RpView pokemonIv={pokemonIv} width={width}/>}
        {tabIndex === 1 && <StrengthView pokemonIv={pokemonIv}/>}
        {tabIndex === 2 && <RatingView pokemonIv={pokemonIv} width={width}/>}
        <IvForm pokemonIv={pokemonIv} onChange={setPokemonIv}/>
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
