import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

const maxBonus = 60;

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

    const options = ["0%", "5%", "10%", "25%", "30%", "35%", "40%", "45%",
        "50%", "55%", "60%"];
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
            />
    );
});

export default AreaBonusControl;
