import i18next from 'i18next'

/**
 * Represents time of sleeping.
 */
export class AmountOfSleep {
    /** Total minutes */
    private _minutes: number;

    /** Hours */
    private _h: number;

    /** Minutes */
    private _m: number;

    /**
     * Initialize new instance.
     * @param minutes Specify the length of sleep in minutes.
     */
    constructor(minutes: number) {
        this._minutes = minutes;
        this._h = Math.floor(minutes / 60);
        this._m = Math.round(minutes % 60);
    }

    /** Get hours. */
    get h(): number {
        return this._h;
    }

    /** Get minutes. */
    get m(): number {
        return this._m;
    }

    /** Get sleep score. */
    get score(): number {
        return Math.min(100, Math.round(this._minutes / 510 * 100));
    }

    /**
     * Format the length of sleep.
     * @param t `t` object returned by `useTranslation()`.
     * @returns Formatted string.
     */
    toString(t:typeof i18next.t): string {
        const min = Math.round(this._minutes);
        return t('hhmm', {h: Math.floor(min / 60), m: this.m % 60});
    }
}

/**
 * Format frequency in seconds to a localized string.
 * @param frequency Frequency in seconds.
 * @param t `t` object returned by `useTranslation()`.
 * @returns Formatted string in HH:MM:SS format.
 */
export function frequencyToString(frequency: number, t: typeof i18next.t): string {
    const h = Math.floor(frequency / 3600);
    const m = Math.floor((frequency / 60) % 60);
    const s = Math.floor(frequency % 60);
    return t('freq hhmmss', {h, m, s});
}
