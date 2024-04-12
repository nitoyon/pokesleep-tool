import React, { useCallback, useState } from 'react';
import { InputArea, InputAreaData } from './InputArea';
import GeneralPanel from './GeneralPanel';
import fields from '../../data/fields';

interface AppConfig extends InputAreaData {
    /** current language */
    language: string;
    /** PWA notify check counter */
    pwacnt: number,
}

export default function ResearchCalcApp({config}: {config:AppConfig}) {
    const [fieldIndex, setFieldIndex] = useState(config.fieldIndex);
    const [strength, setStrength] = useState(config.strength);
    const [bonus, setBonus] = useState(config.bonus);
    const [secondSleep, setSecondSleep] = useState(config.secondSleep);

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

    return (
        <div className="content">
            <InputArea data={data} onChange={onChange}/>
            <GeneralPanel data={data}/>
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
