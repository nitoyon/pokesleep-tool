import React from 'react';
import { ClickAwayListener, Popper, Paper } from '@mui/material';

const PopperMenu = React.memo(({
    anchorEl, children, open, onClose,
}: {
    anchorEl: HTMLElement|null,
    children: React.ReactElement,
    open: boolean,
    onClose: () => void,
}) => {
    return (
        <Popper open={open} anchorEl={anchorEl} placement="bottom-start"
            style={{zIndex: 1500}}>
            <Paper elevation={10}>
                <ClickAwayListener onClickAway={onClose}>
                    {children}
                </ClickAwayListener>
            </Paper>
        </Popper>
    );
});

export default PopperMenu;
