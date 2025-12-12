import React from 'react';
import { Input } from '@mui/material';
import PopperMenu from './PopperMenu';
import { NumericInputHandle, NumericInputProps } from './NumericInput';
import { clamp, formatWithComma } from '../../util/NumberUtil';

/**
 * An numeric input component for keyboard.
 */
const NumericInputKeyboard = React.memo(React.forwardRef<NumericInputHandle, NumericInputProps>(
    ({children, min, max, value, onChange, ...props}, ref) => {
    const [open, setOpen] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [rawText, setRawText] = React.useState(value.toString());
    const anchorRef = React.useRef<HTMLElement>(null);

    const minValue = min ?? 0;
    const maxValue = max ?? Number.MAX_SAFE_INTEGER;

    // popup is enabled when children is provided
    const popupEnabled = children !== undefined;

    const onChangeHandler = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value.replace(/,/g, "");
        setRawText(text);
        if (text === "") {
            onChange(minValue);
            return;
        }

        const val = parseInt(text, 10);
        if (isNaN(val)) {
            return;
        }
        const clampedVal = clamp(minValue, val, maxValue);
        onChange(clampedVal);
    }, [minValue, maxValue, onChange]);

    const onFocus = React.useCallback(() => {
        setFocused(true);
        if (children !== undefined) {
            setOpen(true);
        }
        setRawText(value.toString());
    }, [children, value]);
    const onClose = React.useCallback(() => {
        // Parse and normalize the value when losing focus
        let normalizedVal: number;
        const text = rawText.replace(/,/g, "");
        if (text === "") {
            normalizedVal = minValue;
        } else {
            const val = parseInt(text, 10);
            if (isNaN(val)) {
                // If invalid, keep the current value
                normalizedVal = value;
            } else {
                // Clamp to min/max range
                normalizedVal = clamp(minValue, val, maxValue);
            }
        }
        onChange(normalizedVal);
        setFocused(false);
        setOpen(false);
    }, [rawText, value, minValue, maxValue, onChange]);
    const onBlur = React.useCallback(() => {
        if (popupEnabled) {
            return;
        }
        onClose();
    }, [onClose, popupEnabled]);
    // Handle Tab key to close popup
    const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Tab' && open) {
            onClose();
        }
    }, [onClose, open]);
    // Sync rawText when value changes from outside or popup
    React.useEffect(() => {
        if (!anchorRef.current?.querySelector('input')?.matches(':focus')) {
            setRawText(value.toString());
        }
    }, [value]);

    // Expose focus and close methods to parent via ref
    React.useImperativeHandle(ref, () => ({
        focus: () => {
            anchorRef.current?.querySelector('input')?.focus();
        },
        close: onClose
    }), [onClose]);

    const text = focused ? rawText : formatWithComma(value);

    return <div className="numeric keyboard">
        <Input {...props} type={focused ? "number" : "tel"}
            slotProps={{
                input: {
                    sx: {
                        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                            '-webkit-appearance': 'none',
                            margin: 0,
                        },
                        '-moz-appearance': 'textfield',
                    },
                    min, max
                }
            }}
            inputProps={{inputMode: "numeric"}}
            value={text} ref={anchorRef}
            onChange={onChangeHandler}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}/>
        <PopperMenu open={open} anchorEl={anchorRef.current} onClose={onClose}>
            <div>
                {children}
            </div>
        </PopperMenu>
    </div>;
}));

export default NumericInputKeyboard;
