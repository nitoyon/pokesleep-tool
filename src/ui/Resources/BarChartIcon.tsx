import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const BarChartIcon = React.memo(({pmf, ...props}:
    ({pmf?: boolean}&SvgIconProps)) =>
{
    if (pmf) {
        return (
            <SvgIcon {...props}>
                <svg viewBox="0 0 200 200" fill="#888">
                    <rect x="0" y="130" width="30" height="50"/>
                    <rect x="40" y="60" width="30" height="120"/>
                    <rect x="80" y="30" width="30" height="150"/>
                    <rect x="120" y="50" width="30" height="130"/>
                    <rect x="160" y="120" width="30" height="60"/>
                </svg>
            </SvgIcon>
        );
    } else {
        return (
            <SvgIcon {...props}>
                <svg viewBox="0 0 200 200" fill="#888">
                    <rect x="0" y="160" width="30" height="20"/>
                    <rect x="40" y="140" width="30" height="40"/>
                    <rect x="80" y="80" width="30" height="100"/>
                    <rect x="120" y="40" width="30" height="140"/>
                    <rect x="160" y="30" width="30" height="150"/>
                </svg>
            </SvgIcon>
        );
    }
});

export default BarChartIcon;
