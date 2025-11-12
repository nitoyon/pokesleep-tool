import fields from '../../data/fields';

/** Sleep tracking configuration. */
export interface TrackingData {
    /** Score to aim */
    score: number;

    /** Started time (UNIX time) */
    start: number;

    /** Area index */
    area: number;

    /** Strength when started tracking */
    strength: number;

    /** Drowsy power to aim */
    dp: number;
}

export interface InputAreaData {
    /** field index */
    fieldIndex: number;

    /** current strength */
    strength: number;

    /** event bonus (multiplier) */
    bonus: number;

    /** whether to do two sleep sessions in one day */
    secondSleep: boolean;

    /** Tracking configuration (undefined when not tracking) */
    tracking?: TrackingData;
}

export function loadConfig(): InputAreaData {
    const config: InputAreaData = {
        fieldIndex: 0,
        strength: 73120,
        bonus: 1,
        secondSleep: false,
        tracking: undefined,
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

    if (typeof(json.tracking) === "object" &&
        typeof(json.tracking.score) === "number" &&
        json.tracking.score > 0 && json.tracking.score <= 100 &&
        typeof(json.tracking.start) === "number" &&
        json.tracking.score < (new Date().getTime() / 1000) &&
        typeof(json.tracking.area) === "number" &&
        json.tracking.area >= 0 && json.tracking.area < fields.length &&
        typeof(json.tracking.strength) === "number" &&
        json.tracking.strength >= 0 &&
        typeof(json.tracking.dp) === "number" &&
        json.tracking.dp >= 0
    ) {
        config.tracking = {
            score: json.tracking.score,
            start: json.tracking.start,
            area: json.tracking.area,
            strength: json.tracking.strength,
            dp: json.tracking.dp,
        };
    }
    return config;
}

export function saveConfig(state: InputAreaData) {
    localStorage.setItem("ResearchCalcPokeSleep", JSON.stringify(state));
}
