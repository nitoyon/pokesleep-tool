import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import {SleepType} from '../data/fields';
import pokemons from '../data/pokemons';
import StyleCalculator, { createCalculator } from '../util/StyleCalculator';
import { Autocomplete, TextField } from '@mui/material';
import { InputAreaData } from './InputArea';
import { useTranslation } from 'react-i18next';

export default function GraphPanel({data}: {data: InputAreaData}) {
    const [pokemonId, setPokemonId] = useState(NaN);
    const [loading, setLoading] = useState(false);
    const [graphData, setGraphData] = useState([]);
    const onPokemonChange = useCallback((val: number) => {
        setPokemonId(val);
    }, [setPokemonId]);

    // start calculate with delay
    const DELAY = 300;
    useEffect(() => {
        if (isNaN(pokemonId)) {
            return;
        }

        setLoading(true);
        const context = {
            timer: undefined,
            calculator: createCalculator({
                field: data.fieldIndex,
                pokemonId,
                strength: data.strength,
                detail: "showRarity",
                value: "count",
            }),
            values: [],
            done: () => {},
        };
        context.done = () => {
            setLoading(false);
            setGraphData(context.values);
        };
        let timer: NodeJS.Timeout|undefined = setTimeout(() => {
            timer = undefined;
            calculate(context);
        }, DELAY);
    
        return () => {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
            if (context.timer !== undefined) {
                clearTimeout(context.timer);
            }
        };
    }, [data, pokemonId]);
    
    return (
        <div className="preview">
            <PokemonTextField fieldIndex={data.fieldIndex}
                value={pokemonId} onChange={onPokemonChange}/>
            {loading && <>Loading...</>}
            <LineChart data={graphData}/>
        </div>
    );
}

interface PokemonTextFieldProps {
    /** Current field index */
    fieldIndex: number;
    /** ID of the pokemon */
    value: number;
    /** Called when ID has been changed */
    onChange: (id: number) => void;
}

interface PokemonOption {
    id: number;
    name: string;
    type: SleepType;
}

const PokemonTextField = React.memo(({fieldIndex, value, onChange}: PokemonTextFieldProps) => {
    const { t } = useTranslation();
    const pokemonOptions: PokemonOption[] = useMemo(() => {
        const options: PokemonOption[] = [];
        Object.keys(pokemons).forEach((id) => {
            if (!(fieldIndex in pokemons[id].field)) { return; }
            options.push({
                id: parseInt(id, 10),
                name: t(`pokemon.${pokemons[id].name}`),
                type: pokemons[id].type,
            });
        });
        return options;
    }, [fieldIndex]);

    // If value not found in list, select first pokemon
    let selectedValue = pokemonOptions.find(x => x.id === value);
    if (selectedValue === undefined) {
        selectedValue = pokemonOptions[0];
    }

    const onAutocompleteChange = useCallback((event: any, newValue: PokemonOption|null) => {
        if (newValue !== null && newValue.name !== null) {
            onChange(newValue.id);
        }
    }, [onChange]);
      
    return (
        <Autocomplete size="small" options={pokemonOptions}
            value={selectedValue}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(o, v) => o.name === v.name}
            renderOption={(props, option) => (
                <li {...props}>
                    {option.name}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: "new-password"
                    }}/>
            )}
            onChange={onAutocompleteChange}/>
    );
});

interface CalculateContext {
    timer: NodeJS.Timeout|undefined;
    calculator: StyleCalculator;
    values: number[][];
    done: () => void;
}

interface MousePosition {
    x: number;
    y: number;
    svgX: number;
}

const HEIGHT = 300;
const XMARGIN = 25;
const YMARGIN = 20;

const value2y = (p: number, ymax: number) =>
    (HEIGHT - YMARGIN) * (ymax - p) / ymax;
const score2x = (s: number, width: number) =>
    (width - XMARGIN) * (s / 100) + XMARGIN;

