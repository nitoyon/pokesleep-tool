import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import BerryIngSkillView from './BerryIngSkillView';
import RaderChart from './RaderChart';
import { useTranslation } from 'react-i18next';

const RpView = React.memo(({pokemonIv, width}: {pokemonIv: PokemonIv, width: number}) => {
    const { t } = useTranslation();

    const rp = new PokemonRp(pokemonIv);
    const rpResult = rp.calculate();

    const pokemon = rp.pokemon;
    const raderHeight = 400;
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
        <RaderChart width={width} height={raderHeight} speciality={pokemon.specialty}
            berry={rpResult.berryRp / 1500}
            ingredient={rpResult.ingredientRp / 1500}
            skill={rpResult.skillRp / 1500}/>
    </>);
});

export default RpView;
