import './App.css';
import { InputAreaData } from './ResearchCalc/InputArea';
import ResearchCalcApp, { saveConfig } from './ResearchCalc/ResearchCalcApp';
import React, { useCallback, useEffect, useState } from 'react';
import ToolBar from './ToolBar';
import PwaNotify from './PwaBanner';
import { useTranslation } from 'react-i18next'

interface AppConfig extends InputAreaData {
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
            <ResearchCalcApp config={config}/>
            <PwaNotify pwaCount={config.pwacnt} onClose={onPwaBannerClose}/>
        </>
    );
}
