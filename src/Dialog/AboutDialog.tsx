import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Typography } from '@mui/material';
import { useTranslation } from 'react-i18next'

interface AboutDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

export default function AboutDialog({open, onClose}: AboutDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('about')}</DialogTitle>
            <DialogContent dividers>
                <Typography paragraph>{t('about1')}</Typography>
                <Typography paragraph>{t('about2')}</Typography>
                <Typography paragraph>{t('about3')}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
