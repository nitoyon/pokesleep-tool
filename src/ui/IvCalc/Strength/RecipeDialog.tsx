import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';

const RecipeDialog = React.memo(({open, onClose}: {
    open: boolean,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    return <Dialog open={open} onClose={onClose}>
        <DialogContent>
            <Typography sx={{
                marginBottom: "16px"
            }}>
                <Trans i18nKey="recipe bonus help"
                    components={{
                        raenonx: <a href={t('recipe bonus list')}>raenonx</a>,
                    }}/>
            </Typography>
            <Typography variant="body2">{t('recipe strength help')}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default RecipeDialog;
