import React from 'react';
import { PokemonBoxItem } from '../../../util/PokemonBox';
import { copyToClipboard } from '../../../util/Clipboard';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar,
    TextField }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxExportDialog = React.memo(({items, open, onClose}: {
    items: PokemonBoxItem[],
    open: boolean,
    onClose: () => void,
}) => {
    const [copiedMessageVisible, setCopiedMessageVisible] = React.useState(false);
    const { t } = useTranslation();
    const value = items
        .map(x => x.serialize())
        .join("\n");

    const onCopy = React.useCallback(() => {
        copyToClipboard(value).then(() => {
            setCopiedMessageVisible(true);
        }).catch(() => {});
    }, [setCopiedMessageVisible, value]);
    const onCopiedMessageClose = React.useCallback(() => {
        setCopiedMessageVisible(false);
    }, [setCopiedMessageVisible]);

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('export')}</DialogTitle>
        <DialogContent>
            <p style={{fontSize: '0.9rem', margin: 0}}>{t('export message1')}</p>
            <p style={{fontSize: '0.9rem', margin: '0.5rem 0 1rem 0'}}>{t('export message2')}</p>
            <TextField label={t('box data')}
                multiline fullWidth rows={6} defaultValue={value}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCopy}>{t('copy to clipboard')}</Button>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
        <Snackbar open={copiedMessageVisible}
            autoHideDuration={2000}
            onClose={onCopiedMessageClose}
            message={t('copied to clipboard')}/>
    </Dialog>;
});

export default BoxExportDialog;
