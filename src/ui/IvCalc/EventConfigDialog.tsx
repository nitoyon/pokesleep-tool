import React from 'react';
import { styled } from '@mui/system';
import { Button, Collapse, Dialog, DialogActions, MenuItem, TextField,
    ToggleButton, ToggleButtonGroup } from '@mui/material';
import SpecialtyButton from './SpecialtyButton';
import TypeSelect from './TypeSelect';
import { PokemonSpecialty, PokemonType } from '../../data/pokemons';
import events, { fillBonusEffects, TargetPokemon } from '../../data/events';
import { StrengthParameter } from '../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const EventConfigDialog = React.memo(({open, value, onClose, onChange}: {
    open: boolean,
    value: StrengthParameter,
    onClose: () => void,
    onChange: (value: StrengthParameter) => void,
}) => {
    const { t } = useTranslation();
    const [type, setType] = React.useState<PokemonType>(
        value.customEventBonus?.target?.type ?? "normal");
    const [specialty, setSpecialty] = React.useState<PokemonSpecialty>(
        value.customEventBonus?.target?.specialty ?? "Berries");

    const onEventChange = React.useCallback((e: any) => {
        const name = e.target.value as string;
        const bonus = events.getBonusByName(name);
        if (bonus === undefined) {
            onChange({...value, event: "custom",
                customEventBonus: { target: {}, effects: fillBonusEffects({}) },
            });
            return;
        }
        if (typeof(bonus.target.type) !== "undefined") {
            setType(bonus.target.type);
        }
        if (typeof(bonus.target.specialty) !== "undefined") {
            setSpecialty(bonus.target.specialty);
        }
        onChange({...value,
            event: bonus.name,
            customEventBonus: {
                target: bonus.target,
                effects: bonus.effects,
            }
        });
    }, [value, onChange]);
    const onTargetChange = React.useCallback((e: any, val: string|null) => {
        if (val === null) {
            return;
        }
        const target: Partial<TargetPokemon> = {};
        switch (val) {
            case "type": target.type = type; break; 
            case "specialty": target.specialty = specialty; break;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus, target,
        }});
    }, [type, specialty, value, onChange]);
    const onTypeChange = React.useCallback((type: PokemonType) => {
        setType(type);
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            target: { type },
        }});
    }, [value, onChange]);
    const onSpecialtyClick = React.useCallback((val: PokemonSpecialty) => {
        setSpecialty(val);
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            target: { specialty: val },
        }});
    }, [value, onChange]);
    const onSkillTriggerChange = React.useCallback((e: any, val: number|null) => {
        if (val === null) {
            return;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            effects: {
                ...value.customEventBonus.effects,
                skillTrigger: val as 1|1.25|1.5,
            },
        }});
    }, [value, onChange]);
    const onSkillLevelChange = React.useCallback((e: any, val: number|null) => {
        if (val === null) {
            return;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            effects: {
                ...value.customEventBonus.effects,
                skillLevel: val as 0|1|3,
            },
        }});
    }, [value, onChange]);
    const onIngredientChange = React.useCallback((e: any, val: number|null) => {
        if (val === null) {
            return;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            effects: {
                ...value.customEventBonus.effects,
                ingredient: val as 0|1,
            },
        }});
    }, [value, onChange]);
    const onDreamShardChange = React.useCallback((e: any, val: number|null) => {
        if (val === null) {
            return;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            effects: {
                ...value.customEventBonus.effects,
                dreamShard: val as 1|2,
            },
        }});
    }, [value, onChange]);
    const onDishChange = React.useCallback((e: any, val: number|null) => {
        if (val === null) {
            return;
        }
        onChange({...value, event: "custom", customEventBonus: {
            ...value.customEventBonus,
            effects: {
                ...value.customEventBonus.effects,
                dish: val as 1|1.25|1.5,
            },
        }});
    }, [value, onChange]);

    if (!open) {
        return <></>;
    }

    const eventMenus = events.bonus.map((event) => <MenuItem
        key={event.name} value={event.name}>{t('events.' + event.name)}</MenuItem>);
    eventMenus.unshift(<MenuItem key="custom" value="custom">{t('events.custom')}</MenuItem>);

    const targetName = typeof(value.customEventBonus.target.type) !== "undefined" ? "type" :
        typeof(value.customEventBonus.target.specialty) !== "undefined" ? "specialty" : "all";

    return (<StyledEventConfigDialog open={open} onClose={onClose}>
        <header>
            <section>
                <label>{t('event')}:</label>
                <TextField value={value.event} onChange={onEventChange}
                    select size="small" variant="standard">
                    {eventMenus}
                </TextField>
            </section>
        </header>
        <article>
            <section>
                <label>{t('target')}:</label>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={targetName} onChange={onTargetChange}>
                        <ToggleButton value='all'>{t('all')}</ToggleButton>
                        <ToggleButton value='type'>{t('type')}</ToggleButton>
                        <ToggleButton value='specialty'>{t('specialty')}</ToggleButton>
                    </ToggleButtonGroup>
                    <Collapse in={typeof(value.customEventBonus.target.type) !== "undefined"}>
                        <TypeSelect type={type}
                            onChange={onTypeChange}/>
                    </Collapse>
                </div>
            </section>
            <Collapse in={typeof(value.customEventBonus.target.specialty) !== "undefined"} sx={{textAlign: 'right'}}>
                <SpecialtyButton specialty="Berries" onClick={onSpecialtyClick}
                    checked={specialty === "Berries"}/>
                <SpecialtyButton specialty="Ingredients" onClick={onSpecialtyClick}
                    checked={specialty === "Ingredients"}/>
                <SpecialtyButton specialty="Skills" onClick={onSpecialtyClick}
                    checked={specialty === "Skills"}/>
            </Collapse>
            <section>
                <label>{t('skill rate')}:</label>
                <div>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={value.customEventBonus.effects.skillTrigger} onChange={onSkillTriggerChange}>
                        <ToggleButton value={1}>×1</ToggleButton>
                        <ToggleButton value={1.25}>×1.25</ToggleButton>
                        <ToggleButton value={1.5}>×1.5</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </section>
            <section>
                <label>{t('skill level')}:</label>
                <div>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={value.customEventBonus.effects.skillLevel} onChange={onSkillLevelChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                        <ToggleButton value={3}>+3</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </section>
            <section>
                <label>{t('ingredient')}:</label>
                <div>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={value.customEventBonus.effects.ingredient} onChange={onIngredientChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </section>
            <section>
                <label>{t('skills.Dream Shard Magnet S')}:</label>
                <div>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={value.customEventBonus.effects.dreamShard} onChange={onDreamShardChange}>
                        <ToggleButton value={1}>{t('none')}</ToggleButton>
                        <ToggleButton value={2}>×2</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </section>
            <section>
                <label>{t('dish')}:</label>
                <div>
                    <ToggleButtonGroup size="small" exclusive style={{ textTransform: 'none' }}
                        value={value.customEventBonus.effects.dish} onChange={onDishChange}>
                        <ToggleButton value={1}>{t('none')}</ToggleButton>
                        <ToggleButton value={1.25}>×1.25</ToggleButton>
                        <ToggleButton value={1.5}>×1.5</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </section>
        </article>
        <DialogActions>
            <Button onClick={onClose}>{t("close")}</Button>
        </DialogActions>
    </StyledEventConfigDialog>);
});

const StyledEventConfigDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
    },
    '& .MuiPaper-root': {
        width: '100%',
        '& > header, & > article': {
            margin: '0.8rem 0.8rem 0 0.8rem',
            '& > section': {
                display: 'flex',
                flex: '0 auto',
                fontSize: '.85rem',
                marginTop: '0.5rem',
                '&:first-of-type': {
                    marginTop: 0,
                },
                '& > label': {
                    marginRight: 'auto',
                    marginTop: 0,
                },
                '& > div': {
                },
            },
        },
        '& > article': {
            background: '#eee',
            padding: '0.5rem',
            borderRadius: '0.9rem',
            '& button.MuiToggleButtonGroup-grouped': {
                background: 'transparent',
            },
            '& button.MuiToggleButtonGroup-grouped.Mui-selected': {
                background: 'rgba(0, 0, 0, 0.08)',
            },
        }
    },
});

export default EventConfigDialog;
