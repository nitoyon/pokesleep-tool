import React from 'react';
import { styled } from '@mui/system';
import { StyledTab, StyledTabs } from './IvCalcApp';
import { IconButton, ListItemIcon, Menu, MenuItem, MenuList }  from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MoreIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';

const LowerTabHeader = React.memo(({
    upperTabIndex, tabIndex, isBoxEmpty, onChange, onMenuItemClick,
}: {
    upperTabIndex: number,
    tabIndex: number,
    isBoxEmpty: boolean,
    onChange: (value: number) => void,
    onMenuItemClick: (value: string) => void,
}) => {
    const [moreMenuAnchor, setMoreMenuAnchor] = React.useState<HTMLElement | null>(null);
    const { t } = useTranslation();

    const isIvMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 0;
    const isBoxMenuOpen = Boolean(moreMenuAnchor) && tabIndex === 1;
    const boxTabRef = React.useRef<HTMLDivElement | null>(null);

    const onMenuItemClickHandler = React.useCallback((e: React.MouseEvent<HTMLLIElement>) => {
        setMoreMenuAnchor(null);

        const val = e.currentTarget.getAttribute('data-value') || "";
        onMenuItemClick(val);
        if (val === "addThis") {
            startAddToBoxAnimation(boxTabRef.current);
        }
    }, [onMenuItemClick]);

    const onTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
        onChange(newValue);
        setMoreMenuAnchor(null);
    }, [onChange]);
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
            </MenuList>
        </Menu>
    </StyledContainer>);
});

const StyledContainer = styled('div')({
    'marginTop': '0.8rem',
    paddingBottom: '0.1rem',
    '& > button.MuiIconButton-root': {
        float: 'right',
        color: '#999',
    },
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
