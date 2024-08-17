import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIcon from './PokemonIcon';
import { IvAction } from './IvState';
import PokemonFilterFooter, { PokemonFilterConfig } from './PokemonFilterFooter';
import BoxFilterDialog from './BoxFilterDialog';
import BoxSortConfigFooter from './BoxSortConfigFooter';
import { IngredientName, IngredientNames, PokemonType } from '../../data/pokemons';
import { MainSkillName, MainSkillNames } from '../../util/MainSkill';
import { SubSkillType } from '../../util/SubSkill';
import PokemonRp from '../../util/PokemonRp';
import PokemonStrength, { StrengthParameter } from '../../util/PokemonStrength';
import { ButtonBase, Fab, IconButton, ListItemIcon,
    Menu, MenuItem, MenuList }  from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next'

const BoxView = React.memo(({items, selectedId, parameter, dispatch, onShare}: {
    items: PokemonBoxItem[],
    selectedId: number,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
    onShare: () => void,
}) => {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = React.useState(loadBoxSortConfig());
    const [filterConfig, setFilterConfig] = React.useState<BoxFilterConfig>(boxFilterConfig);
    const [filterOpen, setFilterOpen] = React.useState(false);
    const onItemChange = React.useCallback((action: IvAction) => {
        dispatch(action);
    }, [dispatch]);

    const onAddClick = React.useCallback(() => {
        dispatch({type: "add"});
    }, [dispatch]);

    const onFilterConfigChange = React.useCallback((value: PokemonFilterConfig) => {
        const newValue = {...sortConfig,
            sort: value.sort as BoxSortType,
            descending: value.descending};
        setSortConfig(newValue);
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify(newValue));
    }, [sortConfig]);
    const onSortConfigChange = React.useCallback((value: BoxSortConfig) => {
        setSortConfig(value);
        localStorage.setItem('PstPokemonBoxParam', JSON.stringify(value));
    }, []);
    const onFilterButtonClick = React.useCallback(() => {
        setFilterOpen(true);
    }, []);
    const onFilterDialogClose = React.useCallback(() => {
        setFilterOpen(false);
    }, [])
    const onFilterChange = React.useCallback((value: BoxFilterConfig) => {
        boxFilterConfig = value;
        setFilterConfig(boxFilterConfig);
    }, []);

    // filter
    let filtered = React.useMemo(() => filterConfig.filter(items, t),
        [items, filterConfig, t]);

    // sort
    let sortedItems: PokemonBoxItem[] = React.useMemo(
        () => sortPokemonItems(filtered, sortConfig, parameter, t),
        [sortConfig, filtered, parameter, t]);
    if (!sortConfig.descending) {
        sortedItems = [...sortedItems].reverse();
    }

    const elms = sortedItems.map((item) => (
        <BoxLargeItem key={item.id} item={item} selected={item.id === selectedId}
            onChange={onItemChange} onShare={onShare}/>));

    const footerValue = React.useMemo(() => ({
        isFiltered: !filterConfig.isEmpty,
        sort: sortConfig.sort,
        descending: sortConfig.descending,
    }), [filterConfig, sortConfig]);
    const footerSortTypes = React.useMemo(() => 
        ["level", "name", "pokedexno", "rp", "berry", "ingredient", "skill count"], []);
        
    return <>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 0.5rem 120px 0.5rem',
            width: 'calc(100% - 1rem)',
        }}>
            {elms.length === 0 && <div style={{margin: "5rem auto", color: "#888", fontSize: "0.9rem"}}>
                {items.length === 0 ? t('box is empty') : t('no pokemon found')}
            </div>}
            {elms}
        </div>
        <div style={{
            position: 'fixed',
            width: '100%',
            bottom: 0,
            margin: '.5rem 0 0',
        }}>
            <Fab onClick={onAddClick} color="primary" size="medium"
                sx={{position: 'absolute', top: '-55px', right: '10px'}}>
                <AddIcon/>
            </Fab>
            <BoxSortConfigFooter parameter={parameter} sortConfig={sortConfig}
                dispatch={dispatch} onChange={onSortConfigChange}/>
            <div style={{
                paddingLeft: '1rem',
                paddingBottom: '1.2rem',
                background: '#f76',
                width: 'calc(100% - 1rem)',
            }}>
                <PokemonFilterFooter value={footerValue}
                    onChange={onFilterConfigChange}
                    onFilterButtonClick={onFilterButtonClick}
                    sortTypes={footerSortTypes}/>
            </div>
        </div>
        <BoxFilterDialog open={filterOpen} onClose={onFilterDialogClose}
            value={filterConfig} onChange={onFilterChange}/>
    </>;
});

