import React from 'react';
import { styled } from '@mui/system';
import { isSkillLevelMax7 } from '../../data/pokemons';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp, { IngredientType } from '../../util/PokemonRp';
import RpRaderChart from './RpRaderChart';
import IvForm from './IvForm';
import { useTranslation } from 'react-i18next';

const RpUnit = styled('div')({
    marginLeft: '0.8rem',
    marginBottom: '.4rem',
    '& header': {
        fontSize: '1rem',
        '& span': {
            display: 'inline-block',
            width: '4rem',
            fontSize: '.6rem',
            padding: '.1rem 0',
            textAlign: 'center',
            color: 'white',
            borderRadius: '.6rem',
            verticalAlign: '20%',
        },
        '& strong': {
            display: 'inline-block',
            width: '4.5rem',
            textAlign: 'right',
            color: '#555',
        }
    },
    '& section': {
        fontSize: '0.7rem',
        color: '#666',
    },
});

const ResearchCalcApp = React.memo(() => {
    const { t } = useTranslation();
    const width = useDomWidth();
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Bulbasaur"));

    const rp = new PokemonRp(pokemonIv);
    const rpResult = rp.calculate();

    const pokemon = rp.pokemon;
    if (pokemonIv.skillLevel === 7 && !isSkillLevelMax7(pokemon.skill)) {
        pokemonIv.skillLevel = 6;
        setPokemonIv(pokemonIv.clone());
    }

    const raderHeight = 400;
    const raderColor = pokemon.specialty === "Berries" ? "#24d76a" :
        pokemon.specialty === "Ingredients" ? "#fab855" : "#44a2fd";
    const round = (n: number) => Math.round(n * 10) / 10;
    const trunc1 = (n: number) => {
        n = round(n);
        return t('num', {n: Math.floor(n)}) +
            "." + (n * 10 % 10);
    };

    return <div style={{margin: "0 .5rem"}}>
        <div>
            <div style={{transform: 'scale(1, 0.9)'}}>
                <span style={{
                    color: '#fd775d',
                    fontWeight: 'bold',
                    paddingRight: '.4rem',
                    fontSize: '.8rem',
                    verticalAlign: '15%',
                }}>SP</span>
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                }}>{t('num', {n: rpResult.rp})}</span>
            </div>
            <RpUnit>
                <header>
                    <span style={{background: '#24d76a'}}>{t('berry')}</span>
                    <strong>{trunc1(rpResult.berryRp)}</strong>
                </header>
                <section>{t('probability')}: {round(rp.berryRatio * 100)}%, {t('strength2')}: {rp.berryEnergy}×{rp.berryCount}</section>
            </RpUnit>
            <RpUnit>
                <header>
                    <span style={{background: '#fab855'}}>{t('ingredient')}</span>
                    <strong>{trunc1(rpResult.ingredientRp)}</strong>
                </header>
                <section>{t('probability')}: {round(rp.ingredientRatio * 100)}%, {t('strength2')}: {round(rp.ingredientEnergy * rp.ingredientG)}</section>
            </RpUnit>
            <RpUnit>
                <header>
                    <span style={{background: '#44a2fd'}}>{t('skill')}</span>
                    <strong>{trunc1(rpResult.skillRp)}</strong>
                </header>
                <section>{t('probability')}: {round(rp.skillRatio * 100)}%, {t('strength2')}: {t('num', {n: rp.skillValue})}</section>
            </RpUnit>
        </div>
        <RpRaderChart rp={rpResult} width={width} height={raderHeight} color={raderColor}/>

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
