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
import { IngredientsIconPaths } from './IngredientsIcon';

const IngredientDrawIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 300 300">
            <IngredientsIconPaths/>
            <g transform="scale(8) translate(15,10)" stroke="#ffffff" strokeWidth="3">
                <path d="M10 3h4v12h-4z"/>
                <circle cx="12" cy="19" r="2"/>
            </g>
            <g transform="scale(8) translate(15,10)" fill="#da3122">
                <path d="M10 3h4v12h-4z"/>
                <circle cx="12" cy="19" r="2"/>
            </g>
        </SvgIcon>
    );
});

export default IngredientDrawIcon;
