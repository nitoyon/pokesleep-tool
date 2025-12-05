import React from 'react';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import { maxLevel } from '../../../util/PokemonRp';
import ArrowButton from '../../common/ArrowButton';
import NumericInput, { NumericInputHandle } from '../../common/NumericInput';
import SliderEx from '../../common/SliderEx';

const LevelControlContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    height: '1.8rem',
    '& > div.numeric': {
        width: '2.2rem',
        '& > div.MuiInput-root > input': {
            fontSize: '0.9rem',
        },
    },
});

const LevelControl = React.memo(({max100, value, onChange}: {
    max100?: boolean,
    value: number,
    onChange: (value: number) => void,
}) => {
    const max = max100 ? 100 : maxLevel;
    return (<LevelControlContainer>
            <LevelInput max100={max100} value={value} onChange={onChange}/>
            <LevelSlider max={max} value={value} onChange={onChange}/>
        </LevelControlContainer>
    );
});

export const LevelInput = React.memo(({max100, showSlider, value, onChange}: {
    max100?: boolean,
    showSlider?: boolean,
    value: number,
    onChange: (value: number) => void,
}) => {
    const inputRef = React.useRef<NumericInputHandle>(null);

    const onButtonClick = React.useCallback((num: number) => {
        onChange(num);
        inputRef.current?.close();
    }, [onChange]);

    return <NumericInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        min={1}
        max={max100 ? 100 : maxLevel}>
        <LevelSelectorPopup>
            {showSlider &&
                <LevelSlider max={100} value={value} onChange={onChange}/>
            }
            <div className="buttons">
                <Button onClick={() => onButtonClick(10)}>10</Button>
                <Button onClick={() => onButtonClick(25)}>25</Button>
                <Button onClick={() => onButtonClick(30)}>30</Button>
                {!max100 && <Button onClick={() => onButtonClick(40)}>40</Button>}
                <Button onClick={() => onButtonClick(50)}>50</Button>
                <Button onClick={() => onButtonClick(60)}>60</Button>
                <Button onClick={() => onButtonClick(65)}>65</Button>
                {max100 && <Button onClick={() => onButtonClick(75)}>75</Button>}
                {max100 && <Button onClick={() => onButtonClick(100)}>100</Button>}
            </div>
        </LevelSelectorPopup>
    </NumericInput>;
});

const LevelSelectorPopup = styled('div')({
    padding: '.3rem .7rem',
    '& > div.buttons': {
        paddingTop: '.4rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3rem 0.5rem',
        '& > button': {
            color: '#79d073',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            padding: 0,
            width: '1.8rem',
            height: '1.8rem',
            minWidth: '1.8rem',
            minHeight: '1.8rem',
            borderRadius: '50%',
            border: '1.5px solid #79d073',
        },
    }
});

const LevelSliderContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    height: '1.8rem',
    flex: 1,
});

export const LevelSlider = React.memo(({max, value, onChange}: {
    max: number,
    value: number,
    onChange: (value: number) => void,
}) => {
    const onLevelDownClick = React.useCallback(() => {
        onChange(value - 1);
    }, [value, onChange]);
    const onLevelUpClick = React.useCallback(() => {
        onChange(value + 1);
    }, [value, onChange]);

    return (<LevelSliderContainer>
            <ArrowButton label="◀" disabled={value === 1} onClick={onLevelDownClick}/>
            <SliderEx min={1} max={max} size="small" style={{userSelect: "none"}}
                value={value} onChange2={onChange}/>
            <ArrowButton label="▶" disabled={value === max} onClick={onLevelUpClick}/>
        </LevelSliderContainer>
    );
});

export default LevelControl;