import React from 'react';
import { styled } from '@mui/system';
import { IconButton, InputAdornment } from '@mui/material';
import NumericInput, { NumericInputHandle } from '../../common/NumericInput';

const maxBonus = 85;

const AreaBonusControl = React.memo(({value, onChange}: {
    value: number,
    onChange: (value: number) => void,
}) => {
    const inputRef = React.useRef<NumericInputHandle|null>(null);

    const onPercentClick = React.useCallback((percent: number) => {
        onChange(percent);
        inputRef.current?.close();
    }, [onChange]);

    // Generate percentage options (0%, 5%, 10%, ..., 85%)
    const percentages: number[] = [];
    for (let i = 0; i <= maxBonus; i += 5) {
        percentages.push(i);
    }

    return (
        <NumericInput ref={inputRef}
            min={0} max={maxBonus}
            value={value} onChange={onChange}
            sx={{width: '2.5rem', fontSize: '0.9rem'}}
            endAdornment={<InputAdornment position="end"
                onClick={() => inputRef.current?.focus()}>
                <span style={{fontSize: '0.8rem', color: '#888'}}>%</span>
            </InputAdornment>}
        >
            <StyledPercentGrid>
                {percentages.map(p => (
                    <IconButton key={p} onClick={() => onPercentClick(p)}>
                        {p}%
                    </IconButton>
                ))}
            </StyledPercentGrid>
        </NumericInput>
    );
});

const StyledPercentGrid = styled('div')({
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 3.2rem)',
    gap: 0,
    '& > button': {
        width: '3.2rem',
        height: '2rem',
        borderRadius: 0,
        fontSize: '0.85rem',
    },
});

export default AreaBonusControl;
