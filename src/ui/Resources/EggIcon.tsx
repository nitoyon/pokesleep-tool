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

const EggIcon = React.memo(() => {
    return (
        <svg width="24" height="24">
            <svg viewBox="0 0 200 200">
                <path d="M99.6,7c37.6,0,69,44.3,75.9,90-32.4,89.7-131.7,53-151.8,36.6-1-5.6-1.6-11.6-1.6-18C22.2,64.2,56.9,7,99.6,7Z" fill="#fcfaf0" strokeWidth="0"/>
                <path d="M175.5,97c1,6.2,1.5,12.5,1.5,18.6,0,51.4-34.6,77.4-77.4,77.4s-68.7-20-75.8-59.4c20.1,16.4,119.4,53.1,151.8-36.6Z" fill="#ede0bc" strokeWidth="0"/>
                <polyline points="25 89 44.2 127 72 84.5 104 129 134.8 85.5 158.5 127 176 97" display="none" fill="none" stroke="#333" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/>
                <path d="M175.5,97c1,6.2,1.5,12.5,1.5,18.6,0,51.4-34.6,77.4-77.4,77.4s-68.7-20-75.8-59.4c-1-5.6-1.6-11.6-1.6-18C22.2,64.2,56.9,7,99.6,7s69,44.3,75.9,90Z" fill="none" stroke="#333" strokeMiterlimit="10" strokeWidth="7"/>
            </svg>
        </svg>
    );
});

export default EggIcon;
