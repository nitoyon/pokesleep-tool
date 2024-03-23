import React from 'react';
import { styled } from '@mui/system';
import { Slider, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LevelControlContainer = styled('div')({
    display: 'flex',
    alignItems: 'top',
    gap: '1rem',
    paddingRight: '.9rem',
});

const LevelControl = React.memo(({value, onChange}: {
    value: number,
    onChange: (value: number) => void,
}) => {
    // Whether TextField is empty or not
    const [isEmpty, setIsEmpty] = React.useState(false);

    const _onChange = React.useCallback((e: any) => {
        const rawText = e.target.value;

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

    const valueText = isEmpty ? "" : value.toString();
    return (<LevelControlContainer>
            <TextField variant="standard" size="small" type="number"
                onBlur={_onChange}
                value={valueText}
                InputProps={{inputProps: {min: 1, max: 100, inputMode: "numeric", style: {textAlign: 'left'}}}}
                onChange={_onChange}/>
            <Slider min={0} max={100} size="small" style={{userSelect: "none"}}
                value={value} onChange={_onChange}/>
        </LevelControlContainer>
    );
});

export default LevelControl;