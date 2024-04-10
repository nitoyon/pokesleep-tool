import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import BerryIngSkillView from './BerryIngSkillView';
import RpRaderChart from './RpRaderChart';
import { useTranslation } from 'react-i18next';

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
            <BerryIngSkillView
                berryValue={trunc1(rpResult.berryRp)}
                berryProb={trunc1(rp.berryRatio * 100)}
                berrySubValue={`${t('strength2')}: ${rp.berryStrength}×${rp.berryCount}`}
                ingredientValue={trunc1(rpResult.ingredientRp)}
                ingredientProb={trunc1(rp.ingredientRatio * 100)}
                ingredientSubValue={`${t('strength2')}: ${round(rp.ingredientEnergy * rp.ingredientG)}`}
                skillValue={trunc1(rpResult.skillRp)}
                skillProb={trunc1(rp.skillRatio * 100)}
                skillSubValue={`${t('strength2')}: ${t('num', {n: rp.skillValue})}`}/>
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
