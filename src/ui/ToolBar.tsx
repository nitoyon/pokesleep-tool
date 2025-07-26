import React, { useState } from 'react';
import { styled } from '@mui/system';
import AboutDialog from './Dialog/AboutDialog';
import HowToDialog from './Dialog/HowToDialog';
import SettingsDialog from './Dialog/SettingsDialog';
import { AppConfig, AppType } from './App';
import { Divider, Icon, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import CheckIcon from '@mui/icons-material/Check';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { useTranslation } from 'react-i18next'

interface ToolBarProps {
    app: AppType;
    onAppChange: (value: AppType) => void;
    onAppConfigChange: (value: AppConfig) => void;
};

export default function ToolBar({app, onAppChange, onAppConfigChange}: ToolBarProps) {
    const { t } = useTranslation();

    const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
    const isMoreMenuOpen = Boolean(moreMenuAnchor);
    const researchCalcClick = (event: React.MouseEvent<HTMLElement>) => {
        onAppChange("ResearchCalc");
        setMoreMenuAnchor(null);
    };
    const rpCalcClick = (event: React.MouseEvent<HTMLElement>) => {
        onAppChange("IvCalc");
        setMoreMenuAnchor(null);
    };
    const moreButtonClick = (event: React.MouseEvent<HTMLElement>) => {
        setMoreMenuAnchor(event.currentTarget);
    };
    const onMoreMenuClose = () => {
        setMoreMenuAnchor(null);
    };
    const [isHowToDialogOpen, setIsHowToDialogOpen] = useState(false);
    const howToMenuClick = () => {
        setIsHowToDialogOpen(true);
        setMoreMenuAnchor(null);
    };
    const onHowToDialogClose = () => {
        setIsHowToDialogOpen(false);
    };
    const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
    const aboutMenuClick = () => {
        setIsAboutDialogOpen(true);
        setMoreMenuAnchor(null);
    };
    const onAboutDialogClose = () => {
        setIsAboutDialogOpen(false);
    };
    const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
    const languageMenuClick = () => {
        setIsLanguageDialogOpen(true);
        setMoreMenuAnchor(null);
    };
    const onLanguageDialogClose = () => {
        setIsLanguageDialogOpen(false);
    };

    return (
        <StyledAppBar>
            <div className="title">{t(`${app}.title`)}</div>
            <IconButton aria-label="actions" color="inherit" onClick={moreButtonClick}>
                <MoreIcon />
            </IconButton>
            <Menu anchorEl={moreMenuAnchor} open={isMoreMenuOpen}
                onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
                <MenuItem onClick={researchCalcClick}>
                    <ListItemIcon>{app === "ResearchCalc" ? <CheckIcon/> : <Icon/>}</ListItemIcon>
                    {t("ResearchCalc.short title")}
                </MenuItem>
                <MenuItem onClick={rpCalcClick}>
                    <ListItemIcon>{app === "IvCalc" ? <CheckIcon/> : <Icon/>}</ListItemIcon>
                    {t("IvCalc.short title")}
                </MenuItem>
                <Divider/>
                <MenuItem onClick={howToMenuClick}>
                    <ListItemIcon><HelpOutlineIcon/></ListItemIcon>
                    {t('how to use')}
                </MenuItem>
                <MenuItem onClick={aboutMenuClick}>
                    <ListItemIcon><InfoOutlinedIcon/></ListItemIcon>
                    {t('about')}
                </MenuItem>
                <MenuItem onClick={languageMenuClick}>
                    <ListItemIcon><SettingsOutlinedIcon/></ListItemIcon>
                    {t('settings')}
                </MenuItem>
            </Menu>
            <AboutDialog open={isAboutDialogOpen} onClose={onAboutDialogClose}/>
            <HowToDialog app={app} open={isHowToDialogOpen} onClose={onHowToDialogClose}/>
            <SettingsDialog open={isLanguageDialogOpen} app={app}
                onAppConfigChange={onAppConfigChange}
                onClose={onLanguageDialogClose}/>
        </StyledAppBar>
    );
}

const StyledAppBar = styled('div')({
    background: '#665500',
    color: 'white',
    padding: '.2rem .5rem',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',

    '@media all and (display-mode: standalone)': {
        background: '#002244',
    },
    '& > div.title': {
        flexGrow: 1,
    },
});
