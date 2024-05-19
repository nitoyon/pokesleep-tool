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

const PotIcon = React.memo(() => {
    return (
        <svg viewBox="0 0 512 512">
            <path d="M218.856,98.781c4.859,1.75,12.844,4.656,12.844,11.5h48.578c0-6.844,8.016-9.75,12.875-11.5
                c5.344-1.906,16.813-9.938,16.813-22.813c0-20.375-20.234-35.391-53.969-35.391s-53.969,15.016-53.969,35.391
                C202.028,88.844,213.497,96.875,218.856,98.781z"></path>
            <path d="M447.872,167.469c0-22.813-18.469-41.281-41.281-41.281H105.388c-22.797,0-41.266,18.469-41.266,41.281v24.75h383.75V167.469z"></path>
            <path d="M492.388,215.594c-10.813,0-32.813,0-44.516,0h-7.75H71.888h-7.766c-11.703,0-33.688,0-44.516,0
                c-27.5,0-24.75,26.141,0,30.266c12.328,2.047,31.719,10.828,44.516,24.328v159.969c0,22.797,18.469,41.266,41.266,41.266h301.203
                c22.813,0,41.281-18.469,41.281-41.266V270.203c12.797-13.516,32.188-22.297,44.516-24.344
                C517.153,241.734,519.888,215.594,492.388,215.594z"></path>
        </svg>
    );
});

export default PotIcon;