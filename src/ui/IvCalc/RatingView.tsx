import React from 'react';
import PokemonIv from '../../util/PokemonIv';
import PokemonRating from '../../util/PokemonRating';
import BerryIngSkillView from './BerryIngSkillView';
import RaderChart from './RaderChart';
import { useTranslation } from 'react-i18next';

const RatingView = React.memo(({pokemonIv, width}: {
    pokemonIv: PokemonIv,
    width: number,
}) => {
    const { t } = useTranslation();

    const rating = new PokemonRating(pokemonIv);
    const result = rating.calculate();

    const raderHeight = 400;

    const trunc1 = (n: number) => {
        n = Math.round(n * 10) / 10;
        return t('num', {n: Math.floor(n)}) +
            "." + (n * 10 % 10);
    };

    return (<div>
        <p style={{margin: '.6rem 0'}}>{t('rate subskill and nature')}</p>
        <BerryIngSkillView small
            berryValue={<>{trunc1(result.berryScore)}<span>pt</span></>}
            berryProb={trunc1(result.berryRatio * 100)}
            berrySubValue=""
            ingredientValue={<>{trunc1(result.ingScore)}<span>pt</span></>}
            ingredientProb={trunc1(result.ingRatio * 100)}
            ingredientSubValue=""
            skillValue={<>{trunc1(result.skillScore)}<span>pt</span></>}
            skillProb={trunc1(result.skillRatio * 100)}
            skillSubValue=""/>
        <RaderChart width={width} height={raderHeight} speciality={pokemonIv.pokemon.speciality}
            berry={result.berryScore / 100}
            ingredient={result.ingScore / 100}
            skill={result.skillScore / 100}/>
    </div>);
});

export default RatingView;
