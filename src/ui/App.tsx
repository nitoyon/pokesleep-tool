import './App.css';
import ResearchCalcApp from './ResearchCalc/ResearchCalcApp';
import React, { useCallback, useEffect, useState } from 'react';
import ToolBar from './ToolBar';
import PwaNotify from './PwaBanner';
import { useTranslation } from 'react-i18next'

interface AppConfig {
    /** current language */
    language: string;
    /** PWA notify check counter */
    pwacnt: number,
}

export default function App({config}: {config:AppConfig}) {
    const { t, i18n } = useTranslation();
    const [language, setLanguage] = useState(config.language);

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

    const updateHtml = useCallback(() => {
        document.title = t("title");
        const manifest = document.querySelector<HTMLLinkElement>("link[rel='manifest']");
        if (manifest !== null) {
            const current = manifest.href;
            manifest.href = current.replace(/manifest.*/, "manifest." + language + ".json");
        }
        const description = document.querySelector<HTMLMetaElement>("meta[name='description']");
        if (description !== null) {
            description.content = t('notice');
        }

        // update URL
        let url = document.location.origin +
            document.location.pathname.replace(/index.*\.html/, '');
        const query = document.location.search;
        if (!url.endsWith("/")) {
            url += "/";
        }
        if (language !== "en") {
            url += "index." + language + ".html";
        }
        window.history.replaceState(null, '', url + query);
    }, [language, t]);
    useEffect(updateHtml, [updateHtml, language, i18n, t]);

    const onPwaBannerClose = useCallback(() => {
        config.pwacnt = 0;
        saveConfig(config);
    }, [config]);

    return (
        <>
            <ToolBar/>
            <ResearchCalcApp/>
            <PwaNotify pwaCount={config.pwacnt} onClose={onPwaBannerClose}/>
        </>
    );
}

export function loadConfig(language:string): AppConfig {
    const config: AppConfig = {
        language,
        pwacnt: -1,
    };

    const data = localStorage.getItem("PokeSleepTool");
    if (data === null) {
        return config;
    }
    const json = JSON.parse(data);
    if (typeof(json) !== "object" || json == null) {
        return config;
    }
    if (typeof(json.language) === "string") {
        config.language = json.language;
    }
    if (typeof(json.pwacnt) == "number") {
        config.pwacnt = json.pwacnt;
    }
    return config;
}

export function saveConfig(state:AppConfig) {
    localStorage.setItem("PokeSleepTool", JSON.stringify(state));
}
