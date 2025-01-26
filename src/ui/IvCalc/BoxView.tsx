import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIcon from './PokemonIcon';
import { IvAction } from './IvState';
import PokemonFilterFooter, { PokemonFilterFooterConfig } from './PokemonFilterFooter';
import BoxFilterDialog from './BoxFilterDialog';
import BoxSortConfigFooter from './BoxSortConfigFooter';
import { shareIv } from './ShareUtil';
import { IngredientName, IngredientNames, PokemonType } from '../../data/pokemons';
import { MainSkillName, MainSkillNames } from '../../util/MainSkill';
import { SubSkillType } from '../../util/SubSkill';
import PokemonRp from '../../util/PokemonRp';
import PokemonStrength, { StrengthParameter } from '../../util/PokemonStrength';
import { Button, ButtonBase, Fab, IconButton, ListItemIcon,
    Menu, MenuItem, MenuList }  from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next'

const BoxView = React.memo(({items, selectedId, parameter, dispatch}: {
    items: PokemonBoxItem[],
    selectedId: number,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
}) => {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = React.useState(loadBoxSortConfig());
    const [filterConfig, setFilterConfig] = React.useState<BoxFilterConfig>(boxFilterConfig);
    const [filterOpen, setFilterOpen] = React.useState(false);

    const onAddClick = React.useCallback(() => {
        dispatch({type: "add"});
    }, [dispatch]);

    const onFilterConfigChange = React.useCallback((value: PokemonFilterFooterConfig) => {
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
    const filtered = React.useMemo(() => filterConfig.filter(items, t),
        [items, filterConfig, t]);

    // sort
    const [sortedItems, errorMessage] = React.useMemo(
        () => sortPokemonItems(filtered, sortConfig, parameter, t),
        [sortConfig, filtered, parameter, t]);

    let elms = sortedItems.map((item) => (
        <BoxLargeItem key={item.id} item={item} selected={item.id === selectedId}
            dispatch={dispatch}/>));
    if (!sortConfig.descending) {
        elms = [...elms].reverse();
    }

    const footerValue = React.useMemo(() => ({
        isFiltered: !filterConfig.isEmpty,
        sort: sortConfig.sort,
        descending: sortConfig.descending,
    }), [filterConfig, sortConfig]);
    const footerSortTypes = React.useMemo(() => 
        ["level", "name", "pokedexno", "rp", "total strength", "berry", "ingredient", "skill count"], []);
        
    return <>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 0.5rem 300px 0.5rem',
            width: 'calc(100% - 1rem)',
        }}>
            {elms.length === 0 && <div style={{margin: "5rem auto 0", color: "#888", fontSize: "0.9rem"}}>
                {items.length === 0 ? t('box is empty') : errorMessage}
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
            <BoxExportAlert count={items.length} config={sortConfig}
                dispatch={dispatch} onChange={onSortConfigChange}/>
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

/**
 * Filter the given Pokemon box items.
 * @param filtered The array of Pokémon box items to be filtered.
 * @param sortConfig Sort configuration.
 * @param parameter Strength parameter.
 * @param t The translation function from i18next.
 * @returns A tuple containing:
 *   - An array of filtered and sorted Pokémon box items.
 *   - An error string, if any error occurs; otherwise, an empty string.
 */
function sortPokemonItems(filtered: PokemonBoxItem[],
    sortConfig: BoxSortConfig,
    parameter: StrengthParameter,
    t: typeof i18next.t
): [PokemonBoxItem[], string] {
    if (filtered.length === 0) {
        return [[], t('no pokemon found')];
    }

    // Create a shallow copy of `filtered` because Array.sort mutates it
    filtered = [...filtered];

    const sort = sortConfig.sort;
    if (sort === "level") {
        return [filtered.sort((a, b) =>
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "name") {
        return [filtered.sort((a, b) =>
            b.filledNickname(t) > a.filledNickname(t) ? 1 :
            b.filledNickname(t) < a.filledNickname(t) ? -1 :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "pokedexno") {
        return [filtered.sort((a, b) =>
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id), ''];
    }
    else if (sort === "rp") {
        const rpCache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            rpCache[item.id] = new PokemonRp(item.iv).Rp;
        });
        return [filtered.sort((a, b) =>
            rpCache[b.id] !== rpCache[a.id] ? rpCache[b.id] - rpCache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.iv.level !== a.iv.level ? b.iv.level - a.iv.level :
            b.id - a.id), ''];
    }
    else if (sort === "total strength") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            cache[item.id] = strength.calculate().totalStrength;
        });
        return [filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "berry") {
        const cache: {[id: string]: number} = {};
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, parameter);
            cache[item.id] = strength.calculate().berryTotalStrength;
        });
        return [filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.iv.pokemon.id !== a.iv.pokemon.id ? b.iv.pokemon.id - a.iv.pokemon.id :
            b.id - a.id), ''];
    }
    else if (sort === "ingredient") {
        if (parameter.tapFrequency === 'none') {
            return [[], t('no ingredient')];
        }

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
        const ret = filtered
            .filter(x => cache[x.id] > 0)
            .sort((a, b) =>
                cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
                b.id - a.id);
        return [ret, ret.length > 0 ? '' : t('no pokemon found')]
    }
    else if (sort === "skill count") {
        if (parameter.tapFrequency === 'none' ||
            parameter.period === 3) {
            return [[], t('no skill')];
        }

        const cache: {[id: string]: number} = {};
        filtered = filtered
            .filter(x => x.iv.pokemon.skill.startsWith(sortConfig.mainSkill));
        filtered.forEach((item) => {
            const strength = new PokemonStrength(item.iv, {
                ...parameter, maxSkillLevel: true,
            });
            cache[item.id] = strength.calculate().skillCount;
        });
        const ret = filtered.sort((a, b) =>
            cache[b.id] !== cache[a.id] ? cache[b.id] - cache[a.id] :
            b.id - a.id);
        return [ret, ret.length > 0 ? '' : t('no pokemon found')]
    }
    return [filtered, ''];
}

