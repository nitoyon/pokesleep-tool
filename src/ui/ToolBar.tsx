import './App.css';
import React, { useState } from 'react';
import AboutDialog from './Dialog/AboutDialog';
import HowToDialog from './Dialog/HowToDialog';
import LanguageDialog from './Dialog/LanguageDialog';
import ScoreTableDialog from './Dialog/ScoreTableDialog';
import { IconButton, Menu, MenuItem } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next'

export default function ToolBar() {
    const { t } = useTranslation();

    const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null);
    const isMoreMenuOpen = Boolean(moreMenuAnchor);
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
    const [isScoreTableDialogOpen, setIsScoreTableDialogOpen] = useState(false);
    const scoreTableMenuClick = () => {
        setIsScoreTableDialogOpen(true);
        setMoreMenuAnchor(null);
    };
    const onScoreTableDialogClose = () => {
        setIsScoreTableDialogOpen(false);
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
        <div className="appbar">
            <div className="title">{t('title')}</div>
            <IconButton aria-label="actions" color="inherit" onClick={moreButtonClick}>
                <MoreIcon />
            </IconButton>
            <Menu anchorEl={moreMenuAnchor} open={isMoreMenuOpen}
                onClose={onMoreMenuClose} anchorOrigin={{vertical: "bottom", horizontal: "left"}}>
                <MenuItem onClick={howToMenuClick}>{t('how to use')}</MenuItem>
                <MenuItem onClick={scoreTableMenuClick}>{t('sleep score table')}</MenuItem>
                <MenuItem onClick={aboutMenuClick}>{t('about')}</MenuItem>
                <MenuItem onClick={languageMenuClick}>{t('change language')}</MenuItem>
            </Menu>
            <AboutDialog open={isAboutDialogOpen} onClose={onAboutDialogClose}/>
            <HowToDialog open={isHowToDialogOpen} onClose={onHowToDialogClose}/>
            <ScoreTableDialog open={isScoreTableDialogOpen} onClose={onScoreTableDialogClose}/>
            <LanguageDialog open={isLanguageDialogOpen}
                onClose={onLanguageDialogClose}/>
        </div>
    );
}
