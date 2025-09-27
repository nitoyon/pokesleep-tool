import './App.css';
import React from 'react';

/** Global configuration. */
export default interface AppConfig {
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
