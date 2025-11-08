/*
MIT License

Copyright (c) 2024 ちゃんりわ

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

const MushroomIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <path d="M126.8,158.4c9.3,26.9-6.3,33.9-18.5,36s-33.7-.5-37.5-26.2c-3.8-25.7,14.9-69.6,31-72s16.5,37.6,25,62.2Z" fill="#efca89" strokeWidth="0"/>
            <path d="M122.8,144c1.2,5.2,2.4,8.2,4,12.6,9.3,26.9-6.3,33.9-18.5,36s-33.7-.5-37.5-26.2c-.8-5.5-.6-9.9.4-16.5" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
            <path d="M193.5,94.9c6.5,29.8-16.8,39.5-53.8,35.6-33.7-3.5-59.9,8.1-84.7,8.1s-53,0-49.2-46.1C9.7,45.9,70,8.7,99.6,8.7c43.5,0,83.6,39.3,93.9,86.2Z" fill="#b27054" strokeWidth="0"/>
            <path d="M193.4,95.2c6.5,29.8-16.8,39.5-53.8,35.6-33.6-3.5-59.9,8.1-84.7,8.1s-47.4,0-49.4-35.5c25.1,25.9,167,16.9,184-22h0c1.6,4.5,2.9,9.1,3.9,13.7Z" fill="#845444" strokeWidth="0"/>
            <path d="M189.5,81.5c1.6,4.5,2.9,9.1,3.9,13.8,6.5,29.8-16.8,39.5-53.8,35.6-33.6-3.5-59.9,8.1-84.7,8.1s-47.4,0-49.4-35.5c-.2-3.2-.1-6.8.2-10.6C9.7,46.2,70,9,99.6,9s75.6,31.9,89.9,72.5Z" fill="none" stroke="#333" strokeMiterlimit="10" strokeWidth="7"/>
        </SvgIcon>
    );
});

export default MushroomIcon;
