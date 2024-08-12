import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import TypeButton from './TypeButton';
import { BoxFilterConfig } from './BoxView';
import { PokemonType, PokemonTypes } from '../../data/pokemons';
import { Button, Dialog, DialogActions, InputAdornment, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const BoxFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();
    const onClearClick = useCallback(() => {
        onChange({name: "", filterTypes: []});
    }, [onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);
    const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({...value, name: e.target.value});
    }, [value, onChange]);
    const onTypeClick = useCallback((selected: PokemonType) => {
        const filterTypes: PokemonType[] = value.filterTypes.includes(selected) ?
            value.filterTypes.filter(x => x !== selected) :
            [...value.filterTypes, selected];
        onChange({...value, filterTypes});
    }, [value, onChange]);

    const buttons: React.ReactElement[] = PokemonTypes.map(type =>
        <TypeButton key={type} type={type} onClick={onTypeClick}
            checked={value.filterTypes.includes(type)}/>);

    return <StyledPokemonFilterDialog open={open} onClose={onClose}>
        <div>
            <TextField size="small" fullWidth value={value.name}
                onChange={onNameChange}
                InputProps={{
                    endAdornment: <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                }}/>
        </div>
        <div>
            <h3>{t('type')}</h3>
            {buttons}
        </div>
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root > div': {
        margin: '.5rem .5rem 0 .5rem',
        '& > h3': {
            margin: '0.5rem 0',
            fontSize: '1rem',
        },
    },
});

export default BoxFilterDialog;
