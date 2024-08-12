import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import TypeButton from './TypeButton';
import { BoxFilterConfig } from './BoxView';
import IngredientIcon from './IngredientIcon';
import { IngredientName, IngredientNames, PokemonType, PokemonTypes
} from '../../data/pokemons';
import { Button, Dialog, DialogActions, InputAdornment, Switch,
    Tab, Tabs, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const BoxFilterDialog = React.memo(({open, value, onChange, onClose}: {
    open: boolean,
    value: BoxFilterConfig,
    onChange: (value: BoxFilterConfig) => void,
    onClose: () => void,
}) => {
    const { t } = useTranslation();

    let defaultTabIndex = value.filterTypes.length !== 0 ? 0 :
        value.ingredientName !== undefined ? 1 : 0;
    const [tabIndex, setTabIndex] = React.useState(defaultTabIndex);
    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    }, []);
    const onClearClick = useCallback(() => {
        onChange(new BoxFilterConfig({}));
    }, [onChange]);
    const onCloseClick = useCallback(() => {
        onClose();
    }, [onClose]);
    const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, name: e.target.value}));
    }, [value, onChange]);
    const onTypeClick = useCallback((selected: PokemonType) => {
        const filterTypes: PokemonType[] = value.filterTypes.includes(selected) ?
            value.filterTypes.filter(x => x !== selected) :
            [...value.filterTypes, selected];
        onChange(new BoxFilterConfig({...value, filterTypes}));
    }, [value, onChange]);
    const onIngClick = useCallback((selected: IngredientName) => {
        const ingredientName = value.ingredientName === selected ?
            undefined : selected;
        onChange(new BoxFilterConfig({...value, ingredientName}));
    }, [value, onChange]);
    const onIngredientUnlockedOnlyChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(new BoxFilterConfig({...value, ingredientUnlockedOnly: e.target.checked}));
    }, [onChange, value]);

    const typeButtons: React.ReactElement[] = PokemonTypes.map(type =>
        <TypeButton key={type} type={type} onClick={onTypeClick}
            checked={value.filterTypes.includes(type)}/>);
    const ingButtons: React.ReactElement[] = IngredientNames.map(ing =>
        <IngredientButton key={ing} ingredient={ing} onClick={onIngClick}
            checked={value.ingredientName === ing}/>);

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
        <Tabs variant="scrollable" scrollButtons="auto"
            value={tabIndex} onChange={onTabChange}>
            <Tab label={t('type')} value={0}/>
            <Tab label={t('ingredient')} value={1}/>
        </Tabs>
        {tabIndex === 0 && <div>{typeButtons}</div>}
        {tabIndex === 1 && <div>
            {ingButtons}
            <section>
                <label>{t('unlocked only')}:</label>
                <Switch checked={value.ingredientUnlockedOnly}
                    onChange={onIngredientUnlockedOnlyChange}/>
            </section>
        </div>}
        <DialogActions>
            <Button onClick={onClearClick}>{t('clear')}</Button>
            <Button onClick={onCloseClick}>{t('close')}</Button>
        </DialogActions>
    </StyledPokemonFilterDialog>;
});

const StyledPokemonFilterDialog = styled(Dialog)({
    'div.MuiPaper-root > div': {
        margin: '.5rem .5rem 0 .5rem',
        '& > section': {
            margin: '0.3rem 0.8rem 0 0.8rem',
            fontSize: '.9rem',
            display: 'flex',
            flex: '0 auto',
            alignItems: 'center',
            '& > label': {
                marginRight: 'auto',
            },
        },
    },
});

const IngredientButton = React.memo(({ingredient, checked, onClick}: {
    ingredient: IngredientName,
    checked: boolean,
    onClick: (value: IngredientName) => void,
}) => {
    const onIngredientClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value as IngredientName;
        onClick(value);
    }, [onClick]);
    return <StyledIngredientButton
        key={ingredient} value={ingredient} onClick={onIngredientClick}>
        <IngredientIcon name={ingredient}/>
        {checked && <CheckIcon/>}
    </StyledIngredientButton>;
});

const StyledIngredientButton = styled(Button)({
    width: '20%',
    height: '40px',
    color: 'white',
    fontSize: '0.9rem',
    padding: 0,
    margin: '0.2rem',
    borderRadius: '0.5rem',
    '& > svg.MuiSvgIcon-root': {
        position: 'absolute',
        background: '#24d76a',
        borderRadius: '15px',
        fontSize: '15px',
        border: '2px solid white',
        bottom: '0px',
        right: '10px',
    },
});

export default BoxFilterDialog;