function sortPokemonItems(filtered: PokemonBoxItem[],
    sortConfig: BoxSortConfig,
    parameter: StrengthParameter,
    t: typeof i18next.t
) {
    const sort = sortConfig.sort;
    if (sort === "level") {
        return filtered.sort((a, b) =>
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id);
    }
    else if (sort === "name") {
        return filtered.sort((a, b) =>
            b.filledNickname(t) > a.filledNickname(t) ? 1 :
            b.filledNickname(t) < a.filledNickname(t) ? -1 :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id);
    }
    else if (sort === "pokedexno") {
        return filtered.sort((a, b) =>
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id);
    }
    else if (sort === "rp") {
        const rpCache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            rpCache[item.id] = new PokemonRp(item.iv).Rp;
        });
        return filtered.sort((a, b) =>
            rpCache[b.id] !== rpCache[a.id] ? rpCache[b.id] - rpCache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id);
    }
    else if (sort === "berry") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            cache[item.id] = strength.calculate().berryTotalStrength;
        });
        return filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id);
    }
    else if (sort === "ingredient") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            const res = strength.calculate().ingredients;
            if (sortConfig.ingredient === "unknown") {
                // total ingredient count
                cache[item.id] = res.reduce((p, c) => p + c.count, 0);
            }
            else {
                // specified ingredient count
                cache[item.id] = res
                    .find(x => x.name === sortConfig.ingredient)?.count ?? 0;
            }
        });
        return filtered
            .filter(x => cache[x.id] > 0)
            .sort((a, b) =>
                cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
                b.id - a.id);
    }
    else if (sort === "skill count") {
        const cache: {[id: string]: number} = {};
        filtered = filtered
            .filter(x => x.iv.pokemon.skill.startsWith(sortConfig.mainSkill));
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, {
                ...parameter, maxSkillLevel: true,
            });
            cache[item.id] = strength.calculate().skillCount;
        });
        return filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.id - a.id);
    }
    return filtered;
}

/** Represents the field by which the box are sorted.  */
export type BoxSortType = "level"|"name"|"pokedexno"|"rp"|"berry"|"ingredient"|"skill count";

/**
 * Pokemon box sort configuration.
 */
export interface BoxSortConfig {
    /** Sort type. */
    sort: BoxSortType;
    /** Ingredient name when `sort` is `"ingredient"`. */
    ingredient: IngredientName;
    /** Main skill name when `sort` is `"skill count"`. */
    mainSkill: MainSkillName;
    /** Descending (true) or ascending (false). */
    descending: boolean;
}

/**
 * Pokmeon box filter configuration.
 */
interface IBoxFilterConfig {
    /** Name */
    name: string;
    /** Filter type */
    filterTypes: PokemonType[];
    /** Filter ingredient */
    ingredientName?: IngredientName;
    /** Include only Pokemon with the ingredientName unlocked */
    ingredientUnlockedOnly: boolean;
    /** Filter main skill */
    mainSkillNames: MainSkillName[];
    /** Filter sub skills */
    subSkillNames: SubSkillType[];
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillUnlockedOnly: boolean;
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillAnd: boolean;
}

/**
 * Pokmeon box filter configuration class.
 */
