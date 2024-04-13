import React from 'react';
import { isSkillLevelMax7 } from '../../util/MainSkill';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import RpView from './RpView';
import IvForm from './IvForm';

const ResearchCalcApp = React.memo(() => {
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Bulbasaur"));
    const width = useDomWidth();

    const rp = new PokemonRp(pokemonIv);
    const pokemon = rp.pokemon;
    if (pokemonIv.skillLevel === 7 && !isSkillLevelMax7(pokemon.skill)) {
        pokemonIv.skillLevel = 6;
        setPokemonIv(pokemonIv.clone());
    }

    return <div style={{margin: "0 .5rem"}}>
        <RpView pokemonIv={pokemonIv} width={width}/>
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
