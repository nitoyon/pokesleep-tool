import './App.css';
import React, { useEffect, useState } from 'react';
import { InputArea, InputAreaData, fields } from './InputArea';
import AboutDialog from './Dialog/AboutDialog';
import HowToDialog from './Dialog/HowToDialog';
import LanguageDialog from './Dialog/LanguageDialog';
import ScoreTableDialog from './Dialog/ScoreTableDialog';
import PreviewScore from './PreviewScore';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next'

interface AppConfig extends InputAreaData {
    /** current language */
    language: string;
    /** Whether more menu is open */
    moreMenuAnchor: HTMLElement | null;
    /** Whether about dialog is open */
    isHowToDialogOpen: boolean;
    /** Whether language dialog is open */
    isLanguageDialogOpen: boolean;
}

const theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: `"M PLUS 1p"`,
        }
    }
});

export default function App({config}: {config:AppConfig}) {
    const { t, i18n } = useTranslation();
    const [fieldIndex, setFieldIndex] = useState(config.fieldIndex);
    const [strength, setStrength] = useState(config.strength);
    const [bonus, setBonus] = useState(config.bonus);
    const [secondSleep, setSecondSleep] = useState(config.secondSleep);
    const [language, setLanguage] = useState(config.language);
    useEffect(updateHtml, [language]);

    const data:InputAreaData = {
        fieldIndex, strength, bonus, secondSleep,
    };

    function updateState(value:InputAreaData) {
        setFieldIndex(value.fieldIndex);
        setStrength(value.strength);
        setBonus(value.bonus);
        setSecondSleep(value.secondSleep);
        saveConfig({...config, ...value});
    }

    function onChange(value: InputAreaData) {
        updateState(value);
    }

    function onLanguageChange(value: string) {
        console.log("language change")
        setLanguage(value);
        i18n.changeLanguage(value);
        saveConfig({...config, language: value});
        updateHtml();
    }

    function updateHtml() {
        document.title = t("title");
        const manifest = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
        if (manifest !== null) {
            const current = manifest.href;
            manifest.href = current.replace(/manifest.*/, "manifest." + i18n.language + ".json");
        }
        const description = document.querySelector<HTMLMetaElement>("meta[name='description']");
        if (description !== null) {
            description.content = t('notice');
        }

        // update URL
        let url = document.location.href.replace(/index.*\.html/, '');
        if (!url.endsWith("/")) {
            url += "/";
        }
        if (i18n.language !== "en") {
            url += "index." + i18n.language + ".html";
        }
        window.history.replaceState(null, '', url);
    }

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
        <ThemeProvider theme={theme}>
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
            </div>
            <div className="content">
                <InputArea data={data} onChange={onChange}/>
                <div className="preview">
                    <PreviewScore count={4} data={data}/>
                    <PreviewScore count={5} data={data}/>
                    <PreviewScore count={6} data={data}/>
                    <PreviewScore count={7} data={data}/>
                    <PreviewScore count={8} data={data}/>
                </div>
            </div>
            <AboutDialog open={isAboutDialogOpen} onClose={onAboutDialogClose}/>
            <HowToDialog open={isHowToDialogOpen} onClose={onHowToDialogClose}/>
            <ScoreTableDialog open={isScoreTableDialogOpen} onClose={onScoreTableDialogClose}/>
            <LanguageDialog open={isLanguageDialogOpen}
                onClose={onLanguageDialogClose} onChange={onLanguageChange}/>
        </ThemeProvider>
    );
}

export function loadConfig(language:string): AppConfig {
    const config: AppConfig = {
        fieldIndex: 0,
        strength: 73120,
        bonus: 1,
        secondSleep: false,
        language,
        moreMenuAnchor: null,
        isHowToDialogOpen: false,
        isLanguageDialogOpen: false,
    };

    const data = localStorage.getItem("ResearchCalcPokeSleep");
    if (data === null) {
        return config;
    }
    const json = JSON.parse(data);
    if (typeof(json) !== "object") {
        return config;
    }
    if (typeof(json.fieldIndex) === "number" &&
        json.fieldIndex >= 0 && json.fieldIndex < fields.length) {
        config.fieldIndex = json.fieldIndex;
    }
    if (typeof(json.strength) === "number" && json.strength >= 0) {
        config.strength = json.strength;
    }
    if (typeof(json.bonus) === "number" &&
        [1, 1.5, 2, 2.5, 3, 4].includes(json.bonus)) {
        config.bonus = json.bonus;
    }
    if (typeof(json.secondSleep) === "boolean") {
        config.secondSleep = json.secondSleep;
    }
    if (typeof(json.language) === "string") {
        config.language = json.language;
    }
    return config;
}

function saveConfig(state:AppConfig) {
    localStorage.setItem("ResearchCalcPokeSleep", JSON.stringify(state));
}
