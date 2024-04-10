import React from 'react';
import { styled } from '@mui/system';
import Nature from '../../util/Nature';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp, { IngredientType } from '../../util/PokemonRp';
import PokemonTextField from './PokemonTextField';
import LevelControl from './LevelControl';
import IngredientTextField from './IngredientTextField';
import SkillLevelControl from './SkillLevelControl';
import SubSkillControl, { SubSkillChangeEvent } from './SubSkillControl';
import NatureTextField from './NatureTextField';
import { useTranslation } from 'react-i18next';

// Style for IvForm
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

/**
 * Represents Pokemon IV form.
 */
const IvForm = React.memo(({pokemonIv, onChange}: {
    pokemonIv: PokemonIv,
    onChange: (value: PokemonIv) => void,
}) => {
    const { t } = useTranslation();

    const onPokemonNameChange = React.useCallback((name: string) => {
        pokemonIv.pokemonName = name;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);
    const onLevelChange = React.useCallback((level: number) => {
        pokemonIv.level = level;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);
    const onIngredientChange = React.useCallback((value: IngredientType) => {
        pokemonIv.ingredient = value;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);
    const onSkillLevelChange = React.useCallback((value: number) => {
        pokemonIv.skillLevel = value;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);
    const onSubSkillChange = React.useCallback((event: SubSkillChangeEvent) => {
        pokemonIv.subSkills = event.value;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);
    const onNatureChange = React.useCallback((value: Nature) => {
        pokemonIv.nature = value;
        onChange(pokemonIv.clone());
    }, [pokemonIv, onChange]);

    const rp = new PokemonRp(pokemonIv);
    const freqH = Math.floor(rp.frequency / 3600);
    const freqM = Math.floor((rp.frequency / 60) % 60);
    const freqS = Math.floor(rp.frequency % 60);

    return <StyledInputForm>
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
                {t('freq hhmmss', {h: freqH, m: freqM, s: freqS})}
            </div>
        </div>
        <h3>{t("Main Skill & Sub Skills")}</h3>
        <SkillLevelControl pokemon={rp.pokemon} value={pokemonIv.skillLevel} onChange={onSkillLevelChange}/>
        <SubSkillControl value={pokemonIv.subSkills} onChange={onSubSkillChange}/>
        <h3>{t("nature")}</h3>
        <NatureTextField value={pokemonIv.nature} onChange={onNatureChange}/>
    </StyledInputForm>;
});

export default IvForm;
