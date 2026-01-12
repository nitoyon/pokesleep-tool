import React from 'react';
import { styled } from '@mui/system';
import Nature from '../../../util/Nature';
import PokemonIv from '../../../util/PokemonIv';
import PokemonRp from '../../../util/PokemonRp';
import { frequencyToString } from '../../../util/TimeUtil';
import CandyDialog from '../CandyDialog';
import PokemonTextField from './PokemonTextField';
import LevelControl from './LevelControl';
import IngredientTextField from './IngredientTextField';
import SkillLevelControl from './SkillLevelControl';
import InfoButton from '../InfoButton';
import SubSkillControl, { SubSkillChangeEvent } from './SubSkillControl';
import NatureTextField from './NatureTextField';
import SleepingTimeControl from './SleepingTimeControl';
import FrequencyInfoDialog from './FrequencyInfoDialog';
import { useTranslation } from 'react-i18next';

// Style for IvForm
const StyledInputForm = styled('div')({
    margin: '0 0.3rem 0 0.3rem',
    fontSize: '.9rem',
    '& > div.table': {
        width: '100%',
        display: 'grid',
        gap: 'clamp(.3rem, 0.7vh, .5rem) .8rem',
        gridTemplateColumns: 'fit-content(200px) 1fr',
    },
    '& > h3': {
        margin: 'clamp(0.7rem, 1.8vh, 1rem) 0 .3rem -.3rem',
        fontSize: '.8rem',
        padding: '.1rem .5rem',
        background: '#557799',
        borderRadius: '0.4rem',
        color: 'white',
    },
});

/**
 * Represents Pokemon IV form.
 */
const IvForm = React.memo(({pokemonIv, fixMode, onChange}: {
    pokemonIv: PokemonIv,
    fixMode?: boolean,
    onChange: (value: PokemonIv) => void,
}) => {
    const { t } = useTranslation();

    const onPokemonNameChange = React.useCallback((pokemonName: string) => {
        onChange(pokemonIv.clone({pokemonName}));
    }, [pokemonIv, onChange]);
    const onLevelChange = React.useCallback((level: number) => {
        onChange(pokemonIv.changeLevel(level));
    }, [pokemonIv, onChange]);
    const onSkillLevelChange = React.useCallback((skillLevel: number) => {
        onChange(pokemonIv.clone({skillLevel}));
    }, [pokemonIv, onChange]);
    const onSubSkillChange = React.useCallback((event: SubSkillChangeEvent) => {
        onChange(pokemonIv.changeSubSkills(event.value));
    }, [pokemonIv, onChange]);
    const onNatureChange = React.useCallback((nature: Nature) => {
        onChange(pokemonIv.clone({nature}));
    }, [pokemonIv, onChange]);
    const onRibbonChange = React.useCallback((ribbon: 0|1|2|3|4) => {
        onChange(pokemonIv.clone({ribbon}));
    }, [pokemonIv, onChange]);

    const [frequencyDialogOpen, setFrequencyDialogOpen] = React.useState(false);
    const onFrequencyInfoClick = React.useCallback(() => {
        setFrequencyDialogOpen(true);
    }, [setFrequencyDialogOpen]);
    const onFrequencyDialogClose = React.useCallback(() => {
        setFrequencyDialogOpen(false);
    }, [setFrequencyDialogOpen]);
    const [candyDialogOpen, setCandyDialogOpen] = React.useState(false);

    // Candy dialog handler
    const onCandyClick = React.useCallback(() => {
        setCandyDialogOpen(true);
    }, []);
    const onCloseCandyDialog = React.useCallback(() => {
        setCandyDialogOpen(false);
    }, []);


    const rp = new PokemonRp(pokemonIv);

    return <StyledInputForm>
        <div className="table">
            <div>{t("pokemon")}:</div>
            <PokemonTextField iv={pokemonIv} fixMode={fixMode}
                onChange={onPokemonNameChange} onCandyClick={onCandyClick}/>
            <div>{t("level")}:</div>
            <LevelControl max100 value={pokemonIv.level} onChange={onLevelChange}/>
            <div>{t("ingredient")}:</div>
            <IngredientTextField iv={pokemonIv} onChange={onChange}/>
            <div>{t("frequency")}:</div>
            <div>
                {frequencyToString(rp.frequency, t)}
                {rp.frequency > 0 && <InfoButton onClick={onFrequencyInfoClick}/>}
                <FrequencyInfoDialog iv={pokemonIv}
                    open={frequencyDialogOpen} onClose={onFrequencyDialogClose}/>
            </div>
            <div>{t("carry limit")}:</div>
            {pokemonIv.carryLimit}
        </div>
        <h3>{t("Main Skill & Sub Skills")}</h3>
        <SkillLevelControl pokemon={rp.pokemon} value={pokemonIv.skillLevel} onChange={onSkillLevelChange}/>
        <SubSkillControl value={pokemonIv.subSkills} onChange={onSubSkillChange}/>
        <h3 className="nature">{t("additional stats")}</h3>
        <NatureTextField iv={pokemonIv} onChange={onNatureChange}/>
        <div style={{marginTop: '.7rem'}}>
            <span style={{paddingRight: '0.7rem'}}>{t("sleeping time shared")}:</span>
            <SleepingTimeControl value={pokemonIv.ribbon} onChange={onRibbonChange}/>
        </div>
        <CandyDialog iv={pokemonIv} open={candyDialogOpen}
            onChange={onChange} onClose={onCloseCandyDialog}/>
    </StyledInputForm>;
});

export default IvForm;
