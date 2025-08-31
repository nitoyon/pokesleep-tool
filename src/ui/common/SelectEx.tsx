import React from 'react';
import { MenuList } from '@mui/material';
import TextLikeButton from './TextLikeButton';
import PopperMenu from './PopperMenu';

const SelectEx = React.memo(({
    children,
    value,
    renderValue,
    sx,
    menuSx,
    onChange
}: {
    children: React.ReactNode|React.ReactNode[],
    value: string|number,
    renderValue?: (value: string|number) => React.ReactNode,
    sx?: object,
    menuSx?: object,
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
    const onMenuClick = React.useCallback((child: React.ReactElement<any>) => {
        if (onChange === undefined) {
            return;
        }

        const value = child.props.value as string;
        if (value !== null && value !== undefined) {
            onChange(value);
            onClose();
        }
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

    const menuItems = childrenArray.map(child => {
        if (!React.isValidElement(child)) {
            return null;
        }
        const selected = (value === child.props.value);
        return React.cloneElement(child as React.ReactElement<any>, {
            onClick: () => { onMenuClick(child) },
            selected,
        });
    });

    return <>
        <TextLikeButton ref={anchorRef} onClick={onClick}
            style={sx}
            className={open ? "focused" : ""}>
            {valueElement}
        </TextLikeButton>
        <PopperMenu anchorEl={anchorRef.current} open={open} onClose={onClose}>
            <MenuList style={menuSx}>
                {menuItems}
            </MenuList>
        </PopperMenu>
    </>;
});

export default SelectEx;