export class BoxFilterConfig implements IBoxFilterConfig {
    /** Name */
    name: string;
    /** Filter type */
    filterTypes: PokemonType[];
    /** Filter ingredient */
    ingredientName?: IngredientName;
    /** Include only Pokemon with the ingredientName unlocked */
    ingredientUnlockedOnly: boolean;
    /** Filter main skill */
    mainSkillNames: MainSkillName[];
    /** Filter sub skills */
    subSkillNames: SubSkillType[];
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillUnlockedOnly: boolean;
    /** Include only Pokemon with the subSkillName unlocked */
    subSkillAnd: boolean;

    /** Initialize the instance */
    constructor(values: Partial<IBoxFilterConfig>) {
        this.name = values.name ?? "";
        this.filterTypes = values.filterTypes ?? [];
        this.ingredientName = values.ingredientName;
        this.ingredientUnlockedOnly = values.ingredientUnlockedOnly ?? false;
        this.mainSkillNames = values.mainSkillNames ?? [];
        this.subSkillNames = values.subSkillNames ?? [];
        this.subSkillUnlockedOnly = values.subSkillUnlockedOnly ?? true;
        this.subSkillAnd = values.subSkillAnd ?? true;
    }

    /**
     * Filter the given box item based on the current filter config.
     * @param items An array of box items to be filtered.
     * @param t The `i18next.t` function for translations.
     * @returns An array of filtered box items.
     */
    filter(items: PokemonBoxItem[], t: typeof i18next.t): PokemonBoxItem[] {
        let ret = items;
        if (this.name !== "") {
            const name = this.name.toLowerCase();
            ret = ret.filter(x =>
                x.nickname.toLowerCase().indexOf(this.name) !== -1 ||
                t(`pokemons.${x.iv.pokemonName}`).toLowerCase().indexOf(name) !== -1
            );
        }
        if (this.ingredientName !== undefined) {
            const ing: IngredientName = this.ingredientName;
            const unlocked = this.ingredientUnlockedOnly;
            ret = ret.filter(x =>
                x.iv.getIngredients(unlocked).includes(ing));
        }
        if (this.filterTypes.length !== 0) {
            ret = ret.filter(x => this.filterTypes.includes(x.iv.pokemon.type));
        }
        if (this.mainSkillNames.length !== 0) {
            ret = ret.filter(x => this.mainSkillNames
                .some(n => x.iv.pokemon.skill.startsWith(n)));
        }
        if (this.subSkillNames.length !== 0) {
            ret = ret.filter(x => {
                const subSkills = x.iv.subSkills
                    .getActiveSubSkills(this.subSkillUnlockedOnly ? x.iv.level : 100)
                    .map(x => x.name);
                if (this.subSkillAnd) {
                    return this.subSkillNames
                        .every(skill => subSkills.includes(skill));
                }
                else {
                    return this.subSkillNames
                        .some(skill => subSkills.includes(skill));
                }
            });
        }
        return ret;
    }

    /** Check whether the instance is empty */
    get isEmpty(): Boolean {
        return this.name === "" &&
            this.filterTypes.length === 0 &&
            this.ingredientName === undefined &&
            this.mainSkillNames.length === 0 &&
            this.subSkillNames.length === 0;
    }
}

/** Cache for latest filter config */
let boxFilterConfig = new BoxFilterConfig({});

/**
 * Load box sort config from localStorage.
 * @returns config.
 */
function loadBoxSortConfig(): BoxSortConfig {
    const ret: BoxSortConfig = {
        sort: "level",
        ingredient: "unknown",
        mainSkill: "Energy for Everyone S",
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
    if (typeof(json.sort) === "string" &&
        ["level", "name", "pokedexno", "rp", "berry", "ingredient", "skill count"].includes(json.sort)) {
        ret.sort = json.sort;
    }
    if (typeof(json.ingredient) === "string" &&
        IngredientNames.includes(json.ingredient)) {
        ret.ingredient = json.ingredient;
    }
    if (typeof(json.mainSkill) === "string" &&
        MainSkillNames.includes(json.mainSkill)) {
        ret.mainSkill = json.mainSkill;
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
