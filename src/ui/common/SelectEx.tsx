import React from 'react';
import { MenuList } from '@mui/material';
import TextLikeButton from './TextLikeButton';
import PopperMenu from './PopperMenu';

const SelectEx = React.memo(({
    children,
    value,
    renderValue,
    sx,
    onChange
}: {
    children: React.ReactNode|React.ReactNode[],
    value: string|number,
    renderValue?: (value: string|number) => React.ReactNode,
    sx?: object,
    onChange?: (value: string) => void,
}) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const onClick = React.useCallback(() => {
        setOpen(true);
    }, []);
    const onClose = React.useCallback(() => {
        setOpen(false);
    }, []);
    const onMenuClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        if (onChange === undefined) {
            return;
        }

        let elm: HTMLElement|null = event.target as HTMLElement;
        while (elm !== null) {
            if (elm.nodeName === 'LI') {
                break;
            }
            elm = elm.parentElement;
        }
        if (elm === null) {
            return;
        }
        const value = elm.getAttribute('value');
        if (value !== null) {
            onChange(value);
        }
        onClose();
    }, [onChange, onClose]);

    const childrenArray = React.Children.toArray(children);
    const selectedChild = childrenArray.find(c => typeof(c) === 'object' &&
        'props' in c && c.props.value === value);
    let valueElement = null;
    if (renderValue !== undefined) {
        valueElement = renderValue(value);
    }
    else if (typeof(selectedChild) === 'object' && 'props' in selectedChild) {
        valueElement = selectedChild.props.children;
    }

    return <>
        <TextLikeButton ref={anchorRef} onClick={onClick}
            style={sx}
            className={open ? "focused" : ""}>
            {valueElement}
        </TextLikeButton>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <MenuList onClick={onMenuClick}>
                {children}
            </MenuList>
        </PopperMenu>
    </>;
});

export default SelectEx;
