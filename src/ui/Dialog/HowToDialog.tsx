import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'

interface HowToDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

export default function HowToDialog({open, onClose}: HowToDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('how to use')}</DialogTitle>
            <DialogContent dividers>
                <Typography paragraph>{t('notice')}</Typography>
                <Typography paragraph>{t('notice detail1')}</Typography>
                <Typography paragraph>{t('notice detail2')}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
