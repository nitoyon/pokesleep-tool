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

const CornIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <CornIconPaths />
        </SvgIcon>
    );
});

export const CornIconPaths = () => (
    <>
        <path d="M154.8,96.9l-8.1,16.7c-15.7-1.1-39,0-70.2,8.6l-1.9-17.4c-1-19.3-7.3-34.9-13.8-46.2l12.7-12h0C100.4,17,142.2-1.3,158.9,9.7c16.5,10.8,14.3,50.5-4,87v.2Z" fill="#ffe36c" strokeWidth="0"/>
        <path d="M136.9,83.7c-14.6,11.6-32.6,17.7-60.7,19.6,1.1,5-1.8-4-1.5,1.6l1.9,17.4c31.2-8.7,54.5-9.8,70.2-8.6l8.1-16.7v-.2c10.6-20.9,15.7-42.8,15.2-59.7-5.1,17-12.7,30.4-33.2,46.7Z" fill="#e8bc43" strokeWidth="0"/>
        <path d="M66.2,178.7c8.9,2.4,17.8,2.8,24.1,2.1,15.7-1.7,25.1-11.3,35.5-23.6,10.4-12.2,51.3-39.1,51.3-39.1,0,0-8.4-4-25.7-5.3-16.4-1.2-40.7,0-73.2,9.4l-2-19c-1.1-21.1-7.6-38.1-14.4-50.4-8.3-15-17.1-23-17.1-23,0,0-3.3,43.4-9,53.4-5.6,10-13.7,32.8-11.9,49.2,1.2,10.9,5.3,19.1,11.1,26" fill="#8abc62" strokeWidth="0"/>
        <path d="M30.2,152c1.4,2.3,3,4.5,4.7,6.5-5.6,3.2-10.8,15.1-9.3,20.1,2.1,6.8,19.4,17.8,26.5,16.4,7.1-1.4,12.7-12.2,14-16.3,8.9,2.4,17.8,2.8,24.1,2.1,15.7-1.7,25.1-11.3,35.5-23.6,5.2-6.1,18-15.9,29.6-24.2-74.5,34.2-117.2,28.8-125.1,18.9Z" fill="#518c4c" strokeWidth="0"/>
        <path d="M34.9,158.5c-5.6,3.2-10.8,15.1-9.3,20.1,2.1,6.8,19.4,17.8,26.5,16.4,7.1-1.4,12.7-12.2,14-16.3" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
        <path d="M69.1,125c3.1-1,6.1-1.9,9-2.8,32.5-9.5,56.9-10.7,73.2-9.4,17.2,1.3,25.7,5.3,25.7,5.3,0,0-10.2,6.7-21.7,14.9h0c-11.5,8.3-24.4,18.1-29.6,24.2-10.4,12.2-19.7,21.8-35.5,23.6-6.3.7-15.2.3-24.1-2.1-6.2-1.6-12.4-4.2-17.7-8-5.1-3.7-9.7-7.6-13.6-12.2-1.7-2-3.3-4.2-4.7-6.5h0c-3.3-5.5-5.6-11.9-6.4-19.5-1.8-16.4,7.3-38.7,11.9-49.2s9-53.4,9-53.4c0,0,8.8,8,17.1,23,6.8,12.3,13.3,29.3,14.4,50.4,0,1.8.1,3.5.2,5.4" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
        <path d="M74.4,46.7C101.3,17,143.1-1.3,159.8,9.7c16.5,10.8,12.6,53.9-5.7,90.4" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7"/>
    </>
);

export default CornIcon;
