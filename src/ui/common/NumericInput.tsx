import React from 'react';
import { InputProps } from '@mui/material';
import NumericInputKeyboard from './NumericInputKeyboard';
import NumericInputTouch from './NumericInputTouch';

/**
 * Can use keyboard or not.
 */
const canUseKeyboard = window.matchMedia('(any-pointer: fine)').matches;

/** Props to omit from InputProps for NumericInput component. */
type OmitProps = 'inputProps' | 'onBlur' | 'onChange' | 'onFocus' | 'type' | 'value';

/**
 * Handle for NumericInput component to control from parent.
 */
export interface NumericInputHandle {
    focus: () => void;
    close: () => void;
}

/**
 * Props for NumericInput component.
 */
export type NumericInputProps = Omit<InputProps, OmitProps> & {
    min?: number,
    max?: number,
    value: number,
    onChange: (value: number) => void,
    children?: React.ReactNode,
};

/**
 * An Input component that accepts numeric values and provides type-safe
 * onChange handling with number type instead of string.
 */
const NumericInput = React.memo(React.forwardRef<NumericInputHandle, NumericInputProps>(
    ({min, max, value, onChange, children, ...props}, ref) => {
    if (canUseKeyboard) {
        return <NumericInputKeyboard ref={ref} min={min} max={max} value={value}
            onChange={onChange} children={children} {...props}/>;
    } else {
        return <NumericInputTouch ref={ref} min={min} max={max} value={value}
            onChange={onChange} children={children} {...props}/>;
    }
}));

export default NumericInput;
