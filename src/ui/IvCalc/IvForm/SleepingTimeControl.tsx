import React from 'react';
import SelectEx from '../../common/SelectEx';
import { MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SleepingTimeControl = React.memo(({value, onChange}: {
    value: 0|1|2|3|4,
    onChange: (value: 0|1|2|3|4) => void,
}) => {
    const { t } = useTranslation();

    const _onChange = React.useCallback((value: string) => {
        onChange(parseInt(value, 10) as 0|1|2|3|4);
    }, [onChange]);

    return <SelectEx value={value} onChange={_onChange}>
            <MenuItem value={0}>{t('200 hours-')}</MenuItem>
            <MenuItem value={1}>{t('200 hours+')}</MenuItem>
            <MenuItem value={2}>{t('500 hours+')}</MenuItem>
            <MenuItem value={3}>{t('1000 hours+')}</MenuItem>
            <MenuItem value={4}>{t('2000 hours+')}</MenuItem>
        </SelectEx>;
});

export default SleepingTimeControl;
