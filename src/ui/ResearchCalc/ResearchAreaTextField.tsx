import React from 'react';
import fields from '../../data/fields';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ResearchAreaTextField = React.memo(({value, showEmpty, onChange}:{
    value: number;
    showEmpty?: boolean;
    onChange: (value: number) => void;
}) => {
    const { t } = useTranslation();
    const onChangeHandler = React.useCallback((e: any) => {
        onChange(e.target.value as number);
    }, [onChange]);

    // prepare field menus
    const fieldMenuItems = [];
    const showFields = [...fields];
    if (showEmpty) {
        fieldMenuItems.push(
            <MenuItem key={-1} value={-1}>
                {t('no favorite berries')}
            </MenuItem>
        );
    }
    for (const field of showFields) {
        fieldMenuItems.push(
            <MenuItem key={field.index} value={field.index}>
                <span className="field_icon">{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
    }

    return (
        <TextField variant="standard" size="small" select value={value}
            SelectProps={{ MenuProps: {
                anchorOrigin: { vertical: "bottom", horizontal: "left" },
                transformOrigin: { vertical: "top", horizontal: "left" },
            }}}
            onChange={onChangeHandler}>
            {fieldMenuItems}
        </TextField>
    );
});

export default ResearchAreaTextField;
