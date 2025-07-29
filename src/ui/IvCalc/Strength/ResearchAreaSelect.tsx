import React from 'react';
import fields from '../../../data/fields';
import MessageDialog from '../../Dialog/MessageDialog';
import SelectEx from '../../common/SelectEx';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { IconButton, MenuItem } from '@mui/material';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { useTranslation } from 'react-i18next';

const ResearchAreaSelect = React.memo(({showConfigButton, value, fontSize, onChange}:{
    showConfigButton?: boolean,
    value: StrengthParameter,
    fontSize?: string;
    onChange: (value: StrengthParameter) => void;
}) => {
    const { t } = useTranslation();
    const [warningOpen, setWarningOpen] = React.useState(false);
    const onChangeHandler = React.useCallback((val: string) => {
        const fieldIndex = parseInt(val, 10);
        onChange({...value, fieldIndex});
    }, [onChange, value]);
    const onWarningClick = React.useCallback(() => {
        setWarningOpen(true);
    }, []);
    const onWarningClose = React.useCallback(() => {
        setWarningOpen(false);
    }, []);

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

    const showAlert = value.fieldIndex === 6;

    return (<>
        <SelectEx value={value.fieldIndex} onChange={onChangeHandler}
            sx={{padding: '0 .2rem', fontSize: fontSize ?? '1rem'}}>
            {fieldMenuItems}
        </SelectEx>
        {showAlert && <IconButton size="small" color="warning" style={{padding: '2px'}}
            onClick={onWarningClick}>
            <WarningRoundedIcon fontSize={fontSize ? "inherit" : "small"}/>
        </IconButton>}
        <MessageDialog open={warningOpen} onClose={onWarningClose}
            message={t('amber assumption')}/>
    </>);
});

export default ResearchAreaSelect;
