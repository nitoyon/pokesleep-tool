import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { styled } from '@mui/system';
import { SleepType } from '../../data/fields';
import pokemons, { PokemonData, PokemonSkill } from '../../data/pokemons';
import { Autocomplete, autocompleteClasses, AutocompleteCloseReason, ButtonBase,
    ClickAwayListener, FilterOptionsState, InputBase, Popper, MenuItem,
    ToggleButton, ToggleButtonGroup, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

/** Props for form control */
interface ControlProps<T> {
    /** Current value of the form control. */
    value: T;
    /** A function called when value has been changed. */
    onChange: (value: T) => void;
}

interface PokemonOption {
    id: number;
    name: string;
    localName: string;
    sleepType: SleepType;
}

const TextLikeButton = styled(ButtonBase)({
    fontSize: '0.9rem',
    display: 'inline',
    textAlign: 'left',
    padding: 0,
    color: 'black',
    borderBottom: '1px solid #777777',
});

const StyledPopper = styled(Popper)(({theme}) => ({
    border: '1px solid #e1e4e8',
    boxShadow: `0 8px 24px rgba(149, 157, 165, 0.2)`,
    borderRadius: 6,
    width: 250,
    zIndex: 9999,
    fontSize: 13,
    color: '#24292e',
    backgroundColor: '#fff',
}));

interface PopperComponentProps {
    anchorEl?: any;
    disablePortal?: boolean;
    open: boolean;
}
  
function PopperComponent(props: PopperComponentProps) {
    const { disablePortal, anchorEl, open, ...other } = props;
    // override width
    /*if ('style' in other &&
        other['style'] instanceof Object &&
        'width' in other['style']) {
        other['style']['width'] = '100%';
    }*/
    return <StyledAutocompletePopper {...other} />;
}

const StyledAutocompletePopper = styled('div')({
    [`& .${autocompleteClasses.paper}`]: {
        boxShadow: 'none',
        margin: 0,
        color: 'inherit',
        fontSize: 13,
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
  
const PokemonTextField = React.memo(({value, onChange}: ControlProps<string>) => {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const pokemonOptions: PokemonOption[] = useMemo(() => {
        const options: PokemonOption[] = [];
        pokemons.forEach((pokemon) => {
            options.push({
                id: pokemon.id,
                name: pokemon.name,
                localName: t(`pokemon.${pokemon.name}`),
                sleepType: pokemon.sleepType,
            });
        });
        return options;
    }, [t]);

    // If value not found in list, select first pokemon
    let selectedValue = pokemonOptions.find(x => x.name === value);
    if (selectedValue === undefined) {
        selectedValue = pokemonOptions[0];
    }

    // Open popup when input area is clicked
    const onInputClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, [setAnchorEl]);
    // Function to close popup
    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

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
        return options.filter((option) =>
            normalize(option.localName).includes(input));
    }, []);

    // Close when ESC key is pressed
    const onAutocompleteClose = useCallback((
        event: React.ChangeEvent<{}>,
        reason: AutocompleteCloseReason,
      ) => {
        if (reason === 'escape') {
            handleClose();
        }
    }, [handleClose]);

    // Selected handler
    const onAutocompleteChange = useCallback((event: any, newValue: PokemonOption|null) => {
        if (newValue !== null && newValue.name !== null) {
            onChange(newValue.name);
            handleClose();
        }
    }, [onChange]);

    const open = Boolean(anchorEl);
    return (<>
        <TextLikeButton onClick={onInputClick}>{selectedValue.localName}</TextLikeButton>
        <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start">
            <ClickAwayListener onClickAway={handleClose}>
                <div>
                    <Autocomplete options={pokemonOptions}
                        open
                        getOptionLabel={(option) => option.localName}
                        isOptionEqualToValue={(o, v) => o.name === v.name}
                        PopperComponent={PopperComponent}
                        filterOptions={filterOptions}
                        renderOption={(props, option) => (        
                            <li {...props}>
                                {option.localName}
                            </li>
                        )}
                        renderInput={(params) => (
                            <StyledInput
                                ref={params.InputProps.ref}
                                inputProps={{
                                    autoComplete: "new-password",
                                    ...params.inputProps
                                }}
                                startAdornment={
                                    <InputAdornment position="start">
                                        <SearchIcon/>
                                    </InputAdornment>
                                }
                                placeholder="Filter labels"
                            />
                            )}
                        onClose={onAutocompleteClose}
                        onChange={onAutocompleteChange}/>
                    <ToggleButtonGroup exclusive size="small">
                        <ToggleButton value="sleep">睡眠タイプ</ToggleButton>
                        <ToggleButton value="id">図鑑番号</ToggleButton>
                        <ToggleButton value="type">タイプ</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </ClickAwayListener>
        </StyledPopper>
    </>);
        /*<Autocomplete size="small" options={pokemonOptions}
            value={selectedValue}
            getOptionLabel={(option) => option.localName}
            isOptionEqualToValue={(o, v) => o.name === v.name}
            renderOption={(props, option) => (
                <li {...props}>
                    {option.localName}
                </li>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: "new-password"
                    }}/>
            )}
            onChange={onAutocompleteChange}/>
    );*/
});

export default PokemonTextField;
