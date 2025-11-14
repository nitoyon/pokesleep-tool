import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent
} from '@mui/material';
import { useTranslation } from 'react-i18next'

const MessageDialog = React.memo(({message, open, onClose}: {
    onClose: () => void,
    open: boolean,
    message: React.ReactNode,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent style={{paddingBottom: 0}}>{message}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} autoFocus>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
});

export default MessageDialog;
