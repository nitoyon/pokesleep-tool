import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { PokemonSpecialty, SpecialtyNames, IngredientName, IngredientNames,
    PokemonType, PokemonTypes } from '../../data/pokemons';
import { MainSkillName, MainSkillNames } from '../../util/MainSkill';
import { Autocomplete, autocompleteClasses, AutocompleteRenderGroupParams, Dialog, 
    FilterOptionsState, InputAdornment, InputBase, MenuItem } from '@mui/material';
import PokemonIcon from './PokemonIcon';
import PokemonFilterDialog from './PokemonFilterDialog';
import PokemonFilterFooter, { PokemonFilterFooterConfig } from './PokemonFilterFooter';
import { PokemonOption } from './PokemonTextField';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

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
                margin: '0 0 .5rem 0',
                padding: 0,
                // pokemons item
                '& > li': {
                    width: '76px',
                    height: '80px',
                    padding: 0,
                    margin: '0 0 6px 0',
                    position: 'relative',
                    display: 'block',
                    // pokemon icon (48px x 48px)
                    '& > div': {
                        margin: '4px auto 0 auto',
                    },
                    '& > img': {
                        margin: '4px auto 0 auto',
                        display: 'block',
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
    '&.ground': { backgroundColor: '#c8a841' },
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

/**
 * Pokemon select dialog configuration.
 */
export class PokemonFilterConfig {
    /** Filter type */
    filterType: PokemonType|null;
    /** Specialty */
    filterSpecialty: PokemonSpecialty[];
    /** Filter by evolve */
    filterEvolve: "all"|"non"|"final";
    /** Fileter by ingredient name. */
    ingredientName: IngredientName;
    /** Specify if specified ingredient is A */
    ingredientA: boolean;
    /** Specify if specified ingredient is B */
    ingredientB: boolean;
    /** Specify if specified ingredient is C */
    ingredientC: boolean;
    /** Filter by main skill name. */
    mainSkillNames: MainSkillName[];

    /** Initialize the instance */
    constructor(values: Partial<PokemonFilterConfig>) {
        this.filterType = values.filterType ?? null;
        this.filterSpecialty = values.filterSpecialty ?? [];
        this.filterEvolve = values.filterEvolve ?? "all";
        this.ingredientName = values.ingredientName ?? "unknown";
        this.ingredientA = values.ingredientA ?? true;
        this.ingredientB = values.ingredientB ?? true;
        this.ingredientC = values.ingredientC ?? true;
        this.mainSkillNames = values.mainSkillNames ?? [];
    }

    load(json: any) {
        if (typeof(json) !== "object") {
            return;
        }
        if (typeof(json.filterType) === "string" &&
            PokemonTypes.includes(json.filterType)) {
            this.filterType = json.filterType;
        }
        if (Array.isArray(json.filterSpecialty) &&
            json.filterSpecialty.every((x: any) => SpecialtyNames.includes(x))) {
            this.filterSpecialty = json.filterSpecialty;
        }
        if (typeof(json.filterEvolve) === "string" &&
            ["all", "non", "final"].includes(json.filterEvolve)) {
            this.filterEvolve = json.filterEvolve;
        }
        if (typeof(json.ingredientName) === "string" &&
            IngredientNames.includes(json.ingredientName)) {
            this.ingredientName = json.ingredientName;
        }
        if (typeof(json.ingredientA) === "boolean") {
            this.ingredientA = json.ingredientA;
        }
        if (typeof(json.ingredientB) === "boolean") {
            this.ingredientB = json.ingredientB;
        }
        if (typeof(json.ingredientC) === "boolean") {
            this.ingredientC = json.ingredientC;
        }
        if (Array.isArray(json.mainSkillNames) &&
            json.mainSkillNames.every((x: any) => MainSkillNames.includes(x))) {
            this.mainSkillNames = json.mainSkillNames;
        }
    }

    /** Check ON or OFF. */
    get isFiltered(): boolean {
        return this.filterEvolve !== "all" ||
            this.filterSpecialty.length > 0 ||
            this.filterType !== null ||
            this.ingredientName !== 'unknown' ||
            this.mainSkillNames.length > 0;
    }

    /** Get initial tab index of filter dialog */
    get tabIndex(): number {
        if (this.filterEvolve !== 'all') { return 0; }
        if (this.filterSpecialty.length > 0) { return 0; }
        if (this.ingredientName !== 'unknown') { return 1; }
        if (this.mainSkillNames.length > 0) { return 2; }
        return 0;
    }

    /**
     * Filters Pokémons based on the provided text and this filter config.
     * @param options The list of Pokémon to be filtered.
     * @param text The text used for filtering the Pokémon.
     * @returns The list of Pokémon that match the filter criteria.
     */
    filter(options: PokemonOption[], text: string): PokemonOption[] {
        // filter by text
        const normalize = (val: string) => val.toLowerCase().trim()
            // Hiragana to Katakana (for Japanese)
            .replace(/[ぁ-ん]/g, (c) => {
                return String.fromCharCode(c.charCodeAt(0) + 0x60);
            });
        const input = normalize(text);
        let ret = options.filter((option) =>
            normalize(option.localName).includes(input));

        // filter by type
        if (this.filterType !== null) {
            ret = ret.filter((option) => this.filterType === option.type);
        }

        if (this.filterSpecialty.length > 0) {
            ret = ret.filter((option) =>
                this.filterSpecialty.includes(option.specialty));
        }

        // filter by evolve
        if (this.filterEvolve === "final") {
            ret = ret.filter((option) => option.isFullyEvolved)
        } else if (this.filterEvolve === "non") {
            ret = ret.filter((option) => option.isNonEvolving)
        }

        // filter by ingredient
        if (this.ingredientName !== 'unknown') {
            ret = ret.filter((option) =>
                (this.ingredientA && this.ingredientName === option.ing1Name) ||
                (this.ingredientB && this.ingredientName === option.ing2Name) ||
                (this.ingredientC && this.ingredientName === option.ing3Name));
        }

        // filter by main skill
        if (this.mainSkillNames.length > 0) {
            ret = ret.filter((option) => this.mainSkillNames
                .some(x => option.skill.startsWith(x)));
        }

        if (ret.length === 0) {
            // add empty entry
            ret.push({
                id: -1,
                idForm: -1,
                name: '',
                localName: '',
                specialty: 'Berries',
                sleepType: 'dozing',
                type: 'normal',
                skill: 'Charge Energy S',
                ancestor: null,
                isFullyEvolved: false,
                isNonEvolving: false,
                ing1Name: 'unknown',
                ing2Name: 'unknown',
                ing3Name: undefined,
            });
        }
        return ret;
    }
}

/**
 * Pokemon select dialog configuration.
 */
interface PokemonDialogConfig {
    /** Filter config. */
    filter: PokemonFilterConfig,
    /** Sort type. */
    sort: "sleeptype"|"name"|"pokedexno"|"type";
    /** Descending (true) or ascending (false). */
    descending: boolean;
}

const PokemonSelectDialog = React.memo(({
    open, pokemonOptions, onClose, onChange,
}: {
    open: boolean,
    pokemonOptions: PokemonOption[],
    selectedValue: PokemonOption,
    onClose: () => void,
    onChange: (value: PokemonOption) => void,
}) => {
    const { t } = useTranslation();
    const [filterOpen, setFilterOpen] = React.useState(false);
    let [config_, setConfig] = React.useState<PokemonDialogConfig|null>(null);

    // initialize config
    const config: PokemonDialogConfig = (config_ === null ?
        loadPokemonDialogConfig() : config_);
    const sortType = config.sort;
    const descending = config.descending;

    // close handler
    const closeHandler = useCallback(() => {
        onClose();
    }, [onClose]);

    // Compare inputed text to options
    const filterOptions = useCallback((
        options: PokemonOption[],
        state: FilterOptionsState<PokemonOption>
    ) => {
        return config.filter.filter(options, state.inputValue);
    }, [config.filter]);

    // Selected handler
    const onAutocompleteChange = useCallback((event: any, newValue: PokemonOption|string|null) => {
        if (newValue === null) { return; }
        let selected: PokemonOption|undefined = undefined;
        if (typeof(newValue) === 'string') {
            selected = pokemonOptions.find(x => x.localName === newValue);
            if (selected === undefined) { return; }
        }
        else {
            // skip empty entry
            if (newValue.id < 0) { return; }
            selected = newValue;
        }
        onChange(selected);
        closeHandler();
    }, [onChange, closeHandler, pokemonOptions]);

    // close when ESC key is pressed
    const onAutocompleteClose = useCallback((event: any, reason: string) => {
        if (reason === 'escape') {
            closeHandler();
        }
    }, [closeHandler]);

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
        return <li key={params.group}>
            <GroupHeader className={params.group}>{headerLabel}</GroupHeader>
            <ul style={{padding: 0}}>{params.children}</ul>
        </li>
    }, [sortType, t]);

    // Filter button
    const onFilterButtonClick = useCallback(() => {
        setFilterOpen(true);
    }, []);
    const onFilterDialogClose = useCallback(() => {
        setFilterOpen(false);
    }, []);
    const onFilterChange = useCallback((value: PokemonFilterConfig) => {
        const newConfig = {...config, filter: value};
        setConfig(newConfig);
        localStorage.setItem('PstPokemonSelectParam', JSON.stringify(newConfig));
    }, [config]);
    const onFilterConfigChange = useCallback((value: PokemonFilterFooterConfig) => {
        const newValue = {...config, descending: value.descending,
            sort: value.sort as "sleeptype"|"name"|"pokedexno"|"type"};
        setConfig(newValue);
        localStorage.setItem('PstPokemonSelectParam', JSON.stringify(newValue));
    }, [config]);

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

    return <StyledDialog open={open} onClose={closeHandler}>
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
                    <PokemonIcon idForm={option.idForm} size={48}/>
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
        <PokemonFilterFooter
            sortTypes={["pokedexno", "name", "sleeptype", "type"]}
            value={{
                isFiltered: config.filter.isFiltered,
                sort: config.sort, descending: config.descending,
            }}
            onChange={onFilterConfigChange}
            onFilterButtonClick={onFilterButtonClick}/>
        <PokemonFilterDialog open={filterOpen} onClose={onFilterDialogClose}
            value={config.filter} onChange={onFilterChange}/>
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
        filter: new PokemonFilterConfig({}),
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

    // update from old config
    if (json.filter === undefined) {
        json.filter = {
            filterType: json.filterType,
            filterEvolve: json.filterEvolve,
        };
    }
    ret.filter.load(json.filter);
    if (typeof(json.sort) === "string" &&
        ["sleeptype", "name", "pokedexno", "type"].includes(json.sort)) {
        ret.sort = json.sort;
    }
    if (typeof(json.descending) === "boolean") {
        ret.descending = json.descending;
    }
    return ret;
}

export default PokemonSelectDialog;
