import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIcon from './PokemonIcon';
import { IvAction } from './IvState';
import PokemonFilterDialog, { PokemonFilterDialogConfig } from './PokemonFilterDialog';
import PokemonFilterFooter, { PokemonFilterConfig } from './PokemonFilterFooter';
import { PokemonType, PokemonTypes } from '../../data/pokemons';
import PokemonRp from '../../util/PokemonRp';
import { ButtonBase, Fab, IconButton, ListItemIcon,
    Menu, MenuItem, MenuList }  from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';

const BoxView = React.memo(({items, selectedId, dispatch, onShare}: {
    items: PokemonBoxItem[],
    selectedId: number,
    dispatch: (action: IvAction) => void,
    onShare: () => void,
}) => {
    const { t } = useTranslation();
    const defaultConfig = React.useMemo(() => loadPokemonDialogConfig(), []);
    const [config, setConfig] = React.useState<PokemonDialogConfig>(defaultConfig);
    const [filterOpen, setFilterOpen] = React.useState(false);
    const onItemChange = React.useCallback((action: IvAction) => {
        dispatch(action);
    }, [dispatch]);

    const onAddClick = React.useCallback(() => {
        dispatch({type: "add"});
    }, [dispatch]);

    const onFilterConfigChange = React.useCallback((value: PokemonFilterConfig) => {
        const newValue = {...config,
            sort: value.sort as "level"|"name"|"pokedexno"|"rp",
            descending: value.descending};
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify(newValue));
        setConfig(newValue);
    }, [config]);
    const onFilterButtonClick = React.useCallback(() => {
        setFilterOpen(true);
    }, []);
    const onFilterDialogClose = React.useCallback(() => {
        setFilterOpen(false);
    }, [])
    const onFilterChange = React.useCallback((value: PokemonFilterDialogConfig) => {
        const newConfig = {...config, ...value};
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify(newConfig));
        setConfig(newConfig);
    }, [config]);

    // filter
    let filtered = items;
    if (config.filterType !== null) {
        filtered = filtered.filter(x => x.iv.pokemon.type === config.filterType);
    }
    if (config.filterEvolve === "final") {
        filtered = filtered.filter((item) => item.iv.pokemon.isFullyEvolved);
    }
    if (config.filterEvolve === "non") {
        filtered = filtered.filter((item) => item.iv.pokemon.evolutionCount === -1);
    }

    // sort
    let sortedItems: PokemonBoxItem[] = [];
    if (config.sort === "level") {
        sortedItems = filtered.sort((a, b) => b.iv.level !== a.iv.level ?
            b.iv.level - a.iv.level : b.iv.pokemon.id - a.iv.pokemon.id);
    }
    else if (config.sort === "name") {
        sortedItems = filtered.sort((a, b) =>
            b.filledNickname(t) > a.filledNickname(t) ? 1 :
            b.filledNickname(t) < a.filledNickname(t) ? -1 : 0);
    }
    else if (config.sort === "pokedexno") {
        sortedItems = filtered.sort((a, b) => b.iv.pokemon.id - a.iv.pokemon.id);
    }
    else if (config.sort === "rp") {
        const rpCache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            rpCache[item.id] = new PokemonRp(item.iv).Rp;
        });
        sortedItems = filtered.sort((a, b) => rpCache[b.id] - rpCache[a.id]);
    }
    if (!config.descending) {
        sortedItems = sortedItems.reverse();
    }

    const elms = sortedItems.map((item) => (
        <BoxLargeItem key={item.id} item={item} selected={item.id === selectedId}
            onChange={onItemChange} onShare={onShare}/>));

    const footerValue = React.useMemo(() => ({
        isFiltered: config.filterType !== null || config.filterEvolve !== "all",
        sort: config.sort,
        descending: config.descending,
    }), [config]);
    const footerSortTypes = React.useMemo(() => 
        ["level", "name", "pokedexno", "rp"], []);
        
    return <>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            marginBottom: '60px',
            width: '100%',
        }}>
            {elms.length === 0 && <div style={{margin: "5rem auto", color: "#888", fontSize: "0.9rem"}}>
                {items.length === 0 ? t('box is empty') : t('no pokemon found')}
            </div>}
            {elms}
        </div>
        <div style={{
            position: 'sticky',
            bottom: 0,
            paddingLeft: '1rem',
            paddingBottom: '1.2rem',
            background: '#f76',
            margin: '.5rem -.5rem 0',
        }}>
            <Fab onClick={onAddClick} color="primary" size="medium"
                sx={{position: 'absolute', bottom: '70px', right: '10px'}}>
                <AddIcon/>
            </Fab>
            <PokemonFilterFooter value={footerValue}
                onChange={onFilterConfigChange}
                onFilterButtonClick={onFilterButtonClick}
                sortTypes={footerSortTypes}/>
        </div>
        <PokemonFilterDialog open={filterOpen} onClose={onFilterDialogClose}
            value={config} onChange={onFilterChange}/>
    </>;
});

/**
 * Pokemon select dialog configuration.
 */
interface PokemonDialogConfig {
    /** Filter type */
    filterType: PokemonType|null;
    /** Filter by evolve */
    filterEvolve: "all"|"non"|"final";
    /** Sort type. */
    sort: "level"|"name"|"pokedexno"|"rp";
    /** Descending (true) or ascending (false). */
    descending: boolean;
}

/**
 * Load dialog config from localStorage.
 * @returns config.
 */
function loadPokemonDialogConfig(): PokemonDialogConfig {
    const ret: PokemonDialogConfig = {
        filterType: null,
        filterEvolve: "all",
        sort: "level",
        descending: true,
    };

    const settings = localStorage.getItem('PstPokemonBoxParam');
    if (settings === null) {
        return ret;
    }
    const json = JSON.parse(settings);
    if (typeof(json) !== "object" || json === null) {
        return ret;
    }
    if (typeof(json.filterType) === "string" &&
        PokemonTypes.includes(json.filterType)) {
        ret.filterType = json.filterType;
    }
    if (typeof(json.filterEvolve) === "string" &&
        ["all", "non", "final"].includes(json.filterEvolve)) {
        ret.filterEvolve = json.filterEvolve;
    }
    if (typeof(json.sort) === "string" &&
        ["level", "name", "pokedexno", "rp"].includes(json.sort)) {
        ret.sort = json.sort;
    }
    if (typeof(json.descending) === "boolean") {
        ret.descending = json.descending;
    }
    return ret;
}

const BoxLargeItem = React.memo(({item, selected, onChange, onShare}: {
    item: PokemonBoxItem,
    selected: boolean,
    onChange: (action: IvAction) => void,
    onShare: () => void,
}) => {
    const { t } = useTranslation();
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(moreMenuAnchor);

    const longPressRef = useLongPress(() => {
        onMenuClick("select");
        onMenuClick("edit");
    }, 500);

    const clickHandler = React.useCallback(() => {
        onChange({type: "select", payload: {id: item.id}});
    }, [onChange, item.id]);
    const onMoreIconClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    }, [setMoreMenuAnchor]);
    const onMoreMenuClose = React.useCallback(() => {
        setMoreMenuAnchor(null);
    }, [setMoreMenuAnchor]);
    const onMenuClick = React.useCallback((type: string) => {
        onChange({type, payload: {id: item.id}} as IvAction);
        setMoreMenuAnchor(null);
    }, [item, onChange, setMoreMenuAnchor]);
    const onShareClick = React.useCallback(() => {
        setMoreMenuAnchor(null);
        onShare();
    }, [onShare]);

    return (
        <StyledBoxLargeItem>
            <ButtonBase onClick={clickHandler} className={selected ? 'selected' : ''}
                ref={longPressRef}>
                <header><span className="lv">Lv.</span>{item.iv.level}</header>
                <PokemonIcon id={item.iv.pokemon.id} size={32}/>
                <footer>{item.filledNickname(t)}</footer>
            </ButtonBase>
            {selected && <IconButton onClick={onMoreIconClick}><MoreIcon/></IconButton>}
            <Menu anchorEl={moreMenuAnchor} open={isMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
                <MenuList>
                    <MenuItem onClick={() => onMenuClick("edit")}>
                        <ListItemIcon><EditNoteOutlinedIcon/></ListItemIcon>
                        {t('edit')}
                    </MenuItem>
                    <MenuItem onClick={onShareClick}>
                        <ListItemIcon><IosShareIcon/></ListItemIcon>
                        {t('share')}
                    </MenuItem>
                    <MenuItem onClick={() => onMenuClick("dup")}>
                        <ListItemIcon><ContentCopyOutlinedIcon/></ListItemIcon>
                        {t('duplicate')}
                    </MenuItem>
                    <MenuItem onClick={() => onMenuClick("remove")}>
                        <ListItemIcon sx={{minWidth: '24px'}}><RemoveCircleOutlineOutlinedIcon/></ListItemIcon>
                        {t('delete')}
                    </MenuItem>
                </MenuList>
            </Menu>
        </StyledBoxLargeItem>);
});

