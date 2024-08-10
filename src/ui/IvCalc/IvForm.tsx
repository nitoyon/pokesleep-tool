import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, MenuItem, Select, SelectChangeEvent,
    Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Nature from '../../util/Nature';
import PokemonIv from '../../util/PokemonIv';
import { AmountOfSleep } from '../../util/TimeUtil';
import PokemonRp, { IngredientType } from '../../util/PokemonRp';
import PokemonTextField from './PokemonTextField';
import LevelControl from './LevelControl';
import IngredientTextField from './IngredientTextField';
import SkillLevelControl from './SkillLevelControl';
import InfoButton from './InfoButton';
import CarryLimitTextField from './CarryLimitTextField';
import SubSkillControl, { SubSkillChangeEvent } from './SubSkillControl';
import NatureTextField from './NatureTextField';
import SleepingTimeControl from './SleepingTimeControl';
import EnergyIcon from '../Resources/EnergyIcon';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next'

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

    const onPokemonNameChange = React.useCallback((name: string) => {
        onChange(pokemonIv.clone(name));
    }, [pokemonIv, onChange]);
    const onLevelChange = React.useCallback((level: number) => {
        const iv = pokemonIv.changeLevel(level);
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onIngredientChange = React.useCallback((value: IngredientType) => {
        const iv = pokemonIv.clone();
        iv.ingredient = value;
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onEvolvedCountChange = React.useCallback((value: 0|1|2) => {
        const iv = pokemonIv.clone();
        iv.evolvedCount = value;
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onSkillLevelChange = React.useCallback((value: number) => {
        const iv = pokemonIv.clone();
        iv.skillLevel = value;
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onSubSkillChange = React.useCallback((event: SubSkillChangeEvent) => {
        const iv = pokemonIv.changeSubSkills(event.value);
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onNatureChange = React.useCallback((value: Nature) => {
        const iv = pokemonIv.clone();
        iv.nature = value;
        onChange(iv);
    }, [pokemonIv, onChange]);
    const onRibbonChange = React.useCallback((value: 0|1|2|3|4) => {
        const iv = pokemonIv.clone();
        iv.ribbon = value;
        onChange(iv);
    }, [pokemonIv, onChange]);

    const [frequencyDialogOpen, setFrequencyDialogOpen] = React.useState(false);
    const onFrequencyInfoClick = React.useCallback(() => {
        setFrequencyDialogOpen(true);
    }, [setFrequencyDialogOpen]);
    const onFrequencyDialogClose = React.useCallback(() => {
        setFrequencyDialogOpen(false);
    }, [setFrequencyDialogOpen]);

    const rp = new PokemonRp(pokemonIv);

    return <StyledInputForm>
        <div className="table">
            <div>{t("pokemon")}:</div>
            <PokemonTextField value={pokemonIv.pokemonName} fixMode={fixMode}
                onChange={onPokemonNameChange}/>
            <div>{t("level")}:</div>
            <LevelControl value={pokemonIv.level} onChange={onLevelChange}/>
            <div>{t("ingredient")}:</div>
            <IngredientTextField pokemon={rp.pokemon}
                value={pokemonIv.ingredient} onChange={onIngredientChange}/>
            <div>{t("frequency")}:</div>
            <div>
                {frequencyToString(rp.frequency, t)}
                <InfoButton onClick={onFrequencyInfoClick}/>
                <FrequencyInfoDialog rp={rp} iv={pokemonIv}
                    open={frequencyDialogOpen} onClose={onFrequencyDialogClose}/>
            </div>
            <div>{t("carry limit")}:</div>
            <CarryLimitTextField iv={pokemonIv} onChange={onEvolvedCountChange}/>
        </div>
        <h3>{t("Main Skill & Sub Skills")}</h3>
        <SkillLevelControl pokemon={rp.pokemon} value={pokemonIv.skillLevel} onChange={onSkillLevelChange}/>
        <SubSkillControl value={pokemonIv.subSkills} onChange={onSubSkillChange}/>
        <h3 className="nature">{t("additional stats")}</h3>
        <NatureTextField value={pokemonIv.nature} onChange={onNatureChange}/>
        <div style={{marginTop: 'clamp(.3rem, 0.7vh, .5rem)'}}>
            <span style={{paddingRight: '0.7rem'}}>{t("sleeping time shared")}:</span>
            <SleepingTimeControl value={pokemonIv.ribbon} onChange={onRibbonChange}/>
        </div>
    </StyledInputForm>;
});

const StyledFrequencyDialog = styled(Dialog)({
    '& div.MuiPaper-root': {
        // expand dialog width
        margin: '20px',
    },
    '& article': {
        margin: '1rem',
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        gridGap: '1rem',
        rowGap: '0.5rem',
        fontSize: '0.9rem',
        alignItems: 'start',
        '& > span.energy': {
            display: 'flex',
            alignItems: 'center',
        },
    },
    '& section': {
        margin: '0.5rem 1rem 0 1rem',
        '& > div': {
            fontSize: '.9rem',
            display: 'flex',
            flex: '0 auto',
            alignItems: 'center',
            '& > label': {
                marginRight: 'auto',
            },
            '& > div': {
                paddingLeft: '.5rem',
                '& > button': {
                    padding: '2px 7px',
                },
            },
            '& > button.MuiToggleButton-root': {
                lineHeight: 1.3,
                height: '3rem',
            },
        },
    },
});

const FrequencyInfoDialog = React.memo(({rp, iv, open, onClose}: {
    rp: PokemonRp,
    iv: PokemonIv,
    open: boolean,
    onClose: () => void
}) => {
    const { t } = useTranslation();
    const [helpingBonus, setHelpingBonus] = React.useState(0);
    const [campTicket, setCampTicket] = React.useState(false);
    const [value, setValue] = React.useState<"frequency"|"count"|"full">("frequency");

    const onHelpingBonusChange = React.useCallback((e: any, value: string|null) => {
        if (value !== null) {
            setHelpingBonus(parseInt(value, 10));
        }
    }, [setHelpingBonus]);
    const onCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCampTicket(e.target.checked);
    }, [setCampTicket]);
    const onValueChange = React.useCallback((e: any, value: string|null) => {
        if (value === null) {
            return;
        }
        console.log(value);
        setValue(value as "frequency"|"count"|"full");
    }, []);

    // reset state when closed
    React.useEffect(() => {
        if (open) { return; }
        setTimeout(() => {
            setHelpingBonus(0);
            setCampTicket(false);
            setValue("frequency");
        }, 200);
    }, [open]);
    if (!open) {
        return <></>;
    }

    const baseFreq = rp.frequencyWithHelpingBonus(helpingBonus) /
        (campTicket ? 1.2 : 1);
    const convertToVal = (rate: number) => {
        switch (value) {
            case "frequency":
                return frequencyToString(Math.floor(baseFreq * rate), t);
            case "count":
                return t('help count per hour', {n: (3600 / baseFreq / rate).toFixed(2)});
            case "full":
                const carryLimit = Math.ceil(iv.carryLimit * (campTicket ? 1.2 : 1));
                const mins = carryLimit / rp.bagUsagePerHelp * baseFreq * rate / 60;
                return new AmountOfSleep(mins).toString(t);
        }
        return "";
    };
    const val0 = convertToVal(1);
    const val40 = convertToVal(0.66);
    const val60 = convertToVal(0.58);
    const val80 = convertToVal(0.52);
    const val100 = convertToVal(0.45);
    return <StyledFrequencyDialog open={open} onClose={onClose}>
        <article>
            <span className="energy"><EnergyIcon energy={100}/>81{t('range separator')}150</span>
            <span>{val100}</span>
            <span className="energy"><EnergyIcon energy={80}/>61{t('range separator')}80</span>
            <span>{val80}</span>
            <span className="energy"><EnergyIcon energy={60}/>41{t('range separator')}60</span>
            <span>{val60}</span>
            <span className="energy"><EnergyIcon energy={40}/>1{t('range separator')}40</span>
            <span>{val40}</span>
            <span className="energy"><EnergyIcon  energy={20}/>0</span>
            <span>{val0}</span>
        </article>
        <section>
            <div>
                <label>{t('helping bonus')}:</label>
                <ToggleButtonGroup size="small" exclusive
                    value={helpingBonus} onChange={onHelpingBonusChange}>
                    <ToggleButton value={0}>0</ToggleButton>
                    <ToggleButton value={1}>1</ToggleButton>
                    <ToggleButton value={2}>2</ToggleButton>
                    <ToggleButton value={3}>3</ToggleButton>
                    <ToggleButton value={4}>4</ToggleButton>
                    <ToggleButton value={5}>5</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div>
                <label>{t('good camp ticket')}:</label>
                <Switch checked={campTicket} onChange={onCampTicketChange}/>
            </div>
            <div>
                <label>{t('value')}:</label>
            </div>
            <ToggleButtonGroup exclusive size="small" value={value}
                onChange={onValueChange}>
                <ToggleButton value="frequency">{t('frequency')}</ToggleButton>
                <ToggleButton value="count">{t('help count')}</ToggleButton>
                <ToggleButton value="full">{t('time to full inventory')}</ToggleButton>
            </ToggleButtonGroup>
        </section>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledFrequencyDialog>;
});

function frequencyToString(frequency: number, t: typeof i18next.t): string {
    const h = Math.floor(frequency / 3600);
    const m = Math.floor((frequency / 60) % 60);
    const s = Math.floor(frequency % 60);
    return t('freq hhmmss', {h, m, s});
}

export default IvForm;
