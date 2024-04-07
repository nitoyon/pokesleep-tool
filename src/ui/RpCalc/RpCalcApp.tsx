import React from 'react';
import { styled } from '@mui/system';
import { isSkillLevelMax7 } from '../../data/pokemons';
import Nature from '../../util/Nature';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp, { IngredientType } from '../../util/PokemonRp';
import RpRaderChart from './RpRaderChart';
import PokemonTextField from './PokemonTextField';
import LevelControl from './LevelControl';
import IngredientTextField from './IngredientTextField';
import SkillLevelControl from './SkillLevelControl';
import SubSkillControl, { SubSkillChangeEvent } from './SubSkillControl';
import NatureTextField from './NatureTextField';
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

const StyledInputForm = styled('div')({
    margin: '1rem .3rem',
    fontSize: '.9rem',
    '& > div.table': {
        marginTop: '1rem',
        display: 'grid',
        gap: '.5rem .8rem',
        gridTemplateColumns: 'fit-content(200px) 1fr',
    },
    '& > h3': {
        margin: '1rem 0 .3rem -.3rem',
        fontSize: '.8rem',
        padding: '.1rem .5rem',
        background: '#24cc6a',
        color: 'white',
    }
});

const ResearchCalcApp = React.memo(() => {
    const { t } = useTranslation();
    const width = useDomWidth();
    const [pokemonIv, setPokemonIv] = React.useState(new PokemonIv("Bulbasaur"));

    const onPokemonNameChange = React.useCallback((name: string) => {
        pokemonIv.pokemonName = name;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);
    const onLevelChange = React.useCallback((level: number) => {
        pokemonIv.level = level;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);
    const onIngredientChange = React.useCallback((value: IngredientType) => {
        pokemonIv.ingredient = value;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);
    const onSkillLevelChange = React.useCallback((value: number) => {
        pokemonIv.skillLevel = value;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);
    const onSubSkillChange = React.useCallback((event: SubSkillChangeEvent) => {
        pokemonIv.subSkills = event.value;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);
    const onNatureChange = React.useCallback((value: Nature) => {
        pokemonIv.nature = value;
        setPokemonIv(pokemonIv.clone());
    }, [pokemonIv, setPokemonIv]);

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

    const freqM = Math.floor(rp.frequency / 60);
    const freqS = Math.floor(rp.frequency % 60);

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

        <StyledInputForm>
            <div className="table">
                <div>{t("pokemon")}:</div>
                <PokemonTextField value={pokemonIv.pokemonName} onChange={onPokemonNameChange}/>
                <div>{t("level")}:</div>
                <LevelControl value={pokemonIv.level} onChange={onLevelChange}/>
                <div>{t("ingredient")}:</div>
                <IngredientTextField pokemon={rp.pokemon}
                    value={pokemonIv.ingredient} onChange={onIngredientChange}/>
                <div>{t("frequency")}:</div>
                <div>
                    {t("frequency prefix")}{t('mmss', {m: freqM, s: freqS})}
                </div>
            </div>
            <h3>{t("Main Skill & Sub Skills")}</h3>
            <SkillLevelControl pokemon={rp.pokemon} value={pokemonIv.skillLevel} onChange={onSkillLevelChange}/>
            <SubSkillControl value={pokemonIv.subSkills} onChange={onSubSkillChange}/>
            <h3>{t("nature")}</h3>
            <NatureTextField value={pokemonIv.nature} onChange={onNatureChange}/>
        </StyledInputForm>
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
