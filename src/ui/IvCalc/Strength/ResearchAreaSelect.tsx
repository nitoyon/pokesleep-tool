import React from 'react';
import fields from '../../../data/fields';
import SelectEx from '../../common/SelectEx';
import { MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ResearchAreaSelect = React.memo(({value, fontSize, onChange}:{
    value: number;
    fontSize?: string;
    onChange: (value: number) => void;
}) => {
    const { t } = useTranslation();
    const onChangeHandler = React.useCallback((fieldIndex: string) => {
        onChange(parseInt(fieldIndex, 10));
    }, [onChange]);

    // prepare field menus
    const fieldMenuItems = [];
    const showFields = [...fields];
    fieldMenuItems.push(
        <MenuItem key={-1} value={-1} dense>
            {t('no favorite berries')}
        </MenuItem>
    );

    for (const field of showFields) {
        fieldMenuItems.push(
            <MenuItem key={field.index} value={field.index} dense>
                <span className="field_icon">{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
    }

    return (
        <SelectEx value={value} onChange={onChangeHandler}
            sx={{padding: '0 .2rem', fontSize: fontSize ?? '1rem'}}>
            {fieldMenuItems}
        </SelectEx>
    );
});

export default ResearchAreaSelect;
