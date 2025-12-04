import React from 'react';
import { styled } from '@mui/system';
import {
    Autocomplete, Paper, PaperProps,
    Popper, PopperProps, TextField,
} from '@mui/material';
import ArrowButton from '../../common/ArrowButton';
import SliderEx from '../../common/SliderEx';

const LevelControlContainer = styled('div')({
    display: 'flex',
    alignItems: 'center',
    gap: '.7rem',
    height: '1.8rem',
});

const LevelControl = React.memo(({max, value, onChange}: {
    max: number,
    value: number,
    onChange: (value: number) => void,
}) => {
    return (<LevelControlContainer>
            <LevelInput value={value} onChange={onChange}/>
            <LevelSlider max={max} value={value} onChange={onChange}/>
        </LevelControlContainer>
    );
});

export const LevelInput = React.memo(({value, onChange}: {
    value: number,
    onChange: (value: number) => void,
}) => {
    // Whether TextField is empty or not
    const [isEmpty, setIsEmpty] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement|null>(null);

    const applyValue = React.useCallback((rawText: string) => {
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
    const onInputChange = React.useCallback((_: React.SyntheticEvent, value: string) => {
        if (value !== null) {
            applyValue(value);
        }
        setIsEmpty(value === "");
    }, [applyValue]);
    const onBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        if (e !== null && typeof(e.target.value) === 'string') {
            applyValue(e.target.value);
        }
        setIsEmpty(false);
    }, [applyValue]);
    const onSelected = React.useCallback((_: React.SyntheticEvent, value: string|string[]) => {
        if (value !== null && typeof(value) === 'string') {
            onChange(parseInt(value, 10));
            // fix unknown bug: selected level's is not displayed property.
            // 1. When the level is 30, tap the textbox and tap level 25.
            // 2. Tap the textbox, then level 25 should be selected, but
            //    level 30 is selected.
            // To avoid this bug, we use  setTimeout() function.
            setTimeout(() => {inputRef.current?.blur();});
        }
    }, [onChange]);

    const options = ["10", "25", "30", "50", "60", "65", "75", "100"];
    const filterOptions = React.useCallback((x: string[]) => x, []);

    const valueText = isEmpty ? "" : value.toString();
    return (<Autocomplete size="small" options={options}
                freeSolo disableClearable
                value={valueText}
                onInputChange={onInputChange}
                onChange={onSelected}
                filterOptions={filterOptions}
                renderInput={(params) => <TextField {...params}
                    variant="standard" type="number"
                    inputRef={inputRef}
                    onBlur={onBlur}
                    sx={{
                        '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                        },
                        '& input[type=number]': {
                            MozAppearance: 'textfield',
                        },
                    }}
                    slotProps={{
                        htmlInput: {
                            ...params.inputProps,
                            min: 1,
                            max: 100,
                            inputMode: "numeric",
                            style: {textOverflow: "clip", fontSize: '0.9rem'},
                        }
                    }}
                />}
                slots={{
                    paper: StyledPopupRef,
                    popper: PopperComponent,
                }}
            />
    );
});

const PopperComponent = function (props: PopperProps) {
    return (<Popper {...props} style={{zIndex: 2147483647}} placement='bottom-start'/>)
}

const StyledPopup = styled(Paper)<PaperProps>({
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
  
const StyledPopupRef = React.forwardRef<HTMLDivElement, PaperProps>((props, ref) => {
    // Extract sx from props. (ESLint doesn't allow this...)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sx, ...rest } = props;
    return <StyledPopup ref={ref} {...rest} />;
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