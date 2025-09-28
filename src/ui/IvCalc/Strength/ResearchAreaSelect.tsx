import React from 'react';
import fields from '../../../data/fields';
import SelectEx from '../../common/SelectEx';
import AreaControlDialog from './AreaControlDialog';
import {
    allFavoriteFieldIndex, noFavoriteFieldIndex, StrengthParameter
} from '../../../util/PokemonStrength';
import { Divider, IconButton, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const ResearchAreaSelect = React.memo(({showConfigButton, value, fontSize, onChange}:{
    showConfigButton?: boolean,
    value: StrengthParameter,
    fontSize?: string;
    onChange: (value: StrengthParameter) => void;
}) => {
    const { t } = useTranslation();
    const [configOpen, setConfigOpen] = React.useState(false);
    const onChangeHandler = React.useCallback((val: string) => {
        const fieldIndex = parseInt(val, 10);
        onChange({...value, fieldIndex});
    }, [onChange, value]);
    const onConfigClick = React.useCallback(() => {
        setConfigOpen(true);
    }, []);
    const onConfigClose = React.useCallback(() => {
        setConfigOpen(false);
    }, []);

    // prepare field menus
    const fieldMenuItems = [];
    const showFields = [...fields];
    fieldMenuItems.push(
        <MenuItem key={noFavoriteFieldIndex} value={noFavoriteFieldIndex} dense>
            {t('no favorite berries')}
        </MenuItem>
    );
    fieldMenuItems.push(
        <MenuItem key={allFavoriteFieldIndex} value={allFavoriteFieldIndex} dense>
            {t('all favorite berries')}
        </MenuItem>
    );
    fieldMenuItems.push(<Divider key="divider"/>);

    for (const field of showFields) {
        fieldMenuItems.push(
            <MenuItem key={field.index} value={field.index} dense>
                <span className="field_icon">{field.emoji}</span>
                {t(`area.${field.index}`)}
            </MenuItem>
        );
    }

    return (<>
        <SelectEx value={value.fieldIndex} onChange={onChangeHandler}
            sx={{padding: '0 .2rem', fontSize: fontSize ?? '1rem'}}>
            {fieldMenuItems}
        </SelectEx>
        {showConfigButton && <IconButton size="small" style={{padding: '2px'}}
            onClick={onConfigClick}>
            <SettingsIcon fontSize={fontSize ? "inherit" : "small"}/>
        </IconButton>}
        <AreaControlDialog open={configOpen} onClose={onConfigClose}
            value={value} onChange={onChange}/>
    </>);
});

export default ResearchAreaSelect;
