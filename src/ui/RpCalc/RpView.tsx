import React from 'react';
import { styled } from '@mui/system';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import RpRaderChart from './RpRaderChart';
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

const RpView = React.memo(({pokemonIv}: {pokemonIv: PokemonIv}) => {
    const { t } = useTranslation();
    const width = useDomWidth();

    const rp = new PokemonRp(pokemonIv);
    const rpResult = rp.calculate();

    const pokemon = rp.pokemon;
    const raderHeight = 400;
    const raderColor = pokemon.specialty === "Berries" ? "#24d76a" :
        pokemon.specialty === "Ingredients" ? "#fab855" : "#44a2fd";
    const round = (n: number) => Math.round(n * 10) / 10;
    const trunc1 = (n: number) => {
        n = round(n);
        return t('num', {n: Math.floor(n)}) +
            "." + (n * 10 % 10);
    };

    return (<>
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
    </>);
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

export default RpView;
