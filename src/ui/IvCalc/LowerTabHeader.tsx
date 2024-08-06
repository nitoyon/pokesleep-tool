import React from 'react';
import { styled } from '@mui/system';
import { IvAction } from './IvState';
import { Divider, IconButton, ListItemIcon, Menu, MenuItem, MenuList,
    Tab, Tabs
 } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import IosShareIcon from '@mui/icons-material/IosShare';
import MoreIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';

const LowerTabHeader = React.memo(({
    upperTabIndex, tabIndex, isBoxEmpty, dispatch, onShare,
}: {
    upperTabIndex: number,
    tabIndex: number,
    isBoxEmpty: boolean,
    dispatch: (action: IvAction) => void,
    onShare: () => void,
}) => {
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const { t } = useTranslation();

    const isIvMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 0;
    const isBoxMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 1;
    const boxTabRef = React.useRef<HTMLDivElement | null>(null);

    const onMenuItemClickHandler = React.useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        setMoreMenuAnchor(null);

        const type = e.currentTarget.getAttribute('data-value') || "";
        dispatch({type} as IvAction);
        if (type === "addThis") {
            startAddToBoxAnimation(boxTabRef.current);
        }
    }, [dispatch]);

    const onShareHandler = React.useCallback(() => {
        setMoreMenuAnchor(null);
        onShare();
    }, [onShare]);

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
    </StyledContainer>);
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
    animation.onfinish = (e: any) => {
        document.body.removeChild(div);
    };
}

export default LowerTabHeader;
