import React from 'react';
import { styled } from '@mui/system';
import { Slider, SliderProps } from '@mui/material';

const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);

type SliderPropsEx = SliderProps & {
    onChange2: (value: number) => void,
};

/**
 * A customized Collapse component that animates the height and caches
 * its children when hidden.
 */
const SliderEx = React.memo((props: SliderPropsEx) => {
    const {onChange2, ...origProps} = props;

    const changeHandler = React.useCallback((e: Event, value: number|number[]) => {
        if (e === null) {
            return;
        }

        // fix iOS bug on MUI slider
        // https://github.com/mui/material-ui/issues/31869
        if (isIOS && e.type === 'mousedown') {
            return;
        }

        if (typeof(value) === 'number') {
            onChange2(value);
        }
    }, [onChange2]);

    return <UnselectableSlider onChange={changeHandler} {...origProps}/>
});

const UnselectableSlider = styled(Slider)({
    userSelect: 'none',
    '& *': {
        userSelect: 'none',
    },
});

export default SliderEx;
