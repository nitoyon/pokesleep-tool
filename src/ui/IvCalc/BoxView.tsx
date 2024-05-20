import React from 'react';
import { styled } from '@mui/system';
import { PokemonBoxItem } from '../../util/PokemonBox';
import PokemonIcon from './PokemonIcon';
import { BoxItemActionType } from './LowerTabView';
import { Button, ButtonBase, IconButton, ListItemIcon,
    Menu, MenuItem, MenuList }  from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import MoreIcon from '@mui/icons-material/MoreVert';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import { useTranslation } from 'react-i18next';

const BoxView = React.memo(({items, selectedId, onChange}: {
    items: PokemonBoxItem[],
    selectedId: number,
    onChange: (id: number, action: BoxItemActionType) => void,
}) => {
    const { t } = useTranslation();
    const onItemChange = React.useCallback((id: number, action: BoxItemActionType) => {
        onChange(id, action);
    }, [onChange]);

    const onAddClick = React.useCallback(() => {
        onChange(-1, "add");
    }, [onChange]);

    const elms = items.sort((a, b) => b.iv.level - a.iv.level).map((item) => (
        <BoxLargeItem key={item.id} item={item} selected={item.id === selectedId}
            onChange={onItemChange}/>));
    
    return <>
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
        }}>
            {elms.length === 0 && <div style={{margin: "2rem auto", color: "#888", fontSize: "0.9rem"}}>まだポケモンが登録されていません。</div>}
            {elms}
        </div>
        <div style={{margin: '0.4rem 0.4rem 0 0', textAlign: 'right'}}>
        <Button onClick={onAddClick}
            startIcon={<AddCircleOutlineIcon/>}>{t('add')}</Button>
        </div>
    </>;
});

const BoxLargeItem = React.memo(({item, selected, onChange}: {
    item: PokemonBoxItem,
    selected: boolean,
    onChange: (id: number, type: BoxItemActionType) => void,
}) => {
    const { t } = useTranslation();
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const isMenuOpen = Boolean(moreMenuAnchor);

    const longPressRef = useLongPress(() => {
        onMenuClick("select");
        onMenuClick("edit");
    }, 500);

    const clickHandler = React.useCallback(() => {
        onChange(item.id, "select");
    }, [onChange, item.id]);
    const onMoreIconClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    }, [setMoreMenuAnchor]);
    const onMoreMenuClose = React.useCallback(() => {
        setMoreMenuAnchor(null);
    }, [setMoreMenuAnchor]);
    const onMenuClick = React.useCallback((action: BoxItemActionType) => {
        onChange(item.id, action);
        setMoreMenuAnchor(null);
    }, [item, onChange, setMoreMenuAnchor]);

    const nickname = item.nickname !== "" ? item.nickname :
        t(`pokemons.${item.iv.pokemonName}`);

    return (
        <StyledBoxLargeItem>
            <ButtonBase onClick={clickHandler} className={selected ? 'selected' : ''}
                ref={longPressRef}>
                <header><span className="lv">Lv.</span>{item.iv.level}</header>
                <PokemonIcon id={item.iv.pokemon.id} size={32}/>
                <footer>{nickname}</footer>
            </ButtonBase>
            {selected && <IconButton onClick={onMoreIconClick}><MoreIcon/></IconButton>}
            <Menu anchorEl={moreMenuAnchor} open={isMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
                <MenuList>
                    <MenuItem onClick={() => onMenuClick("edit")}>
                        <ListItemIcon><EditNoteOutlinedIcon/></ListItemIcon>
                        {t('edit')}
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
        padding: '0.2rem',
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

    const touchStart = React.useCallback((e: Event) => {
        timeout.current = setTimeout(callback, ms);
    }, [callback, ms]);
    const touchEnd = React.useCallback((e: Event) => {
        timeout.current && clearTimeout(timeout.current);
        timeout.current = null;
    }, []);
    React.useEffect(() => {
        if (ref.current === null) {
            return () => {};
        }
        const elm = ref.current;
        elm.addEventListener("touchstart", touchStart);
        elm.addEventListener("touchmove", touchEnd);
        elm.addEventListener("touchend", touchEnd);
        return () => {
            elm.removeEventListener("touchstart", touchStart);
            elm.removeEventListener("touchmove", touchEnd);
            elm.removeEventListener("touchend", touchEnd);
        }
    }, [touchStart, touchEnd]);
    return ref;
}

export default BoxView;
