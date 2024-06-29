import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from './IvState';
import PokemonIv from '../../util/PokemonIv';
import PokemonRp from '../../util/PokemonRp';
import { CalculateParameter } from '../../util/PokemonStrength';
import { AmountOfSleep } from '../../util/TimeUtil';
import { EnergyResult } from '../../util/Energy';
import { Collapse, Button, Dialog, DialogActions, MenuItem, Select, SelectChangeEvent,
    Switch, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const EnergyDialog = React.memo(({open, iv, energy, parameter, onClose, dispatch}: {
    open: boolean,
    iv: PokemonIv,
    energy: EnergyResult,
    parameter: CalculateParameter,
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
            recoveryBonusCount: parseInt(e.target.value, 10) as 0|1|2|3|4|5,
        }}});
    }, [dispatch, parameter]);
    const onScoreChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setIsScoreEmpty(e.target.value === "");
        let newVal = parseInt(e.target.value, 10);
        if (isNaN(newVal)) {
            newVal = 0;
        }
        newVal = Math.min(100, Math.max(0, newVal));
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

    if (!open) {
        return <></>;
    }

    const hasRecoveryBonus = iv.hasEnergyRecoveryBonusInActiveSubSkills;

    return <StyledEnergyDialog open={open} onClose={onClose}>
        <EnergyChart width={width} result={energy}/>
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
                        {!hasRecoveryBonus && <MenuItem value={0}>{t('none')}</MenuItem>}
                        <MenuItem value={1}>×1</MenuItem>
                        <MenuItem value={2}>×2</MenuItem>
                        <MenuItem value={3}>×3</MenuItem>
                        <MenuItem value={4}>×4</MenuItem>
                        {hasRecoveryBonus && <MenuItem value={5}>×5</MenuItem>}
                    </Select>
                </div>
                <div>
                    <label>{t('sleep score')}:</label>
                    <div>
                        <TextField variant="standard" type="number"
                            value={isScoreEmpty ? "" : parameter.sleepScore} onChange={onScoreChange}
                            inputProps={{min: 0, max: 100}}/>
                    </div>
                </div>
            </section>
        </Collapse>
        <section ref={dialogRef}>
            <div>
                <label>{t('always 81%+')}:</label>
                <div>
                    <Switch checked={parameter.isEnergyAlwaysFull} onChange={onAlways100Change}/>
                </div>
            </div>
        </section>
        <footer>
            <div>
                <label>{t('help efficiency')}:</label>
                <div>{energy.averageEfficiency.total}</div>
                <footer>
                    <span>{t('awake')}: {energy.averageEfficiency.awake}</span>
                    <span>{t('asleep')}: {energy.averageEfficiency.asleep}</span>
                </footer>
            </div>
            <div>
                <label>{t('full inventory while sleeping')}:</label>
                <div>{energy.timeToFullInventory < 0 ? t('none') :
                    new AmountOfSleep(energy.timeToFullInventory).toString(t)}</div>
                <footer>
                    <span>{t('carry limit')}: {iv.carryLimit}</span>
                    <span>{t('carry per help')}: {new PokemonRp(iv).bagUsagePerHelp.toFixed(2)}</span>
                </footer>
            </div>
            <div>
                <label>{t('skill trigger after wake up')}:</label>
                <div>{(energy.skillProbabilityAfterWakeup * 100).toFixed(1)}%</div>
            </div>
        </footer>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </StyledEnergyDialog>;
});

function useElementWidth(): [number, (elm: HTMLElement|null) => void] {
    const elmRef = React.useRef<{elm: HTMLElement|null}>({elm: null});
    const [width, setWidth] = React.useState(200);
    const observer = React.useMemo(() => {
        return new ResizeObserver(() => {
            const node = elmRef.current.elm;
            if (node === null) {
                return;
            }
            setWidth(Math.floor(node.getBoundingClientRect().width));
        });
    }, []);
    
    const ref = React.useCallback((node: HTMLElement|null) => {
        if (node === null) {
            observer.disconnect();
            return;
        }
        elmRef.current.elm = node;
        setWidth(Math.floor(node.getBoundingClientRect().width));
        observer.disconnect();
        observer.observe(node);
    }, [observer]);
    return [width, ref];
}

const StyledEnergyDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
    },

    '& .MuiPaper-root': {
        width: '100%',
        '& > svg': {
            padding: '1rem 0 1rem',
            width: '100%',
        },
        '& section': {
            padding: '0 1rem',
            '& > div': {
                display: 'flex',
                flex: '0 auto',
                alignItems: 'center',
                '& > label': {
                    marginRight: 'auto',
                    fontSize: '0.9rem',
                },
            }
        },
        '& > footer': {
            margin: '0.5rem 1rem 0 1rem',
            fontSize: '0.9rem',
            background: '#eee',
            borderRadius: '0.9rem',
            padding: '0.5rem 0.7rem',
            '& > div': {
                display: 'grid',
                gridTemplateColumns: '1fr fit-content(200px)',
                '& > div': {
                    textAlign: 'right',
                },
                '& > footer': {
                    gridColumn: '1 / -1',
                    color: '#666',
                    fontSize: '0.7rem',
                    margin: '0 0 0.8rem 0.8rem',
                    '& > span': {
                        marginRight: '1rem',
                    },
                },
            },
        }
    },
});

const EnergyChart = React.memo(({width, result}: {
    width: number,
    result: EnergyResult,
}) => {
    return <svg width={width} height="200" viewBox={`0 0 ${width} 200`}>
        <g transform="translate(25,0)">
            <EnergyChartAxis width={width - 50} height={180} sleepTime={result.sleepTime}/>
            <EnergyLine width={width - 50} height={180} result={result}/>
        </g>
    </svg>;
});

const EnergyChartAxis = React.memo(({width, height, sleepTime}: {
    width: number, height: number, sleepTime: number,
}) => {
    const y100 = energy2y(100, height);
    const y80 = energy2y(80, height);
    const y60 = energy2y(60, height);
    const y40 = energy2y(40, height);
    const y20 = energy2y(20, height);
    const y0 = energy2y(0, height);

    const e20 = efficiency2y(2, height);
    const e15 = efficiency2y(1.5, height);
    const e10 = efficiency2y(1, height);

    const m2x = (m: number) => {
        return m / 1440 * width;
    };
    const x9 = m2x(120);
    const x12 = m2x(120 + 180);
    const x15 = m2x(120 + 360);
    const x18 = m2x(120 + 540);
    const x21 = m2x(120 + 720);
    const x24 = m2x(120 + 900);
    const x27 = m2x(120 + 1080);
    const x6 = m2x(120 + 1260);
    const ye = height + 5;

    return <>
        <g stroke="#ddd">
            <line x1="0" y1={y100} x2={width} y2={y100}/>
            <line x1="0" y1={y80} x2={width} y2={y80}/>
            <line x1="0" y1={y60} x2={width} y2={y60}/>
            <line x1="0" y1={y40} x2={width} y2={y40}/>
            <line x1="0" y1={y20} x2={width} y2={y20}/>
            <line x1="0" y1={y0} x2={width} y2={y0}/>
        </g>
        <g stroke="#bbb">
            <line x1={x6} y1={height} x2={x6} y2={ye}/>
            <line x1={x9} y1={height} x2={x9} y2={ye}/>
            <line x1={x12} y1={height} x2={x12} y2={ye}/>
            <line x1={x15} y1={height} x2={x15} y2={ye}/>
            <line x1={x18} y1={height} x2={x18} y2={ye}/>
            <line x1={x21} y1={height} x2={x21} y2={ye}/>
            <line x1={x24} y1={height} x2={x24} y2={ye}/>
            <line x1={x27} y1={height} x2={x27} y2={ye}/>
        </g>
        <g fontSize="60%" fill="#999" textAnchor="end">
            <text alignmentBaseline="central" x="-5" y={y100}>100</text>
            <text alignmentBaseline="central" x="-5" y={y80}>80</text>
            <text alignmentBaseline="central" x="-5" y={y60}>60</text>
            <text alignmentBaseline="central" x="-5" y={y40}>40</text>
            <text alignmentBaseline="central" x="-5" y={y20}>20</text>
            <text alignmentBaseline="central" x="-5" y={y0}>0</text>
        </g>
        <g transform={`translate(${width + 2},0)`} fontSize="60%" fill="#999" textAnchor="start">
            <text alignmentBaseline="central" x="0" y={e20}>2.0</text>
            <text alignmentBaseline="central" x="0" y={e15}>1.5</text>
            <text alignmentBaseline="central" x="0" y={e10}>1.0</text>
        </g>
        <g transform={`translate(0,${ye+3})`} fontSize="60%" fill="#999"
            textAnchor="middle">
            <text alignmentBaseline="hanging" x={x9} y="0">9:00</text>
            <text alignmentBaseline="hanging" x={x12} y="0">12:00</text>
            <text alignmentBaseline="hanging" x={x15} y="0">15:00</text>
            <text alignmentBaseline="hanging" x={x18} y="0">18:00</text>
            <text alignmentBaseline="hanging" x={x21} y="0">21:00</text>
            <text alignmentBaseline="hanging" x={x24} y="0">24:00</text>
            <text alignmentBaseline="hanging" x={x27} y="0">3:00</text>
            <text alignmentBaseline="hanging" x={x6} y="0">6:00</text>
        </g>
        <rect x={width * sleepTime / 1440} y="0" width={width * (1440 - sleepTime) / 1440} height={height}
            fill="#000080" fillOpacity="0.08"/>
    </>;
});

