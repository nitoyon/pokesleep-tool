import React from 'react';
import { Input, InputProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Props to omit from InputProps for NumericInput component. */
type OmitProps = 'inputProps' | 'onBlur' | 'onChange' | 'onFocus' | 'type' | 'value';

/**
 * Props for NumericInput component.
 */
type NumericInputProps = Omit<InputProps, OmitProps> & {
    min?: number,
    max?: number,
    value: number,
    onChange: (value: number) => void,
};

/**
 * An Input component that accepts numeric values and provides type-safe
 * onChange handling with number type instead of string.
 */
const NumericInput = React.memo(({min, max, value, onChange, ...props}: NumericInputProps) => {
    const { t } = useTranslation();
    const [focused, setFocused] = React.useState(false);
    const [rawText, setRawText] = React.useState(value.toString());

    const minValue = min ?? 0;
    const maxValue = max ?? Number.MAX_SAFE_INTEGER;

    const onChangeHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value.replace(/,/g, "");
        setRawText(text);
        if (text === "") {
            onChange(Math.max(0, minValue));
            return;
        }

        const val = parseInt(text, 10);
        if (isNaN(val)) {
            return;
        }
        const clampedVal = Math.min(Math.max(val, minValue), maxValue);
        onChange(clampedVal);
    }, [minValue, maxValue, onChange]);

    const onFocus = React.useCallback(() => {
        setFocused(true);
        setRawText(value.toString());
    }, [value]);
    const onBlur = React.useCallback(() => {
        setFocused(false);
    }, []);

    const text = focused ? rawText : t("num", {n: value});

    return <Input {...props} type="tel"
        inputProps={{inputMode: "numeric"}}
        value={text}
        onChange={onChangeHandler}
        onFocus={onFocus}
        onBlur={onBlur}/>
});

export default NumericInput;
