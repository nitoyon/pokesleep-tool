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

const MilkIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <MilkIconPaths />
        </SvgIcon>
    );
});

export const MilkIconPaths = () => (
    <>
        <path d="M139.8,194.7s5-.3,9.2-3.4c4-3,6.3-6.8,6.3-10.3,0-3.5,0-92.4,0-92.4,0,0-.2-7.5-2.4-12.5-3.8-8.4-17.3-37.6-17.6-40.8-.2-2.3-.3-7,.2-7.2,5.5-1.2,12.9-4.6,10.8-12.7-2.3-8.7-10.7-7.9-10.7-7.9h-71.1s-8.4-.8-10.7,7.9,5.3,11.6,10.8,12.7c.5.2.4,4.9.2,7.2-.3,3.3-13.8,32.4-17.6,40.8-2.3,5-2.4,12.5-2.4,12.5v92.4c0,3.5,2.3,7.3,6.3,10.3,4.2,3.1,9.2,3.4,9.2,3.4h79.6Z" fill="#fcfcfc" strokeWidth="0"/>
        <path d="M155.3,88.3v92.4c0,3.5-2.3,7.3-6.3,10.3-4.2,3.1-9.2,3.4-9.2,3.4h-37.9c21.8-2.1,33.1-12.2,33.4-19.2s0-140.4,0-140.4c.3,3.3,13.8,32.4,17.6,40.9,2.3,5,2.4,12.5,2.4,12.5Z" fill="#e5e5df" strokeWidth="0"/>
        <rect x="44.7" y="95.6" width="110.5" height="56.4" fill="#4c6dc1" strokeWidth="0"/>
        <path d="M155.6,95.6h-20v56.4h20v-56.4Z" fill="#4850b5" strokeWidth="0"/>
        <path d="M113.9,194.5h25.9s5-.3,9.2-3.4c4-3,6.3-6.8,6.3-10.3v-92.4s-.2-7.5-2.4-12.5c-3.8-8.4-17.3-37.6-17.6-40.9-.2-2.3-.3-7,.2-7.2,5.5-1.2,12.9-4.6,10.8-12.7-2.3-8.7-10.7-7.9-10.7-7.9h-71.1s-8.4-.8-10.7,7.9c-2.2,8.1,5.3,11.6,10.8,12.7.5.2.4,4.9.2,7.2-.3,3.3-13.8,32.4-17.6,40.9-2.3,5-2.4,12.5-2.4,12.5v92.4c0,3.5,2.3,7.3,6.3,10.3,4.2,3.1,9.2,3.4,9.2,3.4h53.7Z" fill="none" stroke="#333" strokeMiterlimit="10" strokeWidth="8"/>
    </>
);

export default MilkIcon;