const LineChart = React.memo(({data}: {data: number[][]}) => {
    const containerRef = useRef<HTMLDivElement|null>(null);
    const svgRef = useRef<SVGSVGElement|null>(null);
    const WIDTH = useDomWidth(containerRef);
    const [mousePos, setMousePos] = useState<MousePosition>({x: -1, y: -1, svgX: -1});
    useGraphTouch(svgRef, setMousePos);

    const YMAX = 1.1;
    const s2x = (s: number) => score2x(s, WIDTH);
    const p2y = (p: number) => value2y(p, YMAX);

    // hover check
    let isHover = false;
    let hoverScore = NaN;
    const mouseSvgX = mousePos.svgX;
    if (mouseSvgX >= 0 && mouseSvgX <= WIDTH) {
        hoverScore = Math.ceil((mouseSvgX - XMARGIN) / (WIDTH - XMARGIN) * 100 - 0.5);
        isHover = hoverScore >= 0 && hoverScore <= 100 && data.length > 0;
    }

    // draw line
    const paths = [];
    let seriesSum: number[] = [];
    for (let i = data.length - 1; i >= 0; i--) {
        const series = data[i];
        if (seriesSum.length === 0) {
            seriesSum = [...series];
        } else {
            for (let j = 0; j < series.length; j++) {
                seriesSum[j] += series[j];
            }
        }
        const path = `M${XMARGIN},${HEIGHT - YMARGIN}` +
            seriesSum
                .map((datum, score) => `L${s2x(score)},${p2y(datum)}`)
                .join(" ");
        paths.push(<path key={i} fill="none" stroke="#444cf7" strokeWidth="2" d={path}/>);
        if (isHover) {
            paths.push(<circle key={`d${i}`} r="4" stroke="#444cf7"
                cx={s2x(hoverScore)} cy={p2y(seriesSum[hoverScore])}/>);
        }
    }
    return <div className="linar_graph" ref={containerRef}>
            <svg width="100%" height={HEIGHT} style={{width: "100%", height: "300px"}}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`} ref={svgRef}>
                <ChartAxis width={WIDTH} ymax={YMAX}/>
                {isHover && <line stroke="#999" strokeWidth="0.5" 
                    x1={s2x(hoverScore)} y1="0" x2={s2x(hoverScore)} y2={HEIGHT - YMARGIN}/>}
                {paths}
            </svg>
            {isHover && <div id="graph_tooltip" style={{
                transform: `translate(${mousePos.x}px, ${mousePos.y}px)`}}>
                スコア: {hoverScore}<br/>
                {data[0][hoverScore]}
            </div>}
        </div>;
});

function useDomWidth(domRef: React.MutableRefObject<HTMLDivElement|null>) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const handler = () => {
            if (domRef.current !== null) {
                setWidth(domRef.current.clientWidth);
            }
        };
        handler();
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("resize", handler);
        };
    }, [domRef]);
    return width;
}

function useGraphTouch(svgRef: React.MutableRefObject<SVGSVGElement|null>,
    setMousePos: (pos: MousePosition) => void) {
    // Update mouseX state by mouse or touch event
    const updateMousePosition = useCallback((x: number, y: number) => {
        if (svgRef.current === null) { return; }
        // convert HTML coordinates to SVG coordinates
        const svg = svgRef.current as any;
        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const p = pt.matrixTransform(svg.getScreenCTM().inverse());
        setMousePos({x, y, svgX: p.x});
    }, [svgRef, setMousePos]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        updateMousePosition(e.touches[0].pageX, e.touches[0].pageY);
    }, [updateMousePosition]);
    const onTouchEnd = useCallback((e: TouchEvent) => {
        setMousePos({x: -1, y: -1, svgX: -1});
    }, [setMousePos]);
    const onMouseMove = useCallback((e: MouseEvent) => {
        if ('ontouchstart' in window) { return; }
        updateMousePosition(e.pageX, e.pageY);
    }, [updateMousePosition]);
    const onMouseLeave = useCallback((e: MouseEvent) => {
        setMousePos({x: -1, y: -1, svgX: -1});
    }, [setMousePos]);

    useEffect(() => {
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
}

const ChartAxis = React.memo(({width, ymax}: {width: number, ymax: number}) => {
    const s2x = (s: number) => score2x(s, width);
    const p2y = (p: number) => value2y(p, ymax);

    return <>
        <g stroke="#999" strokeWidth="1" fill="none">
            <line x1={XMARGIN} y1={HEIGHT - YMARGIN} x2={width} y2={HEIGHT - YMARGIN}/>
            <line x1={s2x(  0)} y1={HEIGHT - YMARGIN} x2={s2x(  0)} y2={HEIGHT - YMARGIN * 0.7 }/>
            <line x1={s2x( 50)} y1={HEIGHT - YMARGIN} x2={s2x( 50)} y2={HEIGHT - YMARGIN * 0.7 }/>
            <line x1={s2x(100)} y1={HEIGHT - YMARGIN} x2={s2x(100)} y2={HEIGHT - YMARGIN * 0.7 }/>
        </g>
        <g stroke="#ccc" strokeWidth="0.5" strokeDasharray="4 4">
            <line x1={XMARGIN} y1={p2y(1)} x2={width} y2={p2y(1)}/>
            <line x1={XMARGIN} y1={p2y(0.75)} x2={width} y2={p2y(0.75)}/>
            <line x1={XMARGIN} y1={p2y(0.5)} x2={width} y2={p2y(0.5)}/>
            <line x1={XMARGIN} y1={p2y(0.25)} x2={width} y2={p2y(0.25)}/>
        </g>
        <text x="20" y={p2y(1)} className="x_axis">1.0</text>
        <text x="20" y={p2y(0.75)} className="x_axis">0.75</text>
        <text x="20" y={p2y(0.5)} className="x_axis">0.5</text>
        <text x="20" y={p2y(0.25)} className="x_axis">0.25</text>
        <text x="20" y={p2y(0)} className="x_axis">0</text>

        <text x={s2x(0)} y={HEIGHT-YMARGIN / 2} className="y_axis">0</text>
        <text x={s2x(50)} y={HEIGHT-YMARGIN / 2} className="y_axis">50</text>
        <text x={s2x(100)} y={HEIGHT-YMARGIN / 2} className="y_axis">100</text>
    </>;
});

function calculate(context: CalculateContext) {
    if (context.values.length === 0) {
        for (let i = 0; i < context.calculator.valueCount; i++) {
            context.values.push([]);
        }
    }

    for (let n = 0; n < 10; n++) {
        if (context.values[0].length > 100) {
            context.done();
            return;
        }
        const ret = context.calculator.calculate(context.values[0].length);
        for (let i = 0; i < context.calculator.valueCount; i++) {
            context.values[i].push(ret[i]);
        }
    }
    
    context.timer = setTimeout(() => {
        calculate(context);
    }, 100);
}
