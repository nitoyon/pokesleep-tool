import React from 'react';

const CandyIcon = React.memo(({color}: {color?: string}) => {
    const c = color || '#e7ba67';
    return (
        <svg width="24" height="24">
            <svg viewBox="0 0 75 75">
                <g strokeLinejoin="round" strokeWidth="4" stroke={c} fill={c}
                    transform="rotate(-45, 45, 45)">
                    <polygon points="30,30 10,15 10,45" />
                    <circle cx="45" cy="30" r="18" />
                    <polygon points="60,30 80,15 80,45" />
                </g>
            </svg>
        </svg>
    );
});

export default CandyIcon;
