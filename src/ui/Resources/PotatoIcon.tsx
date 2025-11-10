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

const PotatoIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <PotatoIconPaths />
        </SvgIcon>
    );
});

export const PotatoIconPaths = () => (
    <>
        <path d="M9.5,72.9c6.7-11.9,36.3-52.2,73.9-53.2,54.7-1.4,70,18.5,83.3,31.8,16.5,16.5,43.5,58.4,17.5,89.8-20.2,24.4-38.9,33.6-66.8,38.5-34.6,6.1-74.4-4.1-93.7-21.4S3.3,83.9,9.5,72.9Z" fill="#f4bf7a" strokeWidth="0"/>
        <path d="M180.2,120.8c-29.3,11.9-40,23.1-67.9,28-34.6,6.1-69.6-11.6-93.7-21.4-6.2-2.5-10.7-7.4-13.8-13.6,1.5,16.3,6.7,33.6,18.9,44.6,19.4,17.3,59.1,27.5,93.7,21.4,27.9-4.9,46.6-14.1,66.8-38.5,8.5-10.3,11.3-21.7,10.7-33-2.8,5.3-7.5,9.6-14.7,12.5Z" fill="#c18f4d" strokeWidth="0"/>
        <path d="M65.4,63.1c-3.7,5.4-9.7,6.9-14,4.1" fill="none" stroke="#5b4728" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.1"/>
        <path d="M142,107.4c-6.4,1.5-11.8-1.5-13.1-6.4" fill="none" stroke="#5b4728" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.1"/>
        <path d="M59.2,140.2c6.3,1.6,9.8,6.7,8.8,11.7" fill="none" stroke="#5b4728" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.1"/>
        <path d="M9.5,72.9c6.7-11.9,36.3-52.2,73.9-53.2,54.7-1.4,70,18.5,83.3,31.8,16.5,16.5,43.5,58.4,17.5,89.8-20.2,24.4-38.9,33.6-66.8,38.5-34.6,6.1-74.4-4.1-93.7-21.4S3.3,83.9,9.5,72.9Z" fill="none" stroke="#333" strokeMiterlimit="10" strokeWidth="7.1"/>
    </>
);

export default PotatoIcon;
