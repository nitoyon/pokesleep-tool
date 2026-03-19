import React from 'react';
import { styled } from '@mui/system';
import { Popper } from '@mui/material';
import { clamp } from '../../../util/NumberUtil';
import { useSvgTouch, type MousePosition } from './ChartHook';
import { useTranslation } from 'react-i18next';

export const BarChart = React.memo(({
    average,
    color = "#1976d2",
    data,
    width,
    convertX,
    formatX,
    formatXDetail,
    formatY,
    formatHover,
}: {
    average: number;
    width: number;
    data: number[];
    color: string | ((index: number) => string);
    convertX: (index: number) => number;
    formatX: (value: number) => string;
    formatXDetail: (value: number) => string;
    formatY: (value: number) => string;
    formatHover: (index: number) => React.ReactNode;
}) => {
    const svgRef = React.useRef<SVGSVGElement|null>(null);
    const mouse = useSvgTouch(svgRef);

    const maxValue = clamp(0, Math.ceil(Math.max(...data) * 100) / 100, 1);
    const chartWidth = width - 50;
    const chartHeight = 160;

    return <svg ref={svgRef} width={width} height="200"
        viewBox={`0 0 ${width} 200`}>
        <g transform="translate(40, 20)">
            <BarChartAxis width={chartWidth} height={chartHeight}
                maxValue={maxValue} valueCount={data.length}
                convertX={convertX} formatY={formatY} formatX={formatX}/>
            <BarChartBars width={chartWidth} height={chartHeight}
                data={data} maxValue={maxValue} color={color} />
            <BarChartAverageLine width={chartWidth} height={chartHeight}
                average={average} valueCount={data.length}
                convertX={convertX} formatX={formatXDetail}/>
            {mouse !== null && <BarChartHover width={chartWidth}
                height={chartHeight} mouse={mouse} data={data}
                formatHover={formatHover} />}
        </g>
    </svg>;
});

const BarChartAxis = React.memo(({
    width, height, maxValue, valueCount,
    convertX, formatX, formatY
}: {
    width: number;
    height: number;
    maxValue: number;
    valueCount: number;
    convertX: (index: number) => number;
    formatX: (index: number) => string;
    formatY: (value: number) => string;
}) => {
    // Y-axis calculations
    const yScale = (value: number) => height - (value / maxValue * height);
    const y100 = yScale(maxValue);
    const y75 = yScale(maxValue * 0.75);
    const y50 = yScale(maxValue * 0.5);
    const y25 = yScale(maxValue * 0.25);
    const y0 = yScale(0);

    // X-axis calculations
    const xLabels: number[] = [];
    const xMax = convertX(valueCount);
    let xInterval: number;
    if (xMax < 4) {
        xInterval = 0.5;
    } else if (xMax < 8) {
        xInterval = 1;
    } else if (xMax < 15) {
        xInterval = 2;
    } else if (xMax < 20) {
        xInterval = 3;
    } else if (xMax < 40) {
        xInterval = 4;
    } else {
        xInterval = 8;
    }

    // Calculate help counts for each time interval
    for (let x = xInterval; x <= xMax; x += xInterval) {
        xLabels.push(x);
    }

    const xScale = (x: number) => x / xMax * width;

    return <>
        {/* Grid lines */}
        <g stroke="#ddd">
            <line x1="0" y1={y100} x2={width} y2={y100}/>
            <line x1="0" y1={y75} x2={width} y2={y75}/>
            <line x1="0" y1={y50} x2={width} y2={y50}/>
            <line x1="0" y1={y25} x2={width} y2={y25}/>
            <line x1="0" y1={y0} x2={width} y2={y0}/>
        </g>

        {/* Y-axis labels */}
        <g fontSize="60%" fill="#999" textAnchor="end">
            <text alignmentBaseline="central" x="-5" y={y100}>
                {formatY(maxValue)}
            </text>
            <text alignmentBaseline="central" x="-5" y={y75}>
                {formatY(maxValue * 0.75)}
            </text>
            <text alignmentBaseline="central" x="-5" y={y50}>
                {formatY(maxValue * 0.5)}
            </text>
            <text alignmentBaseline="central" x="-5" y={y25}>
                {formatY(maxValue * 0.25)}
            </text>
            <text alignmentBaseline="central" x="-5" y={y0}>
                {formatY(0)}
            </text>
        </g>

        {/* X-axis scales */}
        <g stroke="#bbb" transform={`translate(0,${y0})`}>
            {xLabels.map(x => (
                <line x1={xScale(x)} y1={0} x2={xScale(x)} y2={5}/>
            ))}
        </g>
        {/* X-axis labels */}
        <g fontSize="60%" fill="#999" textAnchor="middle">
            {xLabels.map(x => (
                <text key={x} alignmentBaseline="hanging"
                    x={xScale(x)} y={height + 7}>
                    {formatX(x)}
                </text>
            ))}
        </g>
    </>;
});

