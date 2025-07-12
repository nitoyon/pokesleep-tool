import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { SleepType } from '../../data/fields';
import pokemons, { PokemonSpecialty, IngredientName, PokemonType } from '../../data/pokemons';
import { Icon, IconButton, ListItemIcon,
    Menu, MenuItem } from '@mui/material';
import TextLikeButton from '../common/TextLikeButton';
import PokemonSelectDialog from './PokemonSelectDialog';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckIcon from '@mui/icons-material/Check';
import CandyIcon from '../Resources/CandyIcon';
import { useTranslation } from 'react-i18next';
import PokemonIv from '../../util/PokemonIv';
import { MainSkillName } from '../../util/MainSkill';

/** Autocomplete option list */
export interface PokemonOption {
    id: number;
    idForm: number;
    form?: string;
    name: string;
    localName: string;
    arrival: string;
    specialty: PokemonSpecialty;
    sleepType: SleepType;
    type: PokemonType;
    skill: MainSkillName,
    ancestor: number|null;
    isNonEvolving: boolean;
    isFullyEvolved: boolean;
    ing1Name: IngredientName;
    ing2Name: IngredientName;
    ing3Name?: IngredientName;
}

const PokemonTextField = React.memo(({value, fixMode, onChange, onCandyClick}: {
    value: string,
    /** Fix evolutionary line or not */
    fixMode?: boolean,
    onChange: (value: string) => void,
    onCandyClick: () => void,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const pokemonOptions: PokemonOption[] = React.useMemo(
        () => pokemons
            .map((pokemon) => ({
                id: pokemon.id,
                idForm: new PokemonIv(pokemon.name).idForm,
                form: pokemon.form,
                name: pokemon.name,
                localName: t(`pokemons.${pokemon.name}`),
                arrival: pokemon.arrival,
                specialty: pokemon.specialty,
                sleepType: pokemon.sleepType,
                type: pokemon.type,
                skill: pokemon.skill,
                ancestor: pokemon.ancestor,
                isNonEvolving: pokemon.evolutionCount === -1,
                isFullyEvolved: pokemon.isFullyEvolved,
                ing1Name: pokemon.ing1.name,
                ing2Name: pokemon.ing2.name,
                ing3Name: pokemon.ing3?.name,
            })),
        [t]);
    let _selectedOption = pokemonOptions.find(x => x.name === value);
    if (_selectedOption === undefined) {
        throw new Error(`value ${value} is invalid`);
    }
    const selectedOption = _selectedOption;

    // Open popup when input area is clicked
    const onInputClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setOpen(true);
    }, [setOpen]);

    const changeHandler = useCallback((value: PokemonOption) => {
        onChange(value.name);
    }, [onChange]);

    const onCloseDialog = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    return (<div>
        {fixMode ? <>{selectedOption.localName}</> :
        <TextLikeButton onClick={onInputClick} style={{width: '10.2rem', fontSize: '0.9rem'}}
            className={open ? 'focused' : ''}>
            {selectedOption.localName}
        </TextLikeButton>}
        <EvolveButton selectedOption={selectedOption} onChange={onChange}/>
        <CandyButton onClick={onCandyClick}/>
        <PokemonSelectDialog open={open} onClose={onCloseDialog} onChange={changeHandler}
            pokemonOptions={pokemonOptions} selectedValue={selectedOption}/>
    </div>);
});

/**
 * Click this button to switch to other pokemon in same evolutionary line
 */
const EvolveButton = React.memo(({selectedOption, onChange}: {
    selectedOption: PokemonOption,
    onChange: (name: string) => void,
}) => {
    const { t } = useTranslation();
    const [evolveButtonEl, setEvolveButtonEl] = React.useState<null|HTMLElement>(null);
    const hasEvolutionaryLine = Boolean(selectedOption.ancestor !== null);

    // menu item click handler
    const onEvolveMenuItemClick = React.useCallback((e: React.MouseEvent) => {
        const name = e.currentTarget.getAttribute("value");
        if (name === null) { return; }
        onChange(name);
        setEvolveButtonEl(null);
    }, [onChange, setEvolveButtonEl]);

    // setup menu item
    const evolveMenuItems = [];
    const pokemonsInEvoLine = pokemons
        .filter(x => x.ancestor === selectedOption.ancestor &&
            x.form === selectedOption.form
        )
        .sort((a, b) => a.id === selectedOption.ancestor ? -1 : a.id - b.id);
    for (const p of pokemonsInEvoLine) {
        evolveMenuItems.push(<MenuItem key={p.id} value={p.name}
            onClick={onEvolveMenuItemClick}>
            <ListItemIcon>{p.id === selectedOption.id ? <CheckIcon/> : <Icon/>}</ListItemIcon>
            {t(`pokemons.${p.name}`)}
        </MenuItem>);
    }

    // button click handler
    const onEvolveClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setEvolveButtonEl(event.currentTarget);        
    }, [setEvolveButtonEl]);

    // menu close handler
    const onEvolveMenuClose = useCallback(() => {
        setEvolveButtonEl(null);
    }, [setEvolveButtonEl]);

    const open = Boolean(evolveButtonEl);
    return <>
        <StyledEvolveButton size="small" onClick={onEvolveClick}
            disabled={!hasEvolutionaryLine}>
            <AccountTreeIcon fontSize="inherit"/>
        </StyledEvolveButton>
        <Menu open={open} anchorEl={evolveButtonEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            onClose={onEvolveMenuClose}>
            {evolveMenuItems}
        </Menu>
    </>;
});

const StyledEvolveButton = styled(IconButton)({
    color: '#6c9',
    fontSize: '0.9rem',
    boxShadow: '0 1px 3px 1px rgba(128, 128, 128, 0.2)',
    marginLeft: '.4rem',
    border: '1px solid #ccc',
    '&:disabled': {
        color: '#999',
    }
});

/**
 * Click this button to show candy dialog
 */
const CandyButton = React.memo(({onClick}: {onClick: () => void}) => {
    return <StyledCandyButton size="small" onClick={onClick}>
        <CandyIcon/>
    </StyledCandyButton>;
});

const StyledCandyButton = styled(IconButton)({
    fontSize: '0.9rem',
    boxShadow: '0 1px 3px 1px rgba(128, 128, 128, 0.2)',
    marginLeft: '.2rem',
    '@media (min-width: 390px)': {
        marginLeft: '.5rem',
    },
    border: '1px solid #ccc',
    '& > svg': {
        width: '14px',
        height: '14px',
    }
});

export default PokemonTextField;
