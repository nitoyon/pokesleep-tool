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

const HoneyIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props}>
            <svg viewBox="0 0 200 200">
                <HoneyIconPaths/>
            </svg>
        </SvgIcon>
    );
});

export const HoneyIconPaths = () => (
    <>
        <path d="M14.3,142.6c8.6,21.5,22.6,31.6,27,34.6,18.6,12.7,32.2,12,58.2,11.9h.6c26,0,39.6.7,58.2-11.9,5.4-3.7,25.4-18.1,31.9-51.3.2-.8,1.1-5.2,1.6-11.4,1-12.1.4-31.1-11.1-44.1s-30.1-19.7-30.1-19.7c0,0,10.2-1,16.5-8.4,4.3-5.1,5.2-11.4,2.2-16.7-3.2-5.6-10.1-8.2-16.5-8.3-15.5-.2-31.8-.3-52.7,0h-.6c-20.9-.3-37.2-.2-52.7,0-6.3,0-13.3,2.7-16.5,8.3-3,5.3-2.2,11.6,2.2,16.7,6.3,7.4,16.5,8.4,16.5,8.4,0,0-18.6,6.7-30.1,19.7-17.4,19.6-9.9,53.1-9.4,55.5,1.2,6.2,2.9,11.8,4.8,16.7Z" fill="#fff" strokeWidth="0"/>
        <path d="M173,91.3c-3.4-8.2-11.5-18.9-26.1-19.3-12.5-.3-43.9.3-46.9.3s-34.4-.7-46.9-.3c-14.6.4-22.7,11.1-26.1,19.3-2,4.7-2,15.5-2,20.3,0,15.4,4.9,24.3,7.6,30.7,1.1,2.6,3.4,6.2,6.3,10,4.6,5.9,10.7,12.1,16.6,15,11.3,5.7,24.6,6.7,44.4,6.7h.4c19.8,0,33-1,44.4-6.7,9.5-4.8,20-18.2,22.8-25,1.2-2.9,2.9-6.3,4.4-10.7,1.8-5.2,3.2-11.6,3.2-20s0-15.6-2-20.3h0Z" fill="#fac800" strokeWidth="0"/>
        <path d="M191.5,114.5c-5.1,6.5-11.9,12.2-19.7,17.1-1.5,4.3-3.2,7.8-4.4,10.7-2.9,6.7-13.3,20.2-22.8,25-11.3,5.7-24.6,6.7-44.4,6.7h-.4c-19.8,0-33-1-44.4-6.7-5.8-2.9-12-9.1-16.6-15-9.8-2.2-18.2-5.5-24.4-9.8h-.2c8.6,21.6,22.6,31.7,27,34.7,18.6,12.7,32.2,12,58.2,11.9h.6c26,0,39.6.7,58.2-11.9,5.4-3.7,25.4-18.1,31.8-51.3.2-.8,1.1-5.2,1.7-11.4h-.3,0Z" fill="#d8d5cb" strokeWidth="0"/>
        <path d="M55.5,167.3c11.3,5.7,24.6,6.7,44.4,6.7h.4c19.8,0,33-1,44.4-6.7,9.5-4.8,20-18.2,22.8-25,1.2-2.9,2.9-6.3,4.4-10.7-35.8,22.5-94.9,29.3-132.9,20.7,4.6,5.9,10.7,12.1,16.6,15h0Z" fill="#d69045" strokeWidth="0"/>
        <circle cx="58.7" cy="92.6" r="9.2" fill="#fff" strokeWidth="0"/>
        <path d="M14.3,142.6c8.6,21.5,22.6,31.6,27,34.6,18.6,12.7,32.2,12,58.2,11.9h.6c26,0,39.6.7,58.2-11.9,5.4-3.7,25.4-18.1,31.9-51.3.2-.8,1.1-5.2,1.6-11.4,1-12.1.4-31.1-11.1-44.1s-30.1-19.7-30.1-19.7c0,0,10.2-1,16.5-8.4,4.3-5.1,5.2-11.4,2.2-16.7-3.2-5.6-10.1-8.2-16.5-8.3-15.5-.2-31.8-.3-52.7,0h-.6c-20.9-.3-37.2-.2-52.7,0-6.3,0-13.3,2.7-16.5,8.3-3,5.3-2.2,11.6,2.2,16.7,6.3,7.4,16.5,8.4,16.5,8.4,0,0-18.6,6.7-30.1,19.7-17.4,19.6-9.9,53.1-9.4,55.5,1.2,6.2,2.9,11.8,4.8,16.7Z" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
    </>
);

export default HoneyIcon;
