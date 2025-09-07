import React from 'react';
import { Button, Dialog, DialogActions } from '@mui/material';
import AreaControlGroup from './AreaControlGroup';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { useTranslation } from 'react-i18next';

const AreaControlDialog = React.memo(({open, value, onChange, onClose}:{
    open: boolean,
    value: StrengthParameter,
    onChange: (value: StrengthParameter) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    if (!open) {
        return <></>;
    }

    return <Dialog open={open} onClose={onClose}>
        <AreaControlGroup value={value} onChange={onChange}/>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

export default AreaControlDialog;
