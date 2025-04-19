import React from 'react';
import { styled } from '@mui/system';
import { Autocomplete, Paper, Slider, TextField } from '@mui/material';
import ArrowButton from '../common/ArrowButton';

const LevelControlContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    height: '1.8rem',
});

const UnselectableSlider = styled(Slider)({
    userSelect: 'none',
    '& *': {
        userSelect: 'none',
    },
});

const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const LevelControl = React.memo(({value, onChange}: {
    value: number,
    onChange: (value: number) => void,
}) => {
    // Whether TextField is empty or not
    const [isEmpty, setIsEmpty] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement|null>(null);

    const _onChange = React.useCallback((e: any) => {
        if (e === null) {
            return;
        }
        const rawText = e.target.value;

        // fix iOS bug on MUI slider
        // https://github.com/mui/material-ui/issues/31869
        if (isIOS && e.type === 'mousedown') {
            return;
        }

        // Update isEmpty state
        if (typeof(rawText) === "string" && rawText.trim() === "") {
            setIsEmpty(true);
            onChange(1);
            return;
        }

        let value = parseInt(rawText, 10);
        if (isNaN(value) || value < 1) {
            value = 1;
        }
        if (value > 100) {
            value = 100;
        }
        setIsEmpty(false);
        onChange(value);
    }, [onChange]);
    const onSelected = React.useCallback((e: any, value: string|null) => {
        if (value !== null) {
            onChange(parseInt(value, 10));
            // fix unknown bug: selected level's is not displayed property.
            // 1. When the level is 30, tap the textbox and tap level 25.
            // 2. Tap the textbox, then level 25 should be selected, but
            //    level 30 is selected.
            // To avoid this bug, we use  setTimeout() function.
            setTimeout(() => {inputRef.current?.blur();});
        }
    }, [onChange]);

    const onLevelDownClick = React.useCallback(() => {
        onChange(value - 1);
    }, [value, onChange]);
    const onLevelUpClick = React.useCallback(() => {
        onChange(value + 1);
    }, [value, onChange]);

    const options = ["10", "25", "30", "50", "60", "65", "75", "100"];
    const filterOptions = React.useCallback((x: string[]) => x, []);

    const valueText = isEmpty ? "" : value.toString();
    return (<LevelControlContainer>
            <Autocomplete size="small" options={options}
                freeSolo disableClearable
                value={valueText} sx={{width: '3rem'}}
                onBlur={_onChange}
                onInputChange={_onChange}
                onChange={onSelected}
                filterOptions={filterOptions}
                renderInput={(params) => <TextField {...params}
                    variant="standard" type="number"
                    inputRef={inputRef}
                    inputProps={{
                        ...params.inputProps,
                        min: 1,
                        max: 100,
                        inputMode: "numeric",
                        style: {textOverflow: "clip", fontSize: '0.9rem'},
                    }}
                />}
                PaperComponent={StyledPopup}
            />
            <ArrowButton label="◀" disabled={value === 1} onClick={onLevelDownClick}/>
            <UnselectableSlider min={0} max={100} size="small" style={{userSelect: "none"}}
                value={value} onChange={_onChange}/>
            <ArrowButton label="▶" disabled={value === 100} onClick={onLevelUpClick}/>
        </LevelControlContainer>
    );
});

const StyledPopup = styled(Paper)({
    width: '14rem',
    '& > ul': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        '& > li.MuiAutocomplete-option': {
            display: 'inline-block',
            width: '3.5rem',
            textAlign: 'center',
            height: '3rem',
            padding: 0,
            verticalAlign: 'middle',
            lineHeight: '2.8rem',
            borderRight: '1px solid #ccc',
            borderBottom: '1px solid #ccc',
        },
    },
});
  
  
  
export default LevelControl;