import React from 'react';

const OilIcon = React.memo(() => {
    return (
        <svg width="32" height="32">
            <svg viewBox="0 0 72 72">
                <path fill="#d1f034" d="m33 5.5v12l-4.406 13.5 0.6289 4 0.2773 2-1.5 5v25h16v-25l-1.5-5 0.2773-2 0.6289-4-4.406-13.5v-12z"/>
                <rect x="32.5" y="4" rx="1" width="7" height="4.5" fill="#9b9b9a"/>
                <path fill="#b1d012" d="m39 7.5v9.5l4.5 14-1 6 1.5 5v25h-4v-24c0-1.5-1-3-1-5.5s2-3.5 2-5.5c0-3.5-5-12.5-5-19.5v-5z"/>
                <path fill="#157438" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.268" d="m36 4v4.5h2.5c0.554 0 1-0.446 1-1v-2.5c0-0.554-0.446-1-1-1z"/>
                <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m33.5 7.5h5"/>
                <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m38 11v1.5c0 4.5 5.5 16 5.5 19.5 0 2-1 3-1 5s1.5 3 1.5 6v24h-16v-24c0-3 1.5-4 1.5-6s-1-3-1-5c0-3.5 5.5-15 5.5-19.5v-1.5"/>
            </svg>
        </svg>
    );
});

export default OilIcon;
