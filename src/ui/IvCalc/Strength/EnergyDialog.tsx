import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from '../IvState';
import EnergyIcon from '../../Resources/EnergyIcon';
import PokemonIv from '../../../util/PokemonIv';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { AmountOfSleep } from '../../../util/TimeUtil';
import { EnergyResult, AlwaysTap, NoTap } from '../../../util/Energy';
import { clamp } from '../../../util/NumberUtil';
import { useElementWidth } from '../../common/Hook';
import { Collapse, Button, Dialog, DialogActions, MenuItem, Popper,
    Select, SelectChangeEvent, Switch, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

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
            tapFrequencyAwake: Number(e.target.value),
        }}});
    }, [dispatch, parameter]);
    const onTapFrequencyAsleepChange = React.useCallback((e: SelectChangeEvent) => {
        dispatch({type: "changeParameter", payload: { parameter: {
            ...parameter,
            tapFrequencyAsleep: Number(e.target.value),
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
                <Select variant="standard" value={String(parameter.tapFrequencyAwake)}
                    onChange={onTapFrequencyChange}>
                    <MenuItem value={String(AlwaysTap)}>{t('every minute')}</MenuItem>
                    <MenuItem value={String(NoTap)}>{t('none')}</MenuItem>
                </Select>
            </div>
            <div>
                <label>{t('tap frequency')} ({t('asleep')}):</label>
                {parameter.tapFrequencyAwake === NoTap ?
                    <span style={{fontSize: '0.9rem'}}>{t('none')}</span> :
                    <Select variant="standard" value={String(parameter.tapFrequencyAsleep)}
                        onChange={onTapFrequencyAsleepChange}>
                        <MenuItem value={String(AlwaysTap)}>{t('every minute')}</MenuItem>
                        <MenuItem value={String(NoTap)}>{t('none')}</MenuItem>
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

interface MousePosition {
    x: number;
    y: number;
    svgX: number;
}

const EnergyChart = React.memo(({width, period, result}: {
    width: number,
    period: number,
    result: EnergyResult,
}) => {
    const svgRef = React.useRef<SVGSVGElement|null>(null);
    const mouse = useSvgTouch(svgRef);
    return <svg width={width} height="200" viewBox={`0 0 ${width} 200`} ref={svgRef}>
        <g transform="translate(25,3)">
            <EnergyChartAxis width={width - 50} height={180}
                period={period} sleepTime={result.sleepTime}/>
            <EnergyLine width={width - 50} height={180} result={result}/>
            {mouse !== null && <EnergyHover width={width - 50} height={180}
                x={mouse.svgX - 25} gx={mouse.x} gy={mouse.y} result={result}/>}
        </g>
    </svg>;
});

const EnergyChartAxis = React.memo(({width, height, period, sleepTime}: {
    width: number, height: number, period: number, sleepTime: number,
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
        {period < 24 && <rect x={width * period * 60 / 1440} y="0"
            width={width * (1440 - period * 60) / 1440} height={height}
            fill="#6666tt" fillOpacity="0.15"/>}
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
    let isSnacking = result.events[0].isSnacking;
    let snackX: string = isSnacking ? m2x(0).toFixed(2) : width.toString();
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

const EnergyHover = React.memo(({width, height, x, gx, gy, result}: {
    width: number, height: number, x: number,
    gx: number, gy: number, result: EnergyResult, 
}) => {
    const { t } = useTranslation();

    const margin = 20;
    if (x < -margin || x > width + margin) {
        return <></>;
    }
    x = clamp(0, x, width);
    const minute = Math.round(x / width * 1440 / 10) * 10;
    x = minute / 1440 * width;

    // find energy
    const eventIndex = result.events.findIndex(e => minute < e.minutes);
    let energy: number;
    if (eventIndex <= 0) {
        const event = result.events[result.events.length - 1];
        energy = event.energyBefore;
    }
    else {
        const curEvent = result.events[eventIndex - 1];
        const nextEvent = result.events[eventIndex];
        const rate = (minute - curEvent.minutes) / (nextEvent.minutes - curEvent.minutes);
        energy = curEvent.energyAfter +
            (nextEvent.energyBefore - curEvent.energyAfter) * rate;
    }

    // find efficiency
    let efficiency = result.efficiencies.find(e => e.start <= minute && minute < e.end);
    if (efficiency === undefined) {
        efficiency = result.efficiencies[result.efficiencies.length - 1];
    }

    // state
    let state = "";
    const isSnacking = efficiency.isSnacking;
    if (efficiency.isAwake) {
        state = isSnacking ? t('asleep (full inventory)') : t('awake');
    }
    else {
        state = isSnacking ? t('asleep (full inventory)') : t('asleep');
    }

    const anchorEl = {
        getBoundingClientRect: () => {
            return new DOMRect(gx - window.scrollX, gy - window.scrollY, 0, 0);
        }
    };

    return <>
        <line stroke="#999" x1={x} y1={0} x2={x} y2={height}/>
        <circle fill={isSnacking ? '#000' : '#1976d2'} cx={x} cy={energy2y(energy, height)} r="3"/>
        <circle fill="#ff0000" cx={x} cy={efficiency2y(efficiency.efficiency, height)} r="3"/>
        <StyledPopper open={true} anchorEl={anchorEl} placement="right-end">
            <div>
                <h3>{state}</h3>
                <h2>
                    <EnergyIcon energy={energy}/>
                    {Math.floor((minute + 420) / 60) % 24}:{Math.floor(minute % 60).toString().padStart(2, "0")}
                </h2>
                <dl>
                    <dt>{t('help efficiency')}:</dt>
                    <dd>{efficiency.efficiency}</dd>
                    <dt>{t('energy')}:</dt>
                    <dd>{Math.ceil(energy)}</dd>
                </dl>
            </div>
        </StyledPopper>
    </>;
});

const StyledPopper = styled(Popper)({
    pointerEvents: 'none',
    padding: '1rem',
    zIndex: 2147483647,
    '& > div': {
        padding: '.5rem',
        background: 'rgba(246, 246, 246, 0.8)',
        borderRadius: '0.8rem',
        boxShadow: '4px 2px 5px 3px rgba(128, 128, 128, 0.2)',
        '& > h2': {
            fontSize: '0.9rem',
            color: '#666',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            '& > svg': {
                marginRight: '0.1rem',
            },
        },
        '& > h3': {
            fontSize: '0.6rem',
            color: '#889',
            fontWeight: 'normal',
            margin: 0,
        },
        '& > dl': {
            fontSize: '0.8rem',
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            margin: '0.3rem 0 0 0',
            '& > dt': {
                margin: '0 0.4rem 0 0',
                color: '#333',
            },
            '& > dd': {
                margin: 0,
                textAlign: 'right',
            },
        },
    },
});

const energy2y = (e: number, height: number) => {
    return (150 - e) / 150 * height;
};
const efficiency2y = (e: number, height: number) => {
    return (210 - 80 * e) / 150 * height;
};

function useSvgTouch(svgRef: React.MutableRefObject<SVGSVGElement|null>) {
    const [mousePos, setMousePos] = React.useState<MousePosition|null>(null);

    // Update mouseX state by mouse or touch event
    const updateMousePosition = React.useCallback((x: number, y: number) => {
        if (svgRef.current === null) { return; }
        // convert HTML coordinates to SVG coordinates
        const svg = svgRef.current as SVGSVGElement;
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const ctm = svg.getScreenCTM();
        if (!ctm) {
            return;
        }
        const p = pt.matrixTransform(ctm.inverse());
        setMousePos({x, y, svgX: p.x});
    }, [svgRef]);

    const onTouchMove = React.useCallback((e: TouchEvent) => {
        updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    }, [updateMousePosition]);
    const onTouchEnd = React.useCallback(() => {
        setMousePos(null);
    }, []);
    const onMouseMove = React.useCallback((e: MouseEvent) => {
        if ('ontouchstart' in window) { return; }
        updateMousePosition(e.pageX, e.pageY);
    }, [updateMousePosition]);
    const onMouseLeave = React.useCallback(() => {
        setMousePos(null);
    }, []);

    React.useEffect(() => {
        if (svgRef.current === null) {
            return;
        }
        const elm = svgRef.current;
        elm.addEventListener("touchstart", onTouchMove);
        elm.addEventListener("touchmove", onTouchMove);
        elm.addEventListener("touchend", onTouchEnd);
        elm.addEventListener("mousemove", onMouseMove);
        elm.addEventListener("mouseleave", onMouseLeave);
        return () => {
            elm.removeEventListener("touchstart", onTouchMove);
            elm.removeEventListener("touchmove", onTouchMove);
            elm.removeEventListener("touchend", onTouchEnd);
            elm.removeEventListener("mousemove", onMouseMove);
            elm.removeEventListener("mouseleave", onMouseLeave);
        };
    }, [svgRef, onTouchMove, onTouchEnd, onMouseMove, onMouseLeave]);
    return mousePos;
}

export default EnergyDialog;
