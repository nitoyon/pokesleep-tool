import './App.css';
import React, { useCallback, useEffect, useState } from 'react';
import { InputArea, InputAreaData, fields } from './InputArea';
import BetterSecondSleepDialog, { BetterSecondSleepData } from './Dialog/BetterSecondSleepDialog';
import PreviewScore from './PreviewScore';
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
    const [fieldIndex, setFieldIndex] = useState(config.fieldIndex);
    const [strength, setStrength] = useState(config.strength);
    const [bonus, setBonus] = useState(config.bonus);
    const [secondSleep, setSecondSleep] = useState(config.secondSleep);
    const [language, setLanguage] = useState(config.language);

    const data:InputAreaData = {
        fieldIndex, strength, bonus, secondSleep,
    };

    const updateState = useCallback((value: Partial<InputAreaData>) => {
        if (value.fieldIndex !== undefined) {
            setFieldIndex(value.fieldIndex);
        }
        if (value.strength !== undefined) {
            setStrength(value.strength);
        }
        if (value.bonus !== undefined) {
            setBonus(value.bonus);
        }
        if (value.secondSleep !== undefined) {
            setSecondSleep(value.secondSleep);
        }
        saveConfig({...config, ...value});
    }, [config]);

    const onChange = useCallback((value: Partial<InputAreaData>) => {
        updateState(value);
    }, [updateState]);

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

    const [isBetterSecondSleepDialogOpen, setBetterSecondSleepOpen] = useState(false);
    const onBetterSecondSleepDialogClose = () => {
        setBetterSecondSleepOpen(false);
    };

    const [betterSecondSleepData, setBetterSecondSleepData] = useState<BetterSecondSleepData>({
        first: {count: 0, score: 0, strength: 0},
        second: {count: 0, score: 0, strength: 0},
    });
    function onSecondSleepDetailClick(data:BetterSecondSleepData) {
        setBetterSecondSleepData(data);
        setBetterSecondSleepOpen(true);
    }

    const onPwaBannerClose = useCallback(() => {
        config.pwacnt = 0;
        saveConfig(config);
    }, [config]);

    return (
        <div className="content">
            <InputArea data={data} onChange={onChange}/>
            <div className="preview">
                <PreviewScore count={4} data={data} onSecondSleepDetailClick={onSecondSleepDetailClick}/>
                <PreviewScore count={5} data={data} onSecondSleepDetailClick={onSecondSleepDetailClick}/>
                <PreviewScore count={6} data={data} onSecondSleepDetailClick={onSecondSleepDetailClick}/>
                <PreviewScore count={7} data={data} onSecondSleepDetailClick={onSecondSleepDetailClick}/>
                <PreviewScore count={8} data={data} onSecondSleepDetailClick={onSecondSleepDetailClick}/>
            </div>
            <PwaNotify pwaCount={config.pwacnt} onClose={onPwaBannerClose}/>
            <BetterSecondSleepDialog data={betterSecondSleepData}
                open={isBetterSecondSleepDialogOpen} onClose={onBetterSecondSleepDialogClose}/>
        </div>
    );
}

export function loadConfig(language:string): AppConfig {
    const config: AppConfig = {
        fieldIndex: 0,
        strength: 73120,
        bonus: 1,
        secondSleep: false,
        language,
        pwacnt: -1,
    };

    const data = localStorage.getItem("ResearchCalcPokeSleep");
    if (data === null) {
        return config;
    }
    const json = JSON.parse(data);
    if (typeof(json) !== "object" || json == null) {
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
    if (typeof(json.pwacnt) == "number") {
        config.pwacnt = json.pwacnt;
    }
    return config;
}

export function saveConfig(state:AppConfig) {
    localStorage.setItem("ResearchCalcPokeSleep", JSON.stringify(state));
}
