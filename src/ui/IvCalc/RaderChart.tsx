import React from 'react';
import { PokemonSpecialty } from '../../data/pokemons';
import { useTranslation } from 'react-i18next';

interface RaderChartProps {
    berry: number;
    ingredient: number;
    skill: number;
    width: number;
    height: number;
    specialty: PokemonSpecialty;
};

const RaderChart = React.memo(({
    berry, ingredient, skill, width, height, specialty}: RaderChartProps) => {
    const padRight = 15;
    const padTop = 130;
    const r = 80;
    const left = Math.min(300, width - padRight - r * 1.732 / 2);
    const color = specialty === "Berries" ? "#24d76a" :
        specialty === "Ingredients" ? "#fab855" :
        specialty === "Skills" ? "#44a2fd" : "#e28197";
    return <svg
        width={width} height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
            position: 'absolute',
            top: '-95px', left: '-0.5rem',
            pointerEvents: 'none',
        }}>
            <g transform={`translate(${left}, ${r + padTop})`}>
                <RaderChartAxis r={r}/>
                <RaderLine r={r} berry={berry} ingredient={ingredient}
                    skill={skill} color={color}/>
            </g>
        </svg>;
});

const RaderChartAxis = React.memo(({r}: {r: number}) => {
    const { t } = useTranslation();

    const x1 = 0;
    const y1 = -r;
    const x2 = -r * 1.732 / 2;
    const y2 = r / 2;
    const x3 = -x2;
    const y3 = y2;
    const a = 1 / 4;
    const b = 1 / 2;
    const c = 3 / 4;
    return <>
        <g fill="#666" fontSize="70%">
            <text textAnchor="middle" x={x1} y={y1-10}>{t('berry')}</text>
            <text textAnchor="end" dominantBaseline="hanging" x={x2+15} y={y2+5}>{t('skill')}</text>
            <text textAnchor="end" dominantBaseline="hanging" x={x3+5} y={y3+5}>{t('ingredient')}</text>
        </g>
        <g stroke="#ccc" fill="none">
            <polygon points={`${x1*b},${y1*b},${x2*b},${y2*b},${x3*b},${y3*b}`}/>
            <polygon points={`${x1},${y1},${x2},${y2},${x3},${y3}`}/>
        </g>
        <g stroke="#eee" fill="none">
            <polygon points={`${x1*a},${y1*a},${x2*a},${y2*a},${x3*a},${y3*a}`}/>
            <polygon points={`${x1*c},${y1*c},${x2*c},${y2*c},${x3*c},${y3*c}`}/>
        </g>
        <g stroke="#999">
            <line x1="0" y1="0" x2={x1} y2={y1}/>
            <line x1="0" y1="0" x2={x2} y2={y2}/>
            <line x1="0" y1="0" x2={x3} y2={y3}/>
        </g>
    </>;
});

const RaderLine = React.memo(({r, berry, ingredient, skill, color}: {
    r: number,
    berry: number,
    ingredient: number,
    skill: number,
    color: string,
}) => {
    berry = berry * r;
    ingredient = ingredient * r;
    skill = skill * r;
    const x1 = 0;
    const y1 = -berry;
    const x2 = -1.732 / 2 * skill;
    const y2 = skill / 2;
    const x3 = 1.732 / 2 * ingredient;
    const y3 = ingredient / 2;
    return <>
        <g stroke={color} strokeWidth={2} fill={color} fillOpacity="0.3">
            <polygon points={`${x1},${y1},${x2},${y2},${x3},${y3}`}/>
        </g>
    </>;
});

export default RaderChart;