import React from 'react';

const ResearchCalcIcon = React.memo(() => {
    return (
        <svg width="48" height="48">
            <rect cx="0" cy="0" width="24" height="24" fill="#f3ac55"/>
            <g transform="translate(0, 1.8)">
                <polygon points="12,2.4,20.31,16.8,3.686,16.8,12,2.4"
                    strokeLinejoin="round" fill="#faffe9"
                    transform="translate(-12,-12) scale(1.3) translate(6.5,6.5)"/>
                <g transform="translate(12,12) scale(0.14)">
                    <g stroke="#666" fill="#fff" strokeWidth="3">
                        <polygon points="0,-40,-34.64,20,34.64,20"/>
                        <polygon points="0,-80,-69.28,40,69.28,40"/>
                    </g>
                    <g stroke="#ccc" fill="none">
                        <polygon points="0,-20,-17.32,10,17.32,10"/>
                        <polygon points="0,-60,-51.96,30,51.96,30"/>
                    </g>
                    <g stroke="#666" strokeWidth="2">
                        <line x1="0" y1="0" x2="0" y2="-80"/>
                        <line x1="0" y1="0" x2="-69.28" y2="40"/>
                        <line x1="0" y1="0" x2="69.28" y2="40"/>
                    </g>
                    <g stroke="#24d76a" strokeWidth="3" fill="#24d76a" fillOpacity="0.3">
                        <polygon points="0,-67.992,-32.194416000000004,18.588,16.786544,9.692"/>
                    </g>
                </g>
            </g>
        </svg>
    );
});

export default ResearchCalcIcon;