import React, { useCallback } from 'react';
import { styled } from '@mui/system';
import { ButtonBase, ClickAwayListener, MenuItem, MenuList, Popper, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import NorthIcon from '@mui/icons-material/North';
import { useTranslation } from 'react-i18next';

/**
 * Pokemon select dialog configuration.
 */
export interface PokemonFilterConfig {
    /** Filter type */
    isFiltered: boolean;
    /** Sort type. */
    sort: string;
    /** Descending (true) or ascending (false). */
    descending: boolean;
}

const PokemonFilterFooter = React.memo(({
    value, sortTypes, onChange, onFilterButtonClick,
}: {
    value: PokemonFilterConfig,
    sortTypes: string[],
    onChange: (value: PokemonFilterConfig) => void,
    onFilterButtonClick: () => void,
}) => {
    const { t } = useTranslation();
    const [sortMenuOpen, setSortMenuOpen] = React.useState(false);
    const sortMenuAnchorRef = React.useRef<HTMLButtonElement>(null);

    // Sort menu handler
    const onSortButtonClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        setSortMenuOpen(true);
    }, [setSortMenuOpen]);
    const onSortMenuClose = useCallback(() => {
        setSortMenuOpen(false);
    }, [setSortMenuOpen]);
    const onToggleSortOrder = useCallback(() => {
        onChange({...value, descending: !value.descending});
    }, [value, onChange]);
    const onSortMenuItemSelected = useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        const val = e.currentTarget.getAttribute('data-value');
        if (val !== null && val !== undefined) {
            onChange({...value, sort: val});
            setSortMenuOpen(false);
        }
    }, [value, onChange, setSortMenuOpen]);

    // Sort menu
    const menuItems = sortTypes.map((type) => <MenuItem
        key={type} onClick={onSortMenuItemSelected} data-value={type}
        selected={value.sort === type}>{t(type)}</MenuItem>);

    return <StyledPokemonFilterFooter>
        <RoundedButton style={{padding: '.2rem .8rem', marginRight: '.5rem', width: "4.5rem", textAlign: 'left'}}
            key={value.isFiltered.toString() /* quick fix for curious label not updated bug on iOS */}
            onClick={onFilterButtonClick}>
            <SearchIcon style={{paddingRight: '0'}}/>{t(value.isFiltered ? 'on' : 'off')}
        </RoundedButton>
        <RoundedButton style={{padding: '.2rem .8rem', marginRight: '.5rem', width: "8rem", textAlign: 'left'}}
            onClick={onSortButtonClick} ref={sortMenuAnchorRef}>
            <SortIcon style={{paddingRight: '.4rem'}}/>{t(value.sort)}
        </RoundedButton>
        <Popper open={sortMenuOpen} anchorEl={sortMenuAnchorRef.current} style={{zIndex: 1500}}>
            <Paper elevation={10}>
                <ClickAwayListener onClickAway={onSortMenuClose}>
                    <MenuList>{menuItems}</MenuList>
                </ClickAwayListener>
            </Paper>
        </Popper>
        <SortOrderButton className={value.descending ? 'desc' : 'asc'} onClick={onToggleSortOrder}>
            <NorthIcon style={{width: '1rem', height: '1rem'}}/>
        </SortOrderButton>
    </StyledPokemonFilterFooter>;
});

const StyledPokemonFilterFooter = styled('div')({
    backgroundColor: '#f76',
    padding: '.5rem .5rem',
});

const RoundedButton = styled(ButtonBase)({
    borderRadius: '3rem',
    background: 'white',
    fontSize: '.8rem',
    color: '#000',
    justifyContent: 'left',
    boxShadow: '0 2px 2px 1px #88666666',
    fontFamily: 'M PLUS 1p',
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

export default PokemonFilterFooter;
