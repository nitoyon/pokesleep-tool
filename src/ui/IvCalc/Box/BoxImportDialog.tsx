import React from 'react';
import PokemonBox from '../../../util/PokemonBox';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar,
    TextField }  from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxImportDialog = React.memo(({box, open, onClose}: {
    box: PokemonBox,
    open: boolean,
    onClose: () => void,
}) => {
    const [value, setValue] = React.useState("");
    const [importedMessage, setImportedMessage] = React.useState("");
    const { t } = useTranslation();

    const onValueChange = React.useCallback((e: any) => {
        setValue(e.target.value);
    }, [setValue]);

    const onClose_ = React.useCallback(() => {
        setValue("");
        onClose();
    }, [setValue, onClose]);

    const onImportClick = React.useCallback(() => {
        const lines = value.split(/\n/g);
        let added = 0;
        for (const line of lines) {
            if (!box.canAdd) {
                break;
            }
            const data = box.deserializeItem(line);
            if (data === null) {
                continue;
            }
            box.add(data.iv, data.nickname);
            added++;
        }

        if (added === 0) {
            setImportedMessage(t('failed to import'));
        }
        else {
            box.save();
            setImportedMessage(t('imported N pokemon', {n: added}));
            onClose_();
        }
    }, [box, setImportedMessage, t, onClose_, value]);

    const onImportedMessageClose = React.useCallback(() => {
        setImportedMessage("");
    }, [setImportedMessage]);

    const importedMessageVisible = importedMessage !== "";

    return <>
        <Dialog open={open} onClose={onClose_}>
            <DialogTitle>{t('import')}</DialogTitle>
            <DialogContent>
                <p style={{fontSize: '0.9rem', margin: '0 0 1rem 0'}}>{t('import message')}</p>
                <TextField label={t('box data')}
                    multiline fullWidth rows={6} value={value} onChange={onValueChange}/>
            </DialogContent>
            <DialogActions>
                <Button onClick={onImportClick}>{t('import')}</Button>
                <Button onClick={onClose_}>{t('close')}</Button>
            </DialogActions>
        </Dialog>
        <Snackbar open={importedMessageVisible}
            autoHideDuration={2000}
            onClose={onImportedMessageClose}
            message={importedMessage}/>
    </>;
});

export default BoxImportDialog;
