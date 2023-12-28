import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, DialogContent,
    ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface LanguageDialogProps {
    /** Whether dialog is open or not */
    open: boolean;
    /** callback function when dialog is closed */
    onClose: () => void;
    /** callback function when data is changed */
    onChange: (lang: string) => void;
}

export default function LanguageDialog({open, onClose, onChange}: LanguageDialogProps) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language;
    const onLanguageChange = (event: React.MouseEvent<HTMLElement>, value: string) => {
        onChange(value);
    }

    const buttons = [];
    const resources = i18n.options.resources;
    for (const lng in resources) {
        const label = i18n.getResource(lng, "translation", "name");
        buttons.push(<ToggleButton key={lng} value={lng} aria-label={lng}>{label}</ToggleButton>)
    }
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t('change language')}</DialogTitle>
            <DialogContent>
                <ToggleButtonGroup value={lang} orientation="vertical"
                    exclusive onChange={onLanguageChange}>
                    {buttons}
                </ToggleButtonGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
