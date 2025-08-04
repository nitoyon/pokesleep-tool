import './App.css';
import ResearchCalcApp from './ResearchCalc/ResearchCalcApp';
import IvCalcApp from './IvCalc/IvCalcApp';
import React, { useCallback, useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import ToolBar from './ToolBar';
import NewsInfo from './NewsInfo';
import PwaNotify from './PwaBanner';
import { useTranslation } from 'react-i18next'

const defaultTheme = createTheme({
    typography: {
        allVariants: {
            fontFamily: `"M PLUS 1p"`,
        }
    }
});

const tcTheme = createTheme({
    typography: {
        allVariants: {
            fontFamily: `"Noto Sans TC"`,
        }
    }
});

const scTheme = createTheme({
    typography: {
        allVariants: {
            fontFamily: `"Noto Sans SC"`,
        }
    }
});

/** Global configuration. */
export interface AppConfig {
    /** Custom icon URL */
    iconUrl: string|null;
    /** current language */
    language: string;
    /** PWA notify check counter */
    pwacnt: number,
    /** Last news closed */
    news: {
        ResearchCalc: string,
        IvCalc: string,
    },
}

export type AppType = "ResearchCalc" | "IvCalc";

export const AppConfigContext = React.createContext<AppConfig>({
    iconUrl: null, language: "", pwacnt: 0,
    news: {ResearchCalc: "", IvCalc: ""}});

export default function App({config}: {config:AppConfig}) {
    const language = useMultilingual(config);
    const [curApp, setCurApp] = useRouter(language);
    const [appConfig, setAppConfig] = useState(config);

    const onAppChange = useCallback((value: AppType) => {
        setCurApp(value);
    }, [setCurApp]);
    const onAppConfigChange = useCallback((value: AppConfig) => {
        saveConfig(value);
        setAppConfig(value);
    }, [setAppConfig]);

    const onPwaBannerClose = useCallback(() => {
        appConfig.pwacnt = 0;
        saveConfig(appConfig);
        setAppConfig(appConfig);
    }, [appConfig, setAppConfig]);

    // Set theme based on language
    let theme = defaultTheme;
    if (language === "zh-TW") {
        theme = tcTheme;
    } else if (language === "zh-CN") {
        theme = scTheme;
    }

    return (<ThemeProvider theme={theme}>
        <AppConfigContext.Provider value={appConfig}>
            <ToolBar app={curApp} onAppChange={onAppChange}
                onAppConfigChange={onAppConfigChange}/>
            <NewsInfo appType={curApp} onAppConfigChange={onAppConfigChange}/>
            {curApp === "ResearchCalc" && <ResearchCalcApp/>}
            {curApp === "IvCalc" && <IvCalcApp/>}
            <PwaNotify app={curApp} pwaCount={config.pwacnt} onClose={onPwaBannerClose}/>
        </AppConfigContext.Provider>
    </ThemeProvider>);
}

/**
 * A custom react hook for managing multilingual support.
 * @param config The global configuration object.
 * @return Current language.
 */
function useMultilingual(config: AppConfig) {
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(config.language);

    // Called when the language has been changed
    const onLanguageChanged = useCallback((value:string) => {
        setLanguage(value);
        saveConfig({...config, language: value});
    }, [config, setLanguage]);

    useEffect(() => {
        i18n.on("languageChanged", onLanguageChanged);
        return () => {
            i18n.off("languageChanged", onLanguageChanged);
        };
    }, [i18n, onLanguageChanged]);

    return language;
}

/**
 * A custom react hook for managing URL.
 * @param language Current language.
 * @return Current app type and setter for it.
 */
function useRouter(language: string): [AppType, (v:AppType) => void] {
    let initialApp: AppType = (
        window.location.pathname.startsWith("/pokesleep-tool/iv/") ?
        "IvCalc" : "ResearchCalc");

    const { t, i18n } = useTranslation();
    const [currentApp, setCurrentApp] = useState<AppType>(initialApp);
    useEffect(() => {
        // Replace on memory HTML
        document.title = t(`${currentApp}.title`);
        const manifest = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
        if (manifest !== null) {
            const current = manifest.href;
            manifest.href = current.replace(/manifest.*/, "manifest." + language + ".json");
        }
        const description = document.querySelector<HTMLMetaElement>("meta[name='description']");
        if (description !== null) {
            description.content = t(`${currentApp}.description`);
        }
        const html = document.querySelector<HTMLHtmlElement>("html");
        if (html !== null) {
            html.lang = language.toLowerCase();
        }
        const webFont = document.querySelector<HTMLLinkElement>("link[rel='stylesheet'][href*='https']");
        if (webFont !== null) {
            if (language === "zh-TW") {
                webFont.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+TC&display=swap";
            } else if (language === "zh-CN") {
                webFont.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap";
            } else {
                webFont.href = "https://fonts.googleapis.com/css2?family=M+PLUS+1p&display=swap";
            }
        }

        // update URL
        let url = document.location.origin + "/pokesleep-tool/";
        if (currentApp === "IvCalc") {
            url += 'iv/';
        }
        if (language !== "en") {
            url += `index.${language.toLowerCase()}.html`;
        }
        const query = document.location.search + document.location.hash;
        window.history.replaceState(null, '', url + query);
    }, [language, i18n, t, currentApp]);
    return [currentApp, setCurrentApp];
}

export function loadConfig(language:string): AppConfig {
    const config: AppConfig = {
        iconUrl: null,
        language,
        pwacnt: -1,
        news: {ResearchCalc: "", IvCalc: ""},
    };

    const data = localStorage.getItem("PokeSleepTool");
    if (data === null) {
        return config;
    }
    const json = JSON.parse(data);
    if (typeof(json) !== "object" || json == null) {
        return config;
    }
    if (typeof(json.iconUrl) === "string" &&
        json.iconUrl.match(/@ID[1-4]?@/)) {
        config.iconUrl = json.iconUrl;
    }
    if (typeof(json.language) === "string") {
        config.language = json.language;
    }
    if (typeof(json.pwacnt) == "number") {
        config.pwacnt = json.pwacnt;
    }
    if (typeof(json.news) === "object") {
        if (typeof(json.news.ResearchCalc) === "string") {
            config.news.ResearchCalc = json.news.ResearchCalc;
        }
        if (typeof(json.news.IvCalc) === "string") {
            config.news.IvCalc = json.news.IvCalc;
        }
    }
    return config;
}

export function saveConfig(state:AppConfig) {
    localStorage.setItem("PokeSleepTool", JSON.stringify(state));
}
