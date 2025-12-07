import React from 'react';
import { Input } from '@mui/material';
import PopperMenu from './PopperMenu';
import { NumericInputHandle, NumericInputProps } from './NumericInput';
import { formatWithComma } from '../../util/NumberUtil';

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
        if (children !== undefined) {
            setOpen(true);
        }
        setRawText(value.toString());
    }, [children, value]);
    const onClose = React.useCallback(() => {
        setFocused(false);
        setOpen(false);
    }, []);
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
    // Sync rawText when value changes from outside
    React.useEffect(() => {
        setRawText(value.toString());
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
        <Input {...props} type="tel"
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
