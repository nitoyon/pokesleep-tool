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
    const onClickAway = React.useCallback((e: MouseEvent | TouchEvent) => {
        // if anchorEl is clicked, we shouldn't reopen the popper
        if (e.target === anchorEl) {
            e.preventDefault();
        }
        onClose();
    }, [anchorEl, onClose]);

    return (
        <Popper open={open} anchorEl={anchorEl} placement="bottom-start"
            style={{zIndex: 1500, maxWidth: '95vw'}}>
            <Paper elevation={10}>
                <ClickAwayListener onClickAway={onClickAway}>
                    {children}
                </ClickAwayListener>
            </Paper>
        </Popper>
    );
});

export default PopperMenu;
