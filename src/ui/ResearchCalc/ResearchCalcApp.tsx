import React, { useCallback, useState } from 'react';
import { InputArea, InputAreaData } from './InputArea';
import GeneralPanel from './GeneralPanel';
import fields from '../../data/fields';

const defaultData = loadConfig();

export default function ResearchCalcApp() {
    const [data, setData] = useState(defaultData);

    const updateState = useCallback((value: Partial<InputAreaData>) => {
        const newData = {...data, ...value};
        setData(newData);
        saveConfig(newData);
    }, [data]);

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

export function loadConfig(): InputAreaData {
    const config: InputAreaData = {
        fieldIndex: 0,
        strength: 73120,
        bonus: 1,
        secondSleep: false,
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
    return config;
}

export function saveConfig(state: InputAreaData) {
    localStorage.setItem("ResearchCalcPokeSleep", JSON.stringify(state));
}