const StyledBoxLargeItem = styled('div')({
    position: 'relative',
    '& > button:first-of-type': {
        fontFamily: `"M PLUS 1p"`,
        display: 'block',
        textAlign: 'center',
        width: '80px',
        padding: '0.2rem 0',
        border: '1px solid transparent',
        '& > header': {
            fontSize: '0.7rem',
            fontWeight: 'bold',
            '& > span.lv': {
                color: '#62d540',
                fontSize: '0.6rem',
                paddingRight: '0.2rem',
            },
        },
        '& > div': {
            margin: '0.1rem auto 0.1rem',
        },
        '& > footer': {
            fontSize: '0.8rem',
            color: '#666666',
            overflowWrap: 'anywhere',
        },
        '&.selected': {
            background: '#d3e9f7',
            borderRadius: '0.5rem',
            border: '1px solid #5e7da0',
        },
    },
    '& > button.MuiIconButton-root': {
        position: 'absolute',
        right: '-5px',
        top: '-2px',
        '& > svg': {
            width: '0.8rem',
            height: '0.8rem',
        },
    },
});

function useLongPress(
    callback: () => void,
    ms: number
) {
    const timeout = React.useRef<NodeJS.Timeout|null>(null);
    const ref = React.useRef<HTMLButtonElement|null>(null);

    const touchStart = React.useCallback(() => {
        timeout.current = setTimeout(callback, ms);
    }, [callback, ms]);
    const touchEnd = React.useCallback(() => {
        timeout.current && clearTimeout(timeout.current);
        timeout.current = null;
    }, []);

    const mouseEnd = React.useCallback(() => {
        document.removeEventListener("mousemove", mouseEnd);
        document.removeEventListener("mouseup", mouseEnd);
        timeout.current && clearTimeout(timeout.current);
        timeout.current = null;
    }, []);
    const mouseStart = React.useCallback(() => {
        if (timeout.current !== null) { return; }
        timeout.current = setTimeout(callback, ms);
        document.addEventListener("mousemove", mouseEnd);
        document.addEventListener("mouseup", mouseEnd);
    }, [callback, ms, mouseEnd]);

    React.useEffect(() => {
        if (ref.current === null) {
            return () => {};
        }
        const elm = ref.current;
        elm.addEventListener("touchstart", touchStart);
        elm.addEventListener("mousedown", mouseStart);
        elm.addEventListener("touchmove", touchEnd);
        elm.addEventListener("touchend", touchEnd);
        return () => {
            elm.removeEventListener("touchstart", touchStart);
            elm.removeEventListener("mousedown", mouseStart);
            elm.removeEventListener("touchmove", touchEnd);
            elm.removeEventListener("touchend", touchEnd);
        }
    }, [mouseStart, touchStart, touchEnd]);
    return ref;
}

export default BoxView;
