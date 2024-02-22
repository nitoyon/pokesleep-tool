import React from 'react';

const SafariIcon = React.memo(() => {
    return (
        <svg width="24" height="24">
            <svg viewBox="0 0 512 512">
                <rect x="5" y="5" width="502" height="502" rx="30%"
                    stroke="#999999" strokeWidth="10" fill="#ffffff"/>
                <radialGradient id="a">
                    <stop stopColor="#0bd" offset="0" />
                    <stop stopColor="#17d" offset="1" />
                </radialGradient>

                <g transform="matrix(4 0 0 4 256 256)">
                    <circle r="52.5" fill="url(#a)" strokeWidth="5" />
                    <path d="M6 6l-12-12l-29 39" fill="#eee" />
                    <path d="M6 6l-12-12l41-28" fill="#f55" />
                </g>
            </svg>
        </svg>
    );
});

export default SafariIcon;
