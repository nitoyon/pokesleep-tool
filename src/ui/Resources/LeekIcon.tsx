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

const LeekIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <path d="M76,92.9l43.2,27c-18.6,28.5-47.7,75.3-51.5,75.6-4.8.4-37.6-19.8-39.2-25.3-1.2-4,29.3-49.2,47.5-77.3Z" fill="#f7fced" strokeWidth="0"/>
            <path d="M87.1,75.1l43.4,28c-2.8,3.8-6.7,9.8-11.3,16.9l-43.2-27c4.9-7.6,8.9-13.9,11.1-17.9Z" fill="#b8ea6a" strokeWidth="0"/>
            <path d="M172.4,47.4c5.3,1.6,14,30,11.4,34-2.6,4-46.1,17.4-49.3,17.1-.4,0-1.8,1.7-4,4.6l-43.4-28c.9-1.6,1.5-2.8,1.8-3.5,3.8-10,3.7-58.3,8.4-62s41.3-6.4,42-2.1c.6,4.3-4.9,45-2.9,47.8,2.2,3.2,34.5-8.3,36-7.9Z" fill="#37a56b" strokeWidth="0"/>
            <path d="M111.5,113.9c-17.5,27.2-41.9,66.8-53.7,76.4,4.5,2.4,8.2,4,9.6,3.9,3.8-.3,32.9-47.1,51.5-75.7l-7.4-4.6Z" fill="#dce2cc" strokeWidth="0"/>
            <path d="M111.1,114.7l7.8,4.9c4.6-7.1,8.6-13,11.3-16.9l-7.8-5.1c-3.2,4.5-7,10.4-11.3,17.1Z" fill="#a3c180" strokeWidth="0"/>
            <path d="M183.6,81.1c.8-1.2.6-4.6-.3-8.9-14.4,3.9-47,12.7-53.2,15.8-1.4.7-4.1,4.1-7.8,9.3l7.8,5.1c2.1-2.9,3.6-4.6,4-4.6,3.2.3,46.8-12.8,49.4-16.8Z" fill="#40895e" strokeWidth="0"/>
            <path d="M136.4,55.2c-.9-25.7,3.6-43.5,2.9-47.8-.6-4.3-37.2-1.7-42,2.1s-4.6,52-8.4,62c-.3.8-.9,2-1.8,3.5-2.2,4-6.2,10.3-11.1,17.9-18.2,28.2-48.7,73.3-47.5,77.3,1.6,5.5,34.3,25.7,39.2,25.3,3.8-.3,32.9-47.1,51.5-75.6,4.6-7.1,8.6-13,11.3-16.9,2.1-3,3.5-4.7,4-4.6,3.2.3,46.7-13.1,49.3-17.1,2.6-4-6.1-32.4-11.4-34-1.1-.3-12.6,5-22.9,7.1" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
        </SvgIcon>
    );
});

export default LeekIcon;
