import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent
} from '@mui/material';
import { useTranslation } from 'react-i18next'

const ConfirmDialog = React.memo(({okLabel, message, open, onOk, onClose}: {
    okLabel: string,
    open: boolean,
    message: React.ReactNode,
    onOk: () => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const okHandler = React.useCallback(() => {
        onOk();
        onClose();
    }, [onOk, onClose]);

    if (!open) {
        return <></>;
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent style={{paddingBottom: 0}}>{message}</DialogContent>
            <DialogActions>
                <Button onClick={okHandler} color="error">{okLabel}</Button>
                <Button onClick={onClose} autoFocus>{t('cancel')}</Button>
            </DialogActions>
        </Dialog>
    );
});

export default ConfirmDialog;
