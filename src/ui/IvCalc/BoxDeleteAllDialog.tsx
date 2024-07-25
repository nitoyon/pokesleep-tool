import React from 'react';
import PokemonBox from '../../util/PokemonBox';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';

const BoxDeleteAllDialog = React.memo(({ box, open, onClose }: {
    box: PokemonBox,
    open: boolean,
    onClose: () => void }
) => {
    const [deletedMessageVisible, setDeletedMessageVisible] = React.useState(false);
    const { t } = useTranslation();

    const onDelete = React.useCallback(() => {
        box.removeAll();
        setDeletedMessageVisible(true);
    }, [setDeletedMessageVisible, box]);
    const onDeletedMessageClose = React.useCallback(() => {
        setDeletedMessageVisible(false);
    }, [setDeletedMessageVisible]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{t("delete all")}</DialogTitle>
            <DialogContent>
                <p style={{ fontSize: "0.9rem", margin: 0 }}>{t("delete all message")}</p>
            </DialogContent>
            <DialogActions>
                <Button onClick={onDelete}>{t("delete all pokemon")}</Button>
                <Button onClick={onClose}>{t("close")}</Button>
            </DialogActions>
            <Snackbar open={deletedMessageVisible}
                autoHideDuration={2000} onClose={onDeletedMessageClose}
                message={t("deleted all pokemon")}/>
        </Dialog>
    );
});
export default BoxDeleteAllDialog;
