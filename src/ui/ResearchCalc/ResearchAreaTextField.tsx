import React from 'react';
import fields from '../../data/fields';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ResearchAreaTextField = React.memo(({value, onChange}:{
    value: number;
    onChange: (value: number) => void;
}) => {
    const { t } = useTranslation();
    const onChangeHandler = React.useCallback((e: any) => {
        onChange(e.target.value as number);
    }, [onChange]);

    // prepare field menus
    const fieldMenuItems = [];
    const showFields = [...fields];
    for (const field of showFields) {
        if (field.powers.length === 0) {
            continue;
        }
        fieldMenuItems.push(
            <MenuItem key={field.index} value={field.index}>
                <span className="field_icon">{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
    }

    return (
        <TextField variant="standard" size="small" select value={value}
            onChange={onChangeHandler}
            slotProps={{
                select: { MenuProps: {
                    anchorOrigin: { vertical: "bottom", horizontal: "left" },
                    transformOrigin: { vertical: "top", horizontal: "left" },
                }}
            }}>
            {fieldMenuItems}
        </TextField>
    );
});

export default ResearchAreaTextField;
