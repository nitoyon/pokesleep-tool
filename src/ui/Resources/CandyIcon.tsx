import React from 'react';

const CandyIcon = React.memo(() => {
    return (
        <svg width="24" height="24">
            <svg viewBox="0 0 75 75">
                <g strokeLinejoin="round" strokeWidth="4" stroke="#e7ba67" fill="#e7ba67"
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
