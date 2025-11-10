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
import { MushroomIconPaths } from './MushroomIcon';
import { SausageIconPaths } from './SausageIcon';
import { SoyIconPaths } from './SoyIcon';
import { CoffeeIconPaths } from './CoffeeIcon';

const SuperLuckIcon = React.memo((props: SvgIconProps) => {
    return (
        <SvgIcon {...props} viewBox="0 0 200 200">
            <g transform="translate(0, 0) scale(0.48)">
                <MushroomIconPaths />
            </g>
            <g transform="translate(104, 0) scale(0.48)">
                <SausageIconPaths />
            </g>
            <g transform="translate(0, 104) scale(0.48)">
                <SoyIconPaths />
            </g>
            <g transform="translate(104,104) scale(0.48)">
                <CoffeeIconPaths />
            </g>
        </SvgIcon>
    );
});

export default SuperLuckIcon;
