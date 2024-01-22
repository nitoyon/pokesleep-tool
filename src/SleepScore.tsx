import './SleepScore.css';
import React from 'react';

interface SleepScoreProps {
    score: number;
}

export default function SleepTime({score}:SleepScoreProps) {
    const s = score;
    const img = `radial-gradient(#ffffff 50%, transparent 51%), conic-gradient(#489eff 0% ${s}%, #dddddd ${s+1}% 100%)`;
    return <div className="pie" style={{backgroundImage: img}}>{score}</div>;
}
