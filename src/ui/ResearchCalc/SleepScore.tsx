import React from 'react';
import { styled } from '@mui/system';

interface SleepScoreProps {
    score: number,
}

export default function SleepTime({score}:SleepScoreProps) {
    const s = score;
    const img = `radial-gradient(#ffffff 50%, transparent 51%), conic-gradient(#489eff 0% ${s}%, #dddddd ${s+1}% 100%)`;
    return <StyledPie style={{backgroundImage: img}}>{score}</StyledPie>;
}

const StyledPie = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '2.4rem',
    height: '2.4rem',
    fontSize: '.7rem',
    fontWeight: 700,
    borderRadius: '50%',
    color: '#489eff',
    backgroundImage: 'radial-gradient(#ffffff 50%, transparent 51%), conic-gradient(#489eff 0% 0%, #dddddd 1% 100%)',
});