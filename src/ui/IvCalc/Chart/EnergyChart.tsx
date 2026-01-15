import React from 'react';
import { styled } from '@mui/system';
import { Popper } from '@mui/material';
import EnergyIcon from '../../Resources/EnergyIcon';
import { EnergyResult } from '../../../util/Energy';
import { clamp } from '../../../util/NumberUtil';
import { useTranslation } from 'react-i18next';
import { useSvgTouch } from './ChartHook';

export const EnergyChart = React.memo(({width, period, result}: {
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