/** Represents the field by which the box are sorted.  */
export type BoxSortType = "level"|"name"|"pokedexno"|"rp"|"total strength"|"berry"|"ingredient"|"skill count";

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
    /** Box items when last warning was shown. */
    warnItems: number;
    /** Date when last warning was shown. */
    warnDate: string;
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
        warnItems: 0,
        warnDate: '',
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
        ["level", "name", "pokedexno", "rp", "berry", "total strength", "ingredient", "skill count"].includes(json.sort)) {
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
    if (typeof(json.warnItems) === "number") {
        ret.warnItems = json.warnItems;
    }
    if (typeof(json.warnDate) === "string" &&
        json.warnDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        ret.warnDate = json.warnDate;
    }
    return ret;
}

const BoxLargeItem = React.memo(({item, selected, dispatch}: {
    item: PokemonBoxItem,
    selected: boolean,
    dispatch: (action: IvAction) => void,
}) => {
    const { t } = useTranslation();
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(moreMenuAnchor);

    const longPressRef = useLongPress(() => {
        onMenuClick("select");
        onMenuClick("edit");
    }, 500);

    const clickHandler = React.useCallback(() => {
        dispatch({type: "select", payload: {id: item.id}});
    }, [dispatch, item.id]);
    const onMoreIconClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    }, [setMoreMenuAnchor]);
    const onMoreMenuClose = React.useCallback(() => {
        setMoreMenuAnchor(null);
    }, [setMoreMenuAnchor]);
    const onMenuClick = React.useCallback((type: string) => {
        dispatch({type, payload: {id: item.id}} as IvAction);
        setMoreMenuAnchor(null);
    }, [item, dispatch, setMoreMenuAnchor]);
    const onShareClick = React.useCallback(() => {
        setMoreMenuAnchor(null);
        shareIv(item.iv, dispatch, t);
    }, [dispatch, item.iv, t]);

    return (
        <StyledBoxLargeItem>
            <ButtonBase onClick={clickHandler} className={selected ? 'selected' : ''}
                ref={longPressRef}>
                <header><span className="lv">Lv.</span>{item.iv.level}</header>
                <PokemonIcon idForm={item.iv.idForm} size={32}/>
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

/** Number of days after which the alert message will be shown again. */
const alertDaysThreshold = 30;
/**
 * The threshold for the difference in the number of items in the box since
 * the last alert was shown. 
 * This value determines when an alert message will be triggered.
 */
const boxCountDiffThreshold = 10;

const BoxExportAlert = React.memo(({count, config, dispatch, onChange}: {
    count: number,
    config: BoxSortConfig,
    dispatch: (action: IvAction) => void,
    onChange: (value: BoxSortConfig) => void,
}) => {
    const { t } = useTranslation();
    const onClose = React.useCallback(() => {
        onChange({
            ...config,
            // YYYY-MM-DD
            warnDate: new Date().toLocaleDateString('sv-SE'),
            warnItems: count,
        })
    }, [config, count, onChange]);

    const onExportClick = React.useCallback(() => {
        dispatch({type: 'export'});
        onClose();
    }, [dispatch, onClose]);

    // get time since we displayed the warning message
    const lastWarningTime = config.warnDate !== '' ?
        new Date(config.warnDate).getTime() : new Date().getTime();
    const elapsedTime = new Date().getTime() - lastWarningTime;

    // Whether alertDaysThreshold days elapsed
    const elapsed = elapsedTime > alertDaysThreshold * 24 * 60 * 60 * 1000;

    // check whether the box items increases too much
    const boxIncreased = Math.abs(count - config.warnItems) >= boxCountDiffThreshold;

    // return empty element when no need to show message
    if (!boxIncreased && !elapsed) {
        return <></>;
    }

    return <StyledBoxExportAlert>
        <InfoOutlinedIcon/>
        <div>
            {t('export notice')}
            <Button onClick={onExportClick}>[{t("export")}]</Button>
        </div>
        <IconButton onClick={onClose}><CloseIcon/></IconButton>
    </StyledBoxExportAlert>;
});

const StyledBoxExportAlert = styled('div')({
    background: '#e5f6fd',
    borderTop: '1px solid #d9e9e9',
    paddingTop: '0.2rem',
    color: '#014343',
    display: 'grid',
    gridTemplateColumns: '26px 1fr 40px',
    '& > svg': {
        color: '#0288d1',
        width: '18px',
        height: '18px',
        padding: '4px',
    },
    '& > div': {
        fontSize: '0.8rem',
        color: '#014480',
        '& > button': {
            padding: '0 0 0 0.3rem',
            minWidth: 0,
            fontSize: '0.8rem',
        },
    },
});

export default BoxView;
