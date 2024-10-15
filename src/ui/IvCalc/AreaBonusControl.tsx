import React from 'react';
import { styled } from '@mui/system';
import { Autocomplete, Paper, Popper, TextField } from '@mui/material';

const maxBonus = 100;

const AreaBonusControl = React.memo(({value, onChange}: {
    value: number,
    onChange: (value: number) => void,
}) => {
    // Whether TextField is empty or not
    const [isEmpty, setIsEmpty] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement|null>(null);

    const updateValue = React.useCallback((rawText: string) => {
        let newValue = parseInt(rawText, 10);
        if (isNaN(newValue) || newValue < 1) {
            newValue = 0;
        }
        if (newValue > maxBonus) {
            newValue = maxBonus;
        }
        setIsEmpty(false);
        if (value !== newValue) {
            onChange(newValue);
        }
    }, [onChange, value]);
    const _onChange = React.useCallback((e: any) => {
        if (e === null) {
            return;
        }
        const rawText = e.target.value;

        // Update isEmpty state
        if (typeof(rawText) === "string" && rawText.trim() === "") {
            setIsEmpty(true);
            onChange(0);
            return;
        }
        updateValue(rawText);
    }, [updateValue, onChange]);
    const onFocus = React.useCallback(() => {
        setIsFocused(true);
    }, []);
    const onBlur = React.useCallback((e: any) => {
        setIsFocused(false);

        if (e === null) {
            return;
        }
        updateValue(e.target.value);
    }, [updateValue]);
    const onSelected = React.useCallback((e: any, value: string|null) => {
        if (value !== null) {
            onChange(parseInt(value, 10));
        }
    }, [onChange]);

    const options = ["0%", "5%", "10%", "15%", "20%", "25%", "30%", "35%", "40%", "45%",
        "50%", "55%", "60%", "65%", "70%", "75%", "80%", "85%", "90%", "95%", "100%"];
    const filterOptions = React.useCallback((x: string[]) => x, []);

    const valueText = isEmpty ? "" :
        value.toString() + (isFocused ? "" : "%");
    const inputType = isFocused ? "number" : "text";
    return (<Autocomplete size="small" options={options}
                freeSolo disableClearable
                value={valueText} sx={{width: '4rem'}}
                onFocus={onFocus}
                onBlur={onBlur}
                onInputChange={_onChange}
                onChange={onSelected}
                filterOptions={filterOptions}
                renderInput={(params) => <TextField {...params}
                    variant="standard" type={inputType}
                    inputRef={inputRef}
                    inputProps={{
                        ...params.inputProps,
                        min: 0,
                        max: maxBonus,
                        inputMode: "numeric",
                        style: {textOverflow: "clip"},
                    }}
                />}
                PaperComponent={StyledPopup}
                PopperComponent={PopperComponent}
            />
    );
});

const PopperComponent = function (props: any) {
    return (<Popper {...props} style={{width: '17.5rem'}} placement='bottom-end' />)
}

const StyledPopup = styled(Paper)({
    width: '17.5rem',
    '& > ul': {
        display: 'grid',
        gridTemplateColumns: '3.5rem 3.5rem 3.5rem 3.5rem 3.5rem',
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
        '& > li.MuiAutocomplete-option:nth-of-type(5n)': {
            borderRight: 0,
        },
    },
});

export default AreaBonusControl;
