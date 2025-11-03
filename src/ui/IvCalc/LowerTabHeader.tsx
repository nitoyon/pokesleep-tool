import React from 'react';
import { styled } from '@mui/system';
import IvState, { IvAction } from './IvState';
import { shareIv } from './ShareUtil';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Divider, IconButton, ListItemIcon, Menu, MenuItem, MenuList,
    Tab, Tabs, TextField
 } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const LowerTabHeader = React.memo(({
    state, isBoxEmpty, dispatch, onDeleteAllClick,
}: {
    state: IvState,
    isBoxEmpty: boolean,
    dispatch: (action: IvAction) => void,
    onDeleteAllClick: () => void,
}) => {
    const upperTabIndex = state.tabIndex;
    const tabIndex = state.lowerTabIndex;

    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const [showAddConfirm, setShowAddConfirm] = React.useState(false);
    const { t } = useTranslation();

    const isIvMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 0;
    const isBoxMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 1;
    const boxTabRef = React.useRef<HTMLDivElement | null>(null);

    const onMenuItemClickHandler = React.useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        setMoreMenuAnchor(null);

        const type = e.currentTarget.getAttribute('data-value') || "";
        if (type === "addThis") {
            setShowAddConfirm(true);
        } else if (type === "deleteAll") {
            onDeleteAllClick();
        } else {
            dispatch({type} as IvAction);
        }
    }, [dispatch, onDeleteAllClick]);

    const onShareHandler = React.useCallback(() => {
        setMoreMenuAnchor(null);
        shareIv(state.pokemonIv, dispatch, t);
    }, [dispatch, state.pokemonIv, t]);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        dispatch({type: "changeLowerTab", payload: {index: newValue}});
        setMoreMenuAnchor(null);
    }, [dispatch]);
    const moreButtonClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    }, []);
    const onMoreMenuClose = React.useCallback(() => {
        setMoreMenuAnchor(null);
    }, []);

    const onAddConfirmCancel = React.useCallback(() => {
        setShowAddConfirm(false);
    }, []);

    const onAddConfirmOk = React.useCallback((nickname: string) => {
        setShowAddConfirm(false);
        dispatch({type: "addThis", payload: {iv: state.pokemonIv, nickname}} as IvAction);
        startAddToBoxAnimation(boxTabRef.current);
    }, [dispatch, state.pokemonIv]);

    return (<StyledContainer>
        {tabIndex !== 2 && <IconButton aria-label="actions" color="inherit" onClick={moreButtonClick}>
            <MoreIcon />
        </IconButton>}
        <StyledTabs value={tabIndex} onChange={onTabChange}>
            <StyledTab label={t('pokemon')}/>
            <StyledTab label={t('box')} ref={boxTabRef}/>
            {upperTabIndex === 1 && <StyledTab label={t('parameter')}/>}
        </StyledTabs>

        <Menu anchorEl={moreMenuAnchor} open={isIvMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
            <MenuList>
                <MenuItem onClick={onMenuItemClickHandler} data-value="addThis">
                    <ListItemIcon><AddCircleOutlineIcon/></ListItemIcon>
                    {t('add to box')}
                </MenuItem>
                <MenuItem onClick={onShareHandler} data-value="share">
                    <ListItemIcon><IosShareIcon/></ListItemIcon>
                    {t('share')}
                </MenuItem>
            </MenuList>
        </Menu>
        <Menu anchorEl={moreMenuAnchor} open={isBoxMenuOpen}
            onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
            <MenuList>
                <MenuItem data-value="export" onClick={onMenuItemClickHandler}
                    disabled={isBoxEmpty}>
                    <ListItemIcon><FileUploadIcon/></ListItemIcon>
                    {t('export')}
                </MenuItem>
                <MenuItem data-value="import" onClick={onMenuItemClickHandler}>
                    <ListItemIcon><FileDownloadIcon/></ListItemIcon>
                    {t('import')}
                </MenuItem>
                <Divider />
                <MenuItem data-value="deleteAll" onClick={onMenuItemClickHandler}
                    disabled={isBoxEmpty}>
                    <ListItemIcon><DeleteIcon /></ListItemIcon>
                    {t('delete all')}
                </MenuItem>
            </MenuList>
        </Menu>
        <AddToBoxConfirmDialog open={showAddConfirm}
            initialNickname={t(`pokemons.${state.pokemonIv.pokemonName}`)}
            onConfirm={onAddConfirmOk} onCancel={onAddConfirmCancel}/>
    </StyledContainer>);
});

/**
 * Confirmation dialog for adding a Pokémon to the box.
 * Allows the user to edit the nickname before confirming.
 */
const AddToBoxConfirmDialog = React.memo(({
    open, initialNickname, onConfirm, onCancel,
}: {
    open: boolean,
    initialNickname: string,
    onConfirm: (nickname: string) => void,
    onCancel: () => void,
}) => {
    const { t } = useTranslation();
    const [nickname, setNickname] = React.useState("");

    React.useEffect(() => {
        if (open) {
            setNickname(initialNickname);
        }
    }, [open, initialNickname]);

    const handleConfirm = React.useCallback(() => {
        onConfirm(nickname);
    }, [nickname, onConfirm]);

    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>{t('add to box')}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ marginBottom: 2 }}>
                    {t('confirm add to box')}
                </DialogContentText>
                <TextField
                    variant="standard"
                    size="small"
                    fullWidth
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm} autoFocus>{t('add')}</Button>
                <Button onClick={onCancel}>{t('cancel')}</Button>
            </DialogActions>
        </Dialog>
    );
});

const StyledContainer = styled('div')({
    'marginTop': 'clamp(.3rem, 0.6vh, .7rem)',
    '& > button.MuiIconButton-root': {
        float: 'right',
        color: '#999',
    },
});

const StyledTabs = styled(Tabs)({
    minHeight: 'clamp(20px, 3vh, 36px)',
    marginBottom: 'clamp(.3rem, 0.6vh, .7rem)',
});
const StyledTab = styled(Tab)({
    minHeight: 'clamp(20px, 3vh, 36px)',
    padding: '6px 16px',
});

/**
 * Starts an animation to indicate that the Pokémon has been added to the box.
 * @param elm box tab element.
 */
function startAddToBoxAnimation(elm: HTMLDivElement|null) {
    if (elm === null) { return; }
    const rect = elm.getBoundingClientRect();
    const left = rect.x + window.scrollX;
    const top = rect.y + window.scrollY;
    const fromWidth = document.documentElement.clientWidth;
    const fromHeight = 400; // height of IvForm

    const div = document.createElement('div');
    div.style.position = "absolute";
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${rect.width}px`;
    div.style.height = `${rect.height}px`;
    div.style.background = "#1976d2";
    div.style.opacity = "0.6";
    div.style.transformOrigin = "top left";
    div.style.zIndex = "2";
    document.body.appendChild(div);
    const animation = div.animate([
        {transform: `translateX(${-left}px) translateY(${rect.height}px) ` +
            `scale(${fromWidth / rect.width}, ${fromHeight / rect.height})`},
        {transform: 'translateX(0) translateY(0) scale(1, 1)', opacity: 0.1}
    ], {
        duration: 200,
        easing: 'ease-out',
        iterations: 1
    });
    animation.onfinish = () => {
        document.body.removeChild(div);
    };
}

export default LowerTabHeader;
