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

const OilIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <path d="M98,195.4h39.2c4.2,0,12.4-1.5,13.8-8.8,1.9-9.4,2.9-96.9-1.6-107.8-4.2-10.5-13.1-13.4-19.7-16.8-4.5-2.3-7.9-4.8-8.1-10-.5-13.9,0-39.7,0-39.7h-43.4s.5,25.8,0,39.7c-.3,8.9-19.2,5.8-27.8,26.8-4.4,10.9-3.5,98.4-1.6,107.8,1.4,7.3,9.6,8.8,13.8,8.8h35.1Z" fill="#fff" strokeWidth="0"/>
            <path d="M84.7,1c2,11.2,2,22.5,2,22.5h26.5s0-11.2,2-22.5h-30.6Z" fill="#333" strokeWidth="0"/>
            <path d="M96,195c31-6,30.8-12.5,30.8-17V60.5l.2-.4c.9.6,1.8,1.1,2.8,1.6,6.6,3.4,15.4,6.3,19.7,16.8,4.4,10.9,3.4,98.4,1.6,107.8-1.5,7.3-9.6,8.8-13.8,8.8h-41.2Z" fill="#eaeaea" strokeWidth="0"/>
            <path d="M136.7,86.5c-1-3.7-3.5-6.9-6.6-9.4-4.6-3.7-10.3-6.3-14-7.4h-32.1c-6.2,2-18.2,7.7-20.6,16.9-2.4,9.2-2.6,82.8-1.2,90.4,1.1,5.9,5,6.1,8.1,6.1h59.3s0,0,0,0c3.1,0,7-.2,8.1-6.1,1.4-7.6,1.2-81.2-1.2-90.4Z" fill="#e5df6c" strokeWidth="0"/>
            <path d="M136.9,86.5c-1-3.7-3.5-6.9-6.6-9.4-1-.9-2.1-1.6-3.3-2.4v103.2c0,1.5,0,3.2-1.1,5h4s0,0,0,0c3.1,0,7-.2,8.1-6.1,1.4-7.6,1.2-81.2-1.2-90.4Z" fill="#d1c361" strokeWidth="0"/>
            <circle cx="82.8" cy="88.8" r="7.2" fill="#fff" strokeWidth="0"/>
            <path d="M78.3,11.9" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
            <path d="M78.3,11.9s.5,25.8,0,39.7c-.3,8.9-19.2,5.8-27.8,26.8-4.4,10.9-3.4,98.4-1.6,107.8,1.4,7.3,9.6,8.8,13.8,8.8h74.4c4.2,0,12.4-1.5,13.8-8.8,1.9-9.4,2.9-96.9-1.6-107.8-4.2-10.5-13.1-13.4-19.7-16.8-1-.5-1.9-1-2.8-1.6-3.1-2-5.2-4.4-5.3-8.5-.5-13.9,0-39.7,0-39.7" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
        </SvgIcon>
    );
});

export default OilIcon;