const EnergyLine = React.memo(({width, height, result}: {
    width: number, height: number, result: EnergyResult
}) => {
    const m2x = (m: number) => {
        return m / 1440 * width;
    };

    const energyPoints1: string[] = [];
    const energyPoints2: string[] = [];
    let isSnacking = false;
    let snackX: string = width.toString();
    for (let i = 0; i < result.events.length; i++) {
        const yb = energy2y(result.events[i].energyBefore, height).toFixed(2);
        const ya = energy2y(result.events[i].energyAfter, height).toFixed(2);
        const m = m2x(result.events[i].minutes).toFixed(2);
        const points = isSnacking ? energyPoints2 : energyPoints1;
        points.push(`${m},${yb}`);
        if (i < result.events.length - 1) {
            points.push(`${m},${ya}`);
        }
        if (!isSnacking && result.events[i].isSnacking) {
            isSnacking = true;
            energyPoints2.push(`${m},${ya}`);
            snackX = m;
        }
    }
    const energyFillPoints1 = [...energyPoints1];
    energyFillPoints1.push(`${snackX},${height} 0,${height}`);
    const energyFillPoints2 = [...energyPoints2];
    if (energyFillPoints2.length > 0) {
        energyFillPoints2.push(`${width},${height} ${snackX},${height}`);
    }

    const effPoints: string[] = [];
    for (const efficiency of result.efficiencies) {
        const m1 = m2x(efficiency.start);
        const m2 = m2x(efficiency.end);
        const y = efficiency2y(efficiency.efficiency, height);
        effPoints.push(`${m1},${y} ${m2},${y}`);
    }

    return <>
        <polygon points={energyFillPoints1.join(' ')} stroke="none" fill="#1976d2" fillOpacity={0.2}/>
        <polyline points={energyPoints1.join(' ')} stroke="#1976d2" fill="none"/>
        {energyFillPoints2.length > 0 && <>
            <polyline points={energyPoints2.join(' ')} stroke="#000000" fill="none"/>
            <polygon points={energyFillPoints2.join(' ')} stroke="none" fill="#000000" fillOpacity={0.2}/>
        </>}
        <polyline points={effPoints.join(' ')} stroke="#ff0000" fill="none" strokeWidth="1.2"/>
    </>;
});

const energy2y = (e: number, height: number) => {
    return (150 - e) / 150 * height;
};
const efficiency2y = (e: number, height: number) => {
    return (210 - 80 * e) / 150 * height;
};

export default EnergyDialog;