const BarChartBars = React.memo(({width, height, data, maxValue, color}: {
    width: number;
    height: number;
    data: number[];
    maxValue: number;
    color: string | ((index: number) => string);
}) => {
    const barWidth = width / data.length * 0.9;

    return <>
        {data.map((value, i) => {
            const x = i * width / data.length;
            const barHeight = height * (value / maxValue);
            const y = height - barHeight;
            const c = typeof(color) === 'string' ? color : color(i);
            return <rect key={i} x={x} y={y} width={barWidth}
                height={barHeight} fill={c} opacity={0.7}/>;
        })}
    </>;
});

const BarChartAverageLine = React.memo(({
    width, height, average, valueCount, convertX, formatX,
}: {
    width: number;
    height: number;
    average: number;
    valueCount: number;
    convertX: (value: number) => number;
    formatX: (value: number) => string;
}) => {
    const { t } = useTranslation();

    const x = average / valueCount * width;

    return <>
        <line x1={x} y1={0} x2={x} y2={height}
            stroke="#ff0000" strokeDasharray="4 2" strokeWidth="1.5"/>
        <text x={x} y={-5} fill="#ff0000" fontSize="60%"
            textAnchor="middle">
            {t('average')} {formatX(convertX(average))}
        </text>
    </>;
});

const BarChartHover = React.memo(({width, height, mouse, data, formatHover}: {
    width: number;
    height: number;
    mouse: MousePosition;
    data: number[];
    formatHover: (index: number) => React.ReactNode;
}) => {
    const margin = 20;
    if (mouse.svgX - 40 < -margin || mouse.svgX - 40 > width + margin) {
        return <></>;
    }

    // Calculate hovered bar index
    const index = Math.floor((mouse.svgX - 40) / width * data.length);
    if (index < 0 || index >= data.length) {
        return <></>;
    }

    const x = index / data.length * width;
    const barWidth = width / data.length * 0.9;

    const anchorEl = {
        getBoundingClientRect: () => {
            return new DOMRect(mouse.x - window.scrollX, mouse.y - window.scrollY, 0, 0);
        }
    };

    return <>
        {/* Highlight bar */}
        <rect x={x} y={0} width={barWidth} height={height}
            fill="#ff0000" opacity={0.3}/>

        {/* Tooltip */}
        <StyledPopper open={true} anchorEl={anchorEl} placement="right-end"
            modifiers={[
                {
                    name: 'offset',
                    options: {
                        offset: [0, 12],
                    },
                },
            ]}
        >
            <div>{formatHover(index)}</div>
        </StyledPopper>
    </>;
});

const StyledPopper = styled(Popper)({
    pointerEvents: 'none',
    zIndex: 2147483647,
    '& > div': {
        background: 'rgba(246, 246, 246, 0.8)',
        borderRadius: '0.8rem',
        boxShadow: '4px 2px 5px 3px rgba(128, 128, 128, 0.2)',
    },
});
