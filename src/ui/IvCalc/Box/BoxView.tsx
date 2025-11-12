import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../../util/PokemonBox';
import BoxFilterConfig from '../../../util/PokemonBoxFilter';
import { sortPokemonItems, BoxSortType, BoxSortConfig, loadBoxSortConfig } from '../../../util/PokemonBoxSort';
import PokemonIcon from '../PokemonIcon';
import { IvAction } from '../IvState';
import PokemonFilterFooter, { PokemonFilterFooterConfig } from '../PokemonFilterFooter';
import BoxFilterDialog from './BoxFilterDialog';
import BoxSortConfigFooter from './BoxSortConfigFooter';
import CandyDialog from '../CandyDialog';
import { shareIv } from '../ShareUtil';
import PokemonIv from '../../../util/PokemonIv';
import { StrengthParameter } from '../../../util/PokemonStrength';
import { Button, ButtonBase, Fab, IconButton, ListItemIcon,
    Menu, MenuItem, MenuList }  from '@mui/material';
import CandyIcon from '../../Resources/CandyIcon';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';

const BoxView = React.memo(({items, iv, selectedId, parameter, dispatch}: {
    items: PokemonBoxItem[],
    iv: PokemonIv,
    selectedId: number,
    parameter: StrengthParameter,
    dispatch: (action: IvAction) => void,
}) => {
    const { t } = useTranslation();
    const [sortConfig, setSortConfig] = React.useState(() => loadBoxSortConfig());
    const [filterConfig, setFilterConfig] = React.useState<BoxFilterConfig>(boxFilterConfig);
    const [filterOpen, setFilterOpen] = React.useState(false);
    const [candyOpen, setCandyOpen] = React.useState(false);

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
    const onCandyClick = React.useCallback(() => {
        setCandyOpen(true);
    }, []);
    const onCandyDialogClose = React.useCallback(() => {
        setCandyOpen(false);
    }, []);
    const onIvChange = React.useCallback((iv: PokemonIv) => {
        const selectedItem = items.find(x => x.id === selectedId);
        if (selectedItem !== undefined) {
            dispatch({type: "updateIv", payload: {iv}});
        }
    }, [items, dispatch, selectedId]);

    // filter
    const filtered = React.useMemo(() => filterConfig.filter(items, parameter.evolved, t),
        [items, filterConfig, parameter.evolved, t]);

    // sort
    const [sortedItems, errorMessage] = React.useMemo(
        () => sortPokemonItems(filtered, sortConfig.sort,
            sortConfig.ingredient, sortConfig.mainSkill,
            parameter, t),
        [sortConfig.sort, sortConfig.ingredient, sortConfig.mainSkill,
            filtered, parameter, t]);

    let elms = sortedItems.map((item) => (
        <BoxLargeItem key={item.id} item={item} selected={item.id === selectedId}
            dispatch={dispatch} onCandyClick={onCandyClick}/>));
    if (!sortConfig.descending) {
        elms = [...elms].reverse();
    }

    const footerValue = React.useMemo(() => ({
        isFiltered: !filterConfig.isEmpty,
        sort: sortConfig.sort,
        descending: sortConfig.descending,
    }), [filterConfig, sortConfig]);
    const footerSortTypes = React.useMemo(() => 
        ["level", "name", "pokedexno", "rp", "total strength", "berry", "ingredient", "skill"], []);

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
        <CandyDialog iv={iv} open={candyOpen}
            dstLevel={parameter.level === 0 ? undefined : parameter.level}
            onChange={onIvChange} onClose={onCandyDialogClose}/>
    </>;
});

/**
 * Cache for latest filter config
 *
 * This global variable persists the filter config across tab switches.
 * Without it, BoxFilterConfig would be cleared when the [Box] tab is unselected.
 */
let boxFilterConfig = new BoxFilterConfig({});

const BoxLargeItem = React.memo(({item, selected, dispatch, onCandyClick}: {
    item: PokemonBoxItem,
    selected: boolean,
    dispatch: (action: IvAction) => void,
    onCandyClick: (item: PokemonBoxItem) => void,
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
    const onCandyClickHandler = React.useCallback(() => {
        setMoreMenuAnchor(null);
        onCandyClick(item);
    }, [item, onCandyClick]);

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
                    <MenuItem onClick={onCandyClickHandler}>
                        <ListItemIcon sx={{minWidth: '24px'}}><CandyIcon sx={{color: '#888'}}/></ListItemIcon>
                        {t('candy')}
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
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = null;
    }, []);

    const mouseEnd = React.useCallback(() => {
        document.removeEventListener("mousemove", mouseEnd);
        document.removeEventListener("mouseup", mouseEnd);
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
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
