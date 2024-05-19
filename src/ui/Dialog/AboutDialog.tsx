import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next'

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
            <Typography paragraph>
                    <Trans i18nKey="about1"
                        components={{
                            profile: <a href={t('profile')}>profile</a>,
                        }}/>
                </Typography>
                <Typography paragraph>
                    <Trans i18nKey="about2"
                        components={{
                            x: <a href="https://twitter.com/nitoyon">@nitoyon</a>,
                            github: <a href="https://github.com/nitoyon/pokesleep-tool">GitHub</a>,
                        }}/>
                </Typography>
                <Typography paragraph>
                    <Trans i18nKey="about3"
                        components={{
                            wiki: <a href="https://wikiwiki.jp/poke_sleep/">wiki</a>,
                            rp: <a href="https://docs.google.com/spreadsheets/d/1kBrPl0pdAO8gjOf_NrTgAPseFtqQA27fdfEbMBBeAhs/#gid=1673887151">RP collection project</a>
                        }}/>
                    <Trans i18nKey="about4"/>
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
