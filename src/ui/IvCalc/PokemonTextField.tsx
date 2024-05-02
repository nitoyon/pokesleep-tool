import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { SleepType } from '../../data/fields';
import pokemons, { PokemonType } from '../../data/pokemons';
import { Autocomplete, autocompleteClasses, AutocompleteRenderGroupParams,
    ButtonBase, ClickAwayListener, Dialog, FilterOptionsState,
    Icon, IconButton, InputAdornment, InputBase, ListItemIcon,
    Menu, MenuItem, MenuList, Popper, Paper } from '@mui/material';
import PokemonIcon from './PokemonIcon';
import TextLikeButton from './TextLikeButton';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import NorthIcon from '@mui/icons-material/North';
import { useTranslation } from 'react-i18next';

/** Autocomplete option list */
interface PokemonOption {
    id: number;
    name: string;
    localName: string;
    sleepType: SleepType;
    type: PokemonType,
    ancestor: number|null,
}

const PokemonTextField = React.memo(({value, onChange}: {
    value: string,
    onChange: (value: string) => void,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const pokemonOptions: PokemonOption[] = React.useMemo(
        () => pokemons
            .map((pokemon) => ({
                id: pokemon.id,
                name: pokemon.name,
                localName: t(`pokemons.${pokemon.name}`),
                sleepType: pokemon.sleepType,
                type: pokemon.type,
                ancestor: pokemon.ancestor,
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
        <TextLikeButton onClick={onInputClick} style={{width: '10rem'}}
            className={open ? 'focused' : ''}>
            {selectedOption.localName}
        </TextLikeButton>
        <EvolveButton selectedOption={selectedOption} onChange={onChange}/>
        <PokemonSelectDialog open={open} onClose={onCloseDialog} onChange={changeHandler}
            pokemonOptions={pokemonOptions} selectedValue={selectedOption}/>
    </div>);
});

const StyledEvolveButton = styled(IconButton)({
    color: '#6c9',
    '&:disabled': {
        color: '#999',
    }
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
        .filter(x => x.ancestor === selectedOption.ancestor)
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
            disabled={!hasEvolutionaryLine}
            style={{
                boxShadow: '0 1px 3px 1px rgba(128, 128, 128, 0.2)',
                marginLeft: '.5rem',
                border: '1px solid #ccc',
            }}>
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

const StyledDialog = styled(Dialog)({
    '& > div.MuiDialog-container > div.MuiPaper-root': {
        // extend dialog width
        width: '100%',
        margin: '20px',
    },
});

function PopperComponent(props: {
    anchorEl?: any;
    disablePortal?: boolean;
    open: boolean;
}) {
    const { disablePortal, anchorEl, open, ...other } = props;
    return <StyledAutocompletePopper {...other} />;
}

const StyledAutocompletePopper = styled('div')({
    [`& .${autocompleteClasses.paper}`]: {
        boxShadow: 'none',
        margin: 0,
        width: '100%',
        color: 'inherit',
        fontSize: 13,
        // pokemon group container
        '& > ul.MuiAutocomplete-listbox': {
            paddingTop: 0,
            maxHeight: '60vh',
            minHeight: '60vh',
            // pokemon item container
            '& > li > ul': {
                userSelect: 'none',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'left',
                margin: '0 0 1rem 0',
                padding: 0,
                // pokemons item
                '& > li': {
                    width: '76px',
                    height: '80px',
                    padding: 0,
                    margin: 0,
                    position: 'relative',
                    display: 'block',
                    // pokemon icon (48px x 48px)
                    '& > div': {
                        margin: '4px auto 0 auto',
                    },
                    // pokemon name
                    '& > footer': {
                        display: 'inline-block',
                        width: '100%',
                        fontSize: '12px',
                        textAlign: 'center',
                        textWrap: 'wrap',
                        lineHeight: 1.1,
                        verticalAlign: 'middle',
                    },
                },
            },
        }
    },
});

const StyledInput = styled(InputBase)(({ theme }) => ({
    width: 'calc(100% - 8px)',
    padding: 4,
    margin: 4,
    borderRadius: 4,
    border: `1px solid #cccccc`,
    '& input': {
        fontSize: 14,
    },
}));

const PokemonSelectDialogFooter = styled('div')({
    backgroundColor: '#f76',
    padding: '.5rem .5rem',
});

const GroupHeader = styled('div')({
    position: 'sticky',
    top: '-1px',
    padding: '4px 10px',
    fontWeight: 'bold',
    zIndex: 9,
    backgroundColor: '#66aaff',
    borderRadius: '5px',
    margin: '0 4px 4px 4px',
    color: '#fff',

    '&.dozing': { backgroundColor: '#fdec6e', color: '#862' },
    '&.snoozing': { backgroundColor: '#85fbff', color: '#226' },
    '&.slumbering': { backgroundColor: '#5592fc' },

    '&.normal': { backgroundColor: '#939393' },
    '&.fire': { backgroundColor: '#e8554d' },
    '&.water': { backgroundColor: '#579bf3' },
    '&.electric': { backgroundColor: '#f1c525' },
    '&.grass': { backgroundColor: '#57a747' },
    '&.ice': { backgroundColor: '#68c5df' },
    '&.fighting': { backgroundColor: '#e8a33b' },
    '&.poison': { backgroundColor: '#ab7aca' },
    '&.flying': { backgroundColor: '#add5ea' },
    '&.psychic': { backgroundColor: '#ed6c94' },
    '&.bug': { backgroundColor: '#a5ab39' },
    '&.rock': { backgroundColor: '#b2b194' },
    '&.ghost': { backgroundColor: '#8d658e' },
    '&.dragon': { backgroundColor: '#7482e9' },
    '&.dark': { backgroundColor: '#706261' },
    '&.steel': { backgroundColor: '#94b1c2' },
    '&.fairy': { backgroundColor: '#e48fe3' },
});

const RoundedButton = styled(ButtonBase)({
    borderRadius: '3rem',
    background: 'white',
    fontSize: '.8rem',
    color: '#000',
    justifyContent: 'left',
    boxShadow: '0 2px 2px 1px #88666666',
    'svg': {
        width: '1.2rem',
        height: '1.2rem',
        color: '#24da6d',
    }
});
const SortOrderButton = styled(RoundedButton)({
    padding: '.2rem',
    translation: '0.2s',

    'svg': {
        width: '1rem', height: '1rem',
        transform: 'translateY(0%)',
        transition: '0.2s',
    },
    '&.desc svg': {
        transform: 'rotate(180deg)',
        transition: '0.2s',
    },
});

/**
 * Pokemon select dialog configuration.
 */
interface PokemonDialogConfig {
    /** Sort type. */
    sort: "sleeptype"|"name"|"pokedexno"|"type";
    /** Descending (true) or ascending (false). */
    descending: boolean;
}

const PokemonSelectDialog = React.memo(({
    open, pokemonOptions, selectedValue, onClose, onChange,
}: {
    open: boolean,
    pokemonOptions: PokemonOption[],
    selectedValue: PokemonOption,
    onClose: () => void,
    onChange: (value: PokemonOption) => void,
}) => {
    const { t } = useTranslation();
    const [sortMenuOpen, setSortMenuOpen] = React.useState(false);
    let [config_, setConfig] = React.useState<PokemonDialogConfig|null>(null);
    const sortMenuAnchorRef = React.useRef<HTMLButtonElement>(null);

    // initialize config
    const config: PokemonDialogConfig = (config_ === null ?
        loadPokemonDialogConfig() : config_);
    const sortType = config.sort;
    const descending = config.descending;

    // Compare inputed text to options
    const filterOptions = useCallback((
        options: PokemonOption[],
        state: FilterOptionsState<PokemonOption>
    ) => {
        const normalize = (val: string) => val.toLowerCase().trim()
            // Hiragana to Katakana (for Japanese)
            .replace(/[ぁ-ん]/g, (c) => {
                return String.fromCharCode(c.charCodeAt(0) + 0x60);
            });
        const input = normalize(state.inputValue);
        const ret = options.filter((option) =>
            normalize(option.localName).includes(input));
        
        if (ret.length === 0) {
            // add empty entry
            ret.push({
                id: -1,
                name: '',
                localName: '',
                sleepType: 'dozing',
                type: 'normal',
                ancestor: null,
            });
        }
        return ret;
    }, []);

    // Selected handler
    const onAutocompleteChange = useCallback((event: any, newValue: PokemonOption|string|null) => {
        if (newValue === null) { return; }
        let selected: PokemonOption|undefined = undefined;
        if (typeof(newValue) === 'string') {
            selected = pokemonOptions.find(x => x.localName === newValue);
            if (selected === undefined) { return; }
        }
        else {
            if (newValue.id < 0) { return; }
            selected = newValue;
        }
        onChange(selected);
        onClose();
    }, [onChange, onClose, pokemonOptions]);

    // close when ESC key is pressed
    const onAutocompleteClose = useCallback((event: any, reason: string) => {
        if (reason === 'escape') {
            onClose();
        }
    }, [onClose]);

    // group by
    const groupByCallback = useCallback((option: PokemonOption) => {
        if (option.id < 0) { return ''; }
        switch (sortType) {
            case 'sleeptype':
                return option.sleepType;
            case 'name':
                return option.localName.charAt(0).normalize('NFD')[0];
            case 'pokedexno':
                return (option.id <= 151 ? 'Kanto' :
                    option.id <= 251 ? "Johto" :
                    option.id <= 386 ? "Hoenn" :
                    option.id <= 487 ? "Sinnoh" :
                    option.id <= 649 ? "Unova" :
                    option.id <= 721 ? "Kalos" :
                    option.id <= 809 ? "Alola" :
                    option.id <= 905 ? "Galar" :
                    "Paldea");
            case 'type':
                return option.type;
            default: return '';
        }
    }, [sortType]);
    const renderGroup = useCallback((params: AutocompleteRenderGroupParams) => {
        let headerLabel = params.group;
        if (headerLabel === '') { return <></>; }
        if (sortType === 'sleeptype') {
            headerLabel = t(params.group);
        } else if (sortType === 'type') {
            headerLabel = t(`types.${params.group}`);
        } else if (sortType === 'pokedexno') {
            headerLabel = t(`generation.${params.group}`);
        }
        return <li key={params.key}>
            <GroupHeader className={params.group}>{headerLabel}</GroupHeader>
            <ul style={{padding: 0}}>{params.children}</ul>
        </li>
    }, [sortType, t]);

    // Sort menu
    const onSortButtonClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        setSortMenuOpen(true);
    }, [setSortMenuOpen]);
    const onSortMenuClose = useCallback(() => {
        setSortMenuOpen(false);
    }, [setSortMenuOpen]);
    const onConfigChange = React.useCallback((value: PokemonDialogConfig) => {
        setConfig(value);
        localStorage.setItem('PstPokemonSelectParam', JSON.stringify(value));
    }, [setConfig]);
    const onToggleSortOrder = useCallback(() => {
        onConfigChange({...config, descending: !config.descending});
    }, [config, onConfigChange]);
    const onSortMenuItemSelected = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        const value = e.currentTarget.getAttribute('data-value');
        if (value !== null && value !== undefined) {
            onConfigChange({...config, sort: value as "sleeptype"|"name"|"pokedexno"|"type"});
            setSortMenuOpen(false);
        }
    }, [config, onConfigChange, setSortMenuOpen]);

    // sort
    let options: PokemonOption[] = [];
    switch (sortType) {
        case 'sleeptype':
            options = pokemonOptions.sort((a, b) => {
                const as = sleepType2num[a.sleepType];
                const bs = sleepType2num[b.sleepType];
                return (as === bs ? a.id - b.id : as - bs);
            });
            break;
        case 'name':
            options = pokemonOptions.sort((a, b) => a.localName > b.localName ? 1 :
                a.localName < b.localName ? -1 : 0);
            break;
        case 'pokedexno':
            options = pokemonOptions.sort((a, b) => a.id - b.id);
            break;
        case 'type':
            options = pokemonOptions.sort((a, b) => {
                const at = type2num[a.type];
                const bt = type2num[b.type];
                return (at === bt ? a.id - b.id : at - bt);
            });
            break;
        default:
            throw new Error('invalid sort type');
    }
    if (descending) {
        options = options.reverse();
    }

    return <StyledDialog open={open} onClose={onClose}>
        <Autocomplete options={options}
            fullWidth
            open
            freeSolo            
            PopperComponent={PopperComponent}
            filterOptions={filterOptions}
            getOptionLabel={(option: string|PokemonOption) => {
                if (typeof option === "string") {
                    return option;
                }
                return option.localName;
            }}
            groupBy={groupByCallback}
            renderGroup={renderGroup}
            renderOption={(props, option) => (
                <MenuItem key={option.id} {...props}>
                    <PokemonIcon id={option.id} size={48}/>
                    <footer>{option.localName}</footer>
                </MenuItem>
            )}
            renderInput={(params) => (
                <StyledInput
                    ref={params.InputProps.ref}
                    inputProps={{
                        autoComplete: "false",
                        ...params.inputProps
                    }}
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    }
                />
                )}
            onClose={onAutocompleteClose}
            onChange={onAutocompleteChange}/>
        <PokemonSelectDialogFooter>
            <RoundedButton style={{padding: '.2rem .8rem', marginRight: '.5rem', width: "8rem", textAlign: 'left'}}
                onClick={onSortButtonClick} ref={sortMenuAnchorRef}>
                <SortIcon style={{paddingRight: '.4rem'}}/>{t(sortType)}
            </RoundedButton>
            <Popper open={sortMenuOpen} anchorEl={sortMenuAnchorRef.current} style={{zIndex: 1500}}>
                <Paper elevation={10}>
                    <ClickAwayListener onClickAway={onSortMenuClose}>
                        <MenuList>
                            <MenuItem onClick={onSortMenuItemSelected} data-value="pokedexno"
                                selected={sortType === 'pokedexno'}>{t('pokedexno')}</MenuItem>
                            <MenuItem onClick={onSortMenuItemSelected} data-value="name"
                                selected={sortType === 'name'}>{t('name')}</MenuItem>
                            <MenuItem onClick={onSortMenuItemSelected} data-value="sleeptype"
                                selected={sortType === 'sleeptype'}>{t('sleeptype')}</MenuItem>
                            <MenuItem onClick={onSortMenuItemSelected} data-value="type"
                                selected={sortType === 'type'}>{t('type')}</MenuItem>
                        </MenuList>
                    </ClickAwayListener>
                </Paper>
            </Popper>
            <SortOrderButton className={descending ? 'desc' : 'asc'} onClick={onToggleSortOrder}>
                <NorthIcon style={{width: '1rem', height: '1rem'}}/>
            </SortOrderButton>
        </PokemonSelectDialogFooter>
    </StyledDialog>;
});

const sleepType2num = {
    'dozing': 0,
    'snoozing': 1,
    'slumbering': 2,
};

const type2num = {
    "normal": 0,
    "fire": 1,
    "water": 2,
    "electric": 3,
    "grass": 4,
    "ice": 5,
    "fighting": 6,
    "poison": 7,
    "ground": 8,
    "flying": 9,
    "psychic": 10,
    "bug": 11,
    "rock": 12,
    "ghost": 13,
    "dragon": 14,
    "dark": 15,
    "steel": 16,
    "fairy": 17,
};

/**
 * Load dialog config from localStorage.
 * @returns config.
 */
function loadPokemonDialogConfig(): PokemonDialogConfig {
    const ret: PokemonDialogConfig = {
        sort: "pokedexno",
        descending: false,
    };

    const settings = localStorage.getItem('PstPokemonSelectParam');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.sort) === "string" &&
        ["sleeptype", "name", "pokedexno", "type"].includes(json.sort)) {
        ret.sort = json.sort;
    }
    if (typeof(json.descending) === "boolean") {
        ret.descending = json.descending;
    }
    return ret;
}


export default PokemonTextField;
