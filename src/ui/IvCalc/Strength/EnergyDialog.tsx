import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from '../IvState';
import PokemonIv from '../../../util/PokemonIv';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { AmountOfSleep } from '../../../util/TimeUtil';
import { EnergyResult } from '../../../util/Energy';
import { clamp } from '../../../util/NumberUtil';
import { useElementWidth } from '../../common/Hook';
import { Collapse, Button, Dialog, DialogActions, MenuItem,
    Select, SelectChangeEvent, Switch, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EnergyChart } from '../Chart/EnergyChart';

const EnergyDialog = React.memo(({open, iv, energy, parameter, onClose, dispatch}: {
    open: boolean,
    iv: PokemonIv,
    energy: EnergyResult,
    parameter: StrengthParameter,
    onClose: () => void,
    dispatch: React.Dispatch<IvAction>,
}) => {
    const { t } = useTranslation();
    const [width, dialogRef] = useElementWidth();
    const [isScoreEmpty, setIsScoreEmpty] = React.useState(false);

    const onRestoreEnergyChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            e4eEnergy: parseInt(e.target.value, 10),
        }}});
    }, [dispatch, parameter]);
    const onSkillCountChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            e4eCount: parseInt(e.target.value, 10),
        }}});
    }, [dispatch, parameter]);
    const onRecoveryBonusCountChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            recoveryBonusCount: parseInt(e.target.value, 10) as 0|1|2|3|4,
        }}});
    }, [dispatch, parameter]);
    const onScoreChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setIsScoreEmpty(e.target.value === "");
        let newVal = parseInt(e.target.value, 10);
        if (isNaN(newVal)) {
            newVal = 0;
        }
        newVal = clamp(0, newVal, 100);
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            sleepScore: newVal,
        }}});
    }, [dispatch, parameter]);
    const onAlways100Change = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            isEnergyAlwaysFull: e.target.checked,
        }}});
    }, [dispatch, parameter]);
    const onGoodCampTicketChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            isGoodCampTicketSet: e.target.checked,
        }}});
    }, [dispatch, parameter]);
    const onTapFrequencyChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            tapFrequency: e.target.value as "always"|"none",
        }}});
    }, [dispatch, parameter]);
    const onTapFrequencyAsleepChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            tapFrequencyAsleep: e.target.value as "always"|"none",
        }}});
    }, [dispatch, parameter]);

    if (!open) {
        return <></>;
    }

    const hasRecoveryBonus = iv.hasEnergyRecoveryBonusInActiveSubSkills;
    const carryLimit = energy.carryLimit;

    return <StyledEnergyDialog open={open} onClose={onClose}>
        <EnergyChart width={width} period={parameter.period} result={energy}/>
        <Collapse in={!parameter.isEnergyAlwaysFull}>
            <section>
                <div>
                    <label>{t('skills.Energy for Everyone S')}:</label>
                    <div>
                        <Select variant="standard" value={parameter.e4eEnergy.toString()}
                            onChange={onRestoreEnergyChange}>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={11}>11</MenuItem>
                            <MenuItem value={15}>15</MenuItem>
                            <MenuItem value={18}>18</MenuItem>
                        </Select>
                        <span style={{margin: '0 0.5rem'}}>×</span>
                        <Select variant="standard" value={parameter.e4eCount.toString()}
                            onChange={onSkillCountChange}>
                            <MenuItem value={0}>0</MenuItem>
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                            <MenuItem value={4}>4</MenuItem>
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={7}>7</MenuItem>
                            <MenuItem value={8}>8</MenuItem>
                            <MenuItem value={9}>9</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                        </Select>
                    </div>
                </div>
                <div>
                    <label>{t('subskill.Energy Recovery Bonus')}:</label>
                    <Select variant="standard" value={parameter.recoveryBonusCount.toString()}
                        onChange={onRecoveryBonusCountChange}>
                        <MenuItem value={0}>{hasRecoveryBonus ? '×1' : t('none')}</MenuItem>
                        <MenuItem value={1}>{hasRecoveryBonus ? '×2' : '×1'}</MenuItem>
                        <MenuItem value={2}>{hasRecoveryBonus ? '×3' : '×2'}</MenuItem>
                        <MenuItem value={3}>{hasRecoveryBonus ? '×4' : '×3'}</MenuItem>
                        <MenuItem value={4}>{hasRecoveryBonus ? '×5' : '×4'}</MenuItem>
                    </Select>
                </div>
                <div>
                    <label>{t('sleep score')}:</label>
                    <div>
                        <TextField variant="standard" type="number" size="small"
                            value={isScoreEmpty ? "" : parameter.sleepScore} onChange={onScoreChange}
                            slotProps={{
                                htmlInput: {min: 0, max: 100}
                            }}/>
                    </div>
                </div>
            </section>
        </Collapse>
        <section ref={dialogRef}>
            <div>
                <label>{t('always 81%+')}:</label>
                <div>
                    <Switch size="small"
                        checked={parameter.isEnergyAlwaysFull} onChange={onAlways100Change}/>
                </div>
            </div>
        </section>
        <section>
            <div>
                <label>{t('good camp ticket')}:</label>
                <div>
                    <Switch size="small"
                        checked={parameter.isGoodCampTicketSet} onChange={onGoodCampTicketChange}/>
                </div>
            </div>
        </section>
        <section>
            <div>
                <label>{t('tap frequency')} ({t('awake')}):</label>
                <Select variant="standard" value={parameter.tapFrequency}
                    onChange={onTapFrequencyChange}>
                    <MenuItem value="always">{t('every minute')}</MenuItem>
                    <MenuItem value="none">{t('none')}</MenuItem>
                </Select>
            </div>
            <div>
                <label>{t('tap frequency')} ({t('asleep')}):</label>
                {parameter.tapFrequency === "none" ?
                    <span style={{fontSize: '0.9rem'}}>{t('none')}</span> :
                    <Select variant="standard" value={parameter.tapFrequencyAsleep}
                        onChange={onTapFrequencyAsleepChange}>
                        <MenuItem value="always">{t('every minute')}</MenuItem>
                        <MenuItem value="none">{t('none')}</MenuItem>
                    </Select>}
            </div>
        </section>
        <footer>
            <section className="first">
                <label>{t('average help efficiency')}:</label>
                <div>{energy.averageEfficiency.total}</div>
                {parameter.period >= 24 && <footer>
                    <span>{t('awake')}: {energy.averageEfficiency.awake}</span>
                    <span>{t('asleep')}: {energy.averageEfficiency.asleep}</span>
                </footer>}
            </section>
            <Collapse in={energy.canBeFullInventory && parameter.period >= 24}>
                <section>
                    <label>{t('full inventory while sleeping')}:</label>
                    <div>{energy.timeToFullInventory < 0 ? t('none') :
                        new AmountOfSleep(energy.timeToFullInventory).toString(t)}</div>
                    <footer>
                        <span>{t('carry limit')}: {carryLimit}</span>
                        <span>{t('sneaky snacking')}: {energy.timeToFullInventory < 0 ? t('none') :
                            energy.helpCount.asleepFull.toFixed(1) + ' ' + t('times unit')}</span>
                    </footer>
                </section>
                <section>
                    <label>{t('skill trigger after wake up')}:</label>
                    <div>
                        {iv.pokemon.specialty !== 'Skills' ?
                        <>{(energy.skillProbabilityAfterWakeup.once * 100).toFixed(1)}%</> :
                        <>
                            ❶{(energy.skillProbabilityAfterWakeup.once * 100).toFixed(1)}%<> </>
                            ❷{(energy.skillProbabilityAfterWakeup.twice * 100).toFixed(1)}%
                        </>}
                    </div>
                    <footer>
                        <span>{t('lottery count')}: {energy.helpCount.asleepNotFull.toFixed(2)}</span>
                    </footer>
                </section>
            </Collapse>
        </footer>
        {iv.pokemon.skill === "Charge Energy S" && 
            <div className="warning">{t('charge energy not implemented')}</div>}
        <DialogActions disableSpacing>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledEnergyDialog>;
});

const StyledEnergyDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
        maxHeight: 'calc(100% - 20px)',
    },

    '& .MuiPaper-root': {
        width: '100%',
        '& > svg': {
            padding: '0.5rem 0 1rem',
            width: '100%',
            userSelect: 'none',
        },
        '& section': {
            padding: '0 1rem',
            '& > div': {
                display: 'flex',
                flex: '0 auto',
                flexWrap: 'wrap',
                alignItems: 'center',
                '& > label': {
                    marginRight: 'auto',
                    fontSize: '0.9rem',
                    '&.indent': {
                        marginLeft: '1rem',
                    },
                },
                '& .MuiSelect-select': {
                    paddingTop: '1px',
                    paddingBottom: '1px',
                    fontSize: '0.9rem',
                },
                '& input.MuiInput-input': {
                    fontSize: '0.9rem',
                    paddingBottom: 0,
                },
            },
        },
        '& > footer': {
            margin: '0.5rem 1rem 0 1rem',
            fontSize: '0.9rem',
            background: '#eee',
            borderRadius: '0.9rem',
            padding: '0.5rem 0.7rem',
            '& section': {
                display: 'grid',
                gridTemplateColumns: '1fr fit-content(200px)',
                marginTop: '0.4rem',
                '&.first': {
                    marginTop: 0,
                },
                padding: 0,
                '& > div': {
                    textAlign: 'right',
                },
                '& > footer': {
                    gridColumn: '1 / -1',
                    color: '#666',
                    fontSize: '0.7rem',
                    marginLeft: '0.8rem',
                    '& > span': {
                        marginRight: '1rem',
                    },
                },
            },
        },
        '& > div.warning': {
            fontSize: '0.8rem',
            color: '#666',
            padding: '0.4rem 1rem 0 1rem',
            marginLeft: '1.2rem',
        },
    },
});

export default EnergyDialog;
