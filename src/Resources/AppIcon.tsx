import React from 'react';

const AppIcon = React.memo(() => {
    return (
        <svg width="48" height="48">
            <circle cx="12" cy="12" r="12" fill="#faffe9"/>
            <svg>
                <g transform="translate(12, 12) scale(0.9)"
                    strokeLinejoin="round" strokeLinecap="round"
                    strokeWidth="0.5"
                    fillRule="evenodd">
                    <path d="M 0,-12 A 12 12 -90 1 1 0 12 A 12 12 90 1 1 0 -12 M 0,-6 A 6 6 -90 0 1 0 6 A 6 6 90 0 1 0 -6"
                        stroke="#b9b9b9" fill="#cacaca"/>
                    <path d="M 0,-12 A 12 12 -90 1 1 -10.39 6 L -5.196,3 A 6 6 210 1 0 0 -6 L 0,-12"
                        stroke="#3683ee" fill="#1683ff"/>
                </g>
            </svg>
            <svg x="6.9" y="7.2">
                <g transform="scale(0.8)">
                    <g fill="#ff944b" stroke="#faffe9" strokeWidth="1.4" strokeLinejoin="round">
                        <path d="m12 12.9-2.13 2.09c-.56.56-.87 1.29-.87 2.07C9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07L12 12.9z"/>
                        <path d="m16 6-.44.55C14.38 8.02 12 7.19 12 5.3V2S4 6 4 13c0 2.92 1.56 5.47 3.89 6.86-.56-.79-.89-1.76-.89-2.8 0-1.32.52-2.56 1.47-3.5L12 10.1l3.53 3.47c.95.93 1.47 2.17 1.47 3.5 0 1.02-.31 1.96-.85 2.75 1.89-1.15 3.29-3.06 3.71-5.3.66-3.55-1.07-6.9-3.86-8.52z"/>
                    </g>
                    <g fill="#faffe9">
                        <rect x="7.5" y="9" width="9" height="11.5"/>
                    </g>
                    <g fill="#ff944b" stroke="#ee833a" strokeWidth=".4" strokeLinejoin="round">
                        <path d="m12 12.9-2.13 2.09c-.56.56-.87 1.29-.87 2.07C9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07L12 12.9z"/>
                        <path d="m16 6-.44.55C14.38 8.02 12 7.19 12 5.3V2S4 6 4 13c0 2.92 1.56 5.47 3.89 6.86-.56-.79-.89-1.76-.89-2.8 0-1.32.52-2.56 1.47-3.5L12 10.1l3.53 3.47c.95.93 1.47 2.17 1.47 3.5 0 1.02-.31 1.96-.85 2.75 1.89-1.15 3.29-3.06 3.71-5.3.66-3.55-1.07-6.9-3.86-8.52z"/>
                    </g>
                </g>
            </svg>
        </svg>
    );
});

export default AppIcon;