import React from 'react';
import SliderAndArrow from './SliderAndArrow';
import NumericInput, { NumericInputHandle, NumericInputProps } from './NumericInput';

/**
 * An Input component that accepts numeric values and provides type-safe
 * onChange handling with number type instead of string.
 * Conditionally renders NumericInputKeyboard or NumericInputTouch based on device capability.
 */
const NumericSliderInput = React.memo(React.forwardRef<NumericInputHandle, NumericInputProps>(
    ({min, max, value, onChange, ...props}, ref) => {
    return <NumericInput ref={ref} min={min} max={max} value={value}
        onChange={onChange} {...props}>
        <SliderAndArrow min={min ?? 0} max={max ?? Number.MAX_SAFE_INTEGER}
            sx={{padding: '0.2rem 0.5rem', minWidth: '300px'}}
            value={value} onChange={onChange}/>
    </NumericInput>;
}));

export default NumericSliderInput;
