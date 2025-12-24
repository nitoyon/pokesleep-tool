import React from 'react';
import { AppType } from '../AppConfig';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next'

interface HowToDialogProps {
    app: AppType;
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
}

export default function HowToDialog({app, open, onClose}: HowToDialogProps) {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('how to use')}</DialogTitle>
            <DialogContent dividers>
                <Typography sx={{
                    marginBottom: "16px"
                }}>{t(`${app}.description`)}</Typography>
                <Typography sx={{
                    marginBottom: "16px"
                }}>{t(`${app}.notice detail1`)}</Typography>
                <Typography sx={{
                    marginBottom: "16px"
                }}>
                    <Trans i18nKey={`${app}.notice detail2`}
                        components={{
                            YouTube: <a href="https://www.youtube.com/@nitoyon-24">YouTube channel</a>,
                        }}/>
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
