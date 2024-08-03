import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SleepingTimeControl = React.memo(({value, onChange}: {
    value: 0|1|2|3|4,
    onChange: (value: 0|1|2|3|4) => void,
}) => {
    const { t } = useTranslation();

    const _onChange = React.useCallback((e: any) => {
        onChange(e.target.value as 0|1|2|3|4);
    }, [onChange]);

    return <TextField variant="standard" size="small" select
            value={value}
            SelectProps={{ MenuProps: {
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={_onChange}>
            <MenuItem value={0}>{t('200 hours-')}</MenuItem>
            <MenuItem value={1}>{t('200 hours+')}</MenuItem>
            <MenuItem value={2}>{t('500 hours+')}</MenuItem>
            <MenuItem value={3}>{t('1000 hours+')}</MenuItem>
            <MenuItem value={4}>{t('2000 hours+')}</MenuItem>
        </TextField>;
});

export default SleepingTimeControl;
