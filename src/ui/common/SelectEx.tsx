import React from 'react';
import { MenuList } from '@mui/material';
import TextLikeButton from './TextLikeButton';
import PopperMenu from './PopperMenu';

type SelectExChildProps = {
    value: string | number,
    children: React.ReactNode,
    onClick: () => void,
    selected: boolean,
};

const SelectEx = React.memo(({
    children,
    value,
    renderValue,
    sx,
    menuSx,
    onChange
}: {
    children: React.ReactNode | React.ReactNode[],
    value: string | number,
    renderValue?: (value: string | number) => React.ReactNode,
    sx?: React.CSSProperties,
    menuSx?: React.CSSProperties,
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

    const onMenuClick = React.useCallback((child: React.ReactElement<SelectExChildProps>) => {
        if (onChange === undefined) {
            return;
        }

        const value = child.props.value;
        if (value !== null && value !== undefined) {
            onChange(String(value));
            onClose();
        }
    }, [onChange, onClose]);

    const childrenArray = React.Children.toArray(children) as React.ReactElement<SelectExChildProps>[];
    const selectedChild = childrenArray.find(c => c.props.value === value);

    let valueElement = null;
    if (renderValue !== undefined) {
        valueElement = renderValue(value);
    }
    else if (selectedChild) {
        valueElement = selectedChild.props.children;
    }

    const menuItems = childrenArray.map(child => {
        const selected = (value === child.props.value);
        return React.cloneElement(child, {
            onClick: () => { onMenuClick(child as React.ReactElement<SelectExChildProps>); },
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
