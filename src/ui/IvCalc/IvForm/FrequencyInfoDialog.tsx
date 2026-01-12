import React from 'react';
import { styled } from '@mui/system';
import { Button, Collapse, Dialog, DialogActions,
    Switch, ToggleButton, ToggleButtonGroup } from '@mui/material';
import PokemonIv from '../../../util/PokemonIv';
import { AmountOfSleep } from '../../../util/TimeUtil';
import PokemonRp from '../../../util/PokemonRp';
import { frequencyToString } from '../../../util/TimeUtil';
import EnergyIcon from '../../Resources/EnergyIcon';
import { useTranslation } from 'react-i18next';

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
        '& div.line': {
            fontSize: '.9rem',
            paddingBottom: 2,
            display: 'flex',
            flex: '0 auto',
            alignItems: 'center',
            '& > label': {
                '&.indent': {
                    paddingLeft: '1rem',
                },
                marginRight: 'auto',
            },
            '& > div': {
                paddingLeft: '.5rem',
                '& > button': {
                    padding: '2px 7px',
                },
            },
        },
        '& button.MuiToggleButton-root': {
            lineHeight: 1.3,
            textTransform: 'none',
        },
    },
});

/** Configuration for frequency info dialog display and calculation */
type FrequencyInfoState = {
    /** Helping bonus level (0-5) */
    helpingBonus: number;
    /** Good camp ticket enabled */
    campTicket: boolean;
    /** Berry bonus from event */
    berryBonus: 0|1;
    /** Ingredient bonus from event */
    ingBonus: 0|1;
    /** Expert mode enabled */
    expertMode: boolean;
    /** Expert berry selection (0=main, 1=sub, 2=others) */
    expertBerry: number;
    /** Expert ingredient bonus effect */
    expertIngBonus: number;
    /** Display value type */
    displayValue: "frequency"|"count"|"full";
};

const FrequencyInfoDialog = React.memo(({rp, iv, open, onClose}: {
    rp: PokemonRp,
    iv: PokemonIv,
    open: boolean,
    onClose: () => void
}) => {
    const { t } = useTranslation();
    const [state, setState] = React.useState<FrequencyInfoState>({
        helpingBonus: 0,
        campTicket: false,
        berryBonus: 0,
        ingBonus: 0,
        expertMode: false,
        expertBerry: 2,
        expertIngBonus: 0,
        displayValue: "frequency",
    });

    const onHelpingBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            setState(prev => ({...prev, helpingBonus: parseInt(value, 10)}));
        }
    }, []);
    const onCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({...prev, campTicket: e.target.checked}));
    }, []);
    const onBerryBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            setState(prev => ({...prev, berryBonus: parseInt(value, 10) as 0|1}));
        }
    }, []);
    const onIngBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            setState(prev => ({...prev, ingBonus: parseInt(value, 10) as 0|1}));
        }
    }, []);
    const onExpertModeChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({...prev, expertMode: e.target.checked}));
    }, []);
    const onExpertBerryChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            setState(prev => ({...prev, expertBerry: parseInt(value, 10)}));
        }
    }, []);
    const onExpertIngBonusChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value !== null) {
            setState(prev => ({...prev, expertIngBonus: parseInt(value, 10)}));
        }
    }, []);
    const onValueChange = React.useCallback((_: React.MouseEvent, value: string|null) => {
        if (value === null) {
            return;
        }
        setState(prev => ({...prev, displayValue: value as "frequency"|"count"|"full"}));
    }, []);

    if (!open) {
        return <></>;
    }

    const baseFreq = rp.iv.getBaseFrequency(state.helpingBonus, state.campTicket,
        state.expertMode && state.expertBerry === 0,
        state.expertMode && state.expertBerry === 2);
    const convertToVal = (rate: number) => {
        switch (state.displayValue) {
            case "frequency":
                return frequencyToString(Math.floor(baseFreq * rate), t);
            case "count":
                return t('help count per hour', {n: (3600 / baseFreq / rate).toFixed(2)});
            case "full": {
                const carryLimit = Math.ceil(iv.carryLimit * (state.campTicket ? 1.2 : 1));
                const mins = carryLimit /
                    rp.iv.getBagUsagePerHelp({
                        berryBonus: state.berryBonus, ingredientBonus: state.ingBonus,
                        expertIngBonus: state.expertMode && state.expertBerry !== 2 && state.expertIngBonus === 1
                    }) *
                    baseFreq * rate / 60;
                return new AmountOfSleep(mins).toString(t);
            }
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
            <div className="line">
                <label>{t('helping bonus')}:</label>
                <ToggleButtonGroup size="small" exclusive
                    value={state.helpingBonus} onChange={onHelpingBonusChange}>
                    <ToggleButton value={0}>0</ToggleButton>
                    <ToggleButton value={1}>1</ToggleButton>
                    <ToggleButton value={2}>2</ToggleButton>
                    <ToggleButton value={3}>3</ToggleButton>
                    <ToggleButton value={4}>4</ToggleButton>
                    <ToggleButton value={5}>5</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="line">
                <label>{t('good camp ticket')}:</label>
                <Switch checked={state.campTicket} onChange={onCampTicketChange}/>
            </div>
            <Collapse in={state.displayValue === "full"}>
                <div className="line">
                    <label>{t('berry bonus from event')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.berryBonus} onChange={onBerryBonusChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className="line">
                    <label>{t('ingredient bonus from event')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.ingBonus} onChange={onIngBonusChange}>
                        <ToggleButton value={0}>{t('none')}</ToggleButton>
                        <ToggleButton value={1}>+1</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </Collapse>
            <div className="line">
                <label>{t('expert mode')}:</label>
                <Switch checked={state.expertMode} onChange={onExpertModeChange}/>
            </div>
            <Collapse in={state.expertMode}>
                <div className="line">
                    <label className="indent">{t('berry')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.expertBerry} onChange={onExpertBerryChange}>
                        <ToggleButton value={0}>{t('main')}</ToggleButton>
                        <ToggleButton value={1}>{t('sub')}</ToggleButton>
                        <ToggleButton value={2}>{t('others')}</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </Collapse>
            <Collapse in={state.expertMode && state.expertBerry !== 2 && state.displayValue === "full"}>
                <div className="line">
                    <label className="indent">{t('expert effect')}:</label>
                    <ToggleButtonGroup size="small" exclusive
                        value={state.expertIngBonus} onChange={onExpertIngBonusChange}>
                        <ToggleButton value={1}>{t('expert ing effect')}</ToggleButton>
                        <ToggleButton value={0}>{t('others')}</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </Collapse>
            <div className="line">
                <label>{t('value')}:</label>
            </div>
            <div className="value">
                <ToggleButtonGroup exclusive size="small" value={state.displayValue}
                    onChange={onValueChange}>
                    <ToggleButton value="frequency">{t('frequency')}</ToggleButton>
                    <ToggleButton value="count">{t('help count')}</ToggleButton>
                    <ToggleButton value="full">{t('time to full inventory')}</ToggleButton>
                </ToggleButtonGroup>
            </div>
        </section>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledFrequencyDialog>;
});

export default FrequencyInfoDialog;
