import React from 'react';
import { styled } from '@mui/system';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
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
        <StyledDialogContent>
            <AreaControlGroup value={value} onChange={onChange}/>
        </StyledDialogContent>
        <DialogActions>
            <Button onClick={onClose}>{t('close')}</Button>
        </DialogActions>
    </Dialog>;
});

const StyledDialogContent = styled(DialogContent)({
    minWidth: '16rem',
    paddingBottom: 0,
    fontSize: '0.9rem',
    '& section': {
        '& > label': {
            paddingTop: '1rem',
            display: 'block',
        },
        '& > span, & > div, & > button:first-of-type': {
            marginLeft: '1rem',
            fontSize: '0.9rem',
        },
    },
});


export default AreaControlDialog;
