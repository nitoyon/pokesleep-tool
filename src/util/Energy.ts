import { BonusEffects, emptyBonusEffects } from '../data/events';
import { PokemonType } from '../data/pokemons';
import PokemonIv from './PokemonIv';
import { ExpertEffects } from './PokemonStrength';
import { HelpEventBonus } from '../data/events';

/** Efficiency list */
type EfficiencyList = 2.222 | 1.923 | 1.724 | 1.515 | 1.0;

/** Frequency rate (1 / efficiency) */
type FrequencyRate = 0.45 | 0.52 | 0.58 | 0.66 | 1;

/** Represents the period value for "whistle" calculations in EnergyParameter. */
export const whistlePeriod = 0;

/** Tap frequency constants */
export const AlwaysTap = 1;  // Special value: Tap continuously (collect immediately)
export const NoTap = 0;      // Special value: Never tap during this period

/** Tap frequency in minutes (2-1440), or AlwaysTap (1), or NoTap (0) */
export type TapFrequency = number;

/**
 * Validates if a value is a valid TapFrequency.
 * @param value Value to validate
 * @returns True if valid TapFrequency
 */
export function isValidTapFrequency(value: unknown): value is TapFrequency {
    return typeof value === 'number' && (
        value === AlwaysTap || value === NoTap ||
        (value >= 2 && value <= 1440 && Number.isInteger(value))
    );
}

export interface EnergyParameter {
    /**
     * How many hours' worth of accumulated strength to calculate.
     *
     * 0: whistle, 24: one day, 168: one week
     */
    period: number;

    /** Index of the current research area */
    fieldIndex: number;

    /** Snorlax's favorite berry on Greengrass Isle */
    favoriteType: PokemonType[];

    /**
     * Effect in expert mode.
     */
    expertEffect: ExpertEffects;

    /**
     * Energy restored by 'energy for all' main skill.
     */
    e4eEnergy: number;

    /**
     * Triggered count of 'Energy for all' main skill.
     */
    e4eCount: number;

    /**
     * The number of other pokemon in the team that have
     * the Helping Bonus sub-skill.
     */
    helpBonusCount: 0|1|2|3|4;

    /**
     * The number of other pokemon in the team that have
     * Recovery Bonus sub-skill.
     */
    recoveryBonusCount: 0|1|2|3|4;

    /**
     * If true, we assume that energy is always 100.
     */
    isEnergyAlwaysFull: boolean;

    /**
     * Sleep score of the sleep.
     */
    sleepScore: number;

    /** How often tap the pokemon (awake) - in minutes, or AlwaysTap (1), or NoTap (0) */
    tapFrequencyAwake: TapFrequency;

    /** How often tap the pokemon (asleep) - in minutes, or AlwaysTap (1), or NoTap (0) */
    tapFrequencyAsleep: TapFrequency;

    /** Whether good camp ticket is set or not */
    isGoodCampTicketSet: boolean;

    /**
     * Event option.
     */
    event: string;

    /**
     * Custom event bonus.
     */
    customEventBonus: HelpEventBonus;

    /** Calculate with pity proc guarantee */
    pityProc: boolean;
}

type EnergyEvent = {
    /** Elapsed minutes since waking up */
    minutes: number;
    /** Event type */
    type: "sleep"|"wake"|"cook"|"e4e"|"empty"|"snack";
    /** Energy before the event occurs */
    energyBefore: number;
    /** Energy after the event occurs */
    energyAfter: number;
    /** Sneaky Snacking or not */
    isSnacking: boolean;
    /** 
     * Indicates whether the period condition is met.
     * Set to false when period < 24 and (minutes * 60) < period.
     */
    isInPeriod: boolean;
}

/** Efficiency event. */
export type EfficiencyEvent = {
    /** Start minutes since wake up */
    start: number;
    /** End minutes since wake up. */
    end: number;
    /** Efficiency rating */
    efficiency: EfficiencyList;
    /** Frequency rate (1 / efficiency) */
    frequencyRate: FrequencyRate;
    /** Whether is awake or not */
    isAwake: boolean;
    /** Sneaky Snacking or not */
    isSnacking: boolean;
    /** 
     * Indicates whether the period condition is met.
     * Set to false when period < 24 and (minutes * 60) < period.
     */
    isInPeriod: boolean;
}

/** Result object for calculation. */
export type EnergyResult = {
    /** The time when going to bed. */
    sleepTime: number,
    /** Recovery event list */
    events: EnergyEvent[],
    /** Efficiency event list */
    efficiencies: EfficiencyEvent[],
    /** Whether to show skill stock result
     * (awake tap frequency != none && asleep tap frequency == none) */
    showSkillStock: boolean,
    /** Average efficiency */
    averageEfficiency: {
        /** Total efficiency */
        total: number,
        /** Awake efficiency */
        awake: number,
        /** Alleep efficiency */
        asleep: number,
    },
}

class Energy {
    private _iv: PokemonIv;
    private _wakeMax: 100|105;

    /**
     * Initialize Energy instance.
     * @param iv Pokemon IV data.
     */
    constructor(iv: PokemonIv) {
        this._iv = iv;
        this._wakeMax = iv.activeSubSkills
            .some(x => x.name === 'Energy Recovery Bonus') ? 105 : 100;
    }

    /**
     * Calculate energy efficiency, help count, and return an EnergyResult.
     * @param param Parameters for energy calculation.
     * @param bonus Bonus effects for the Pokémon and StrengthParameter.
     * @returns Calculation result (EnergyResult).
     */
    calculate(param: EnergyParameter,
        bonus: Readonly<BonusEffects> = emptyBonusEffects
    ): EnergyResult {
        // return empty EnergyResult when param.period is negative.
        if (param.period < 0) {
            return {
                sleepTime: 0, events: [], efficiencies: [],
                showSkillStock: false,
                averageEfficiency: { total: 0, awake: 0, asleep: 0 },
            };
        }

        const sleepMinutes = param.sleepScore * 510 / 100;
        const recoveryFactor = this._iv.nature.energyRecoveryFactor;
        const sleepRecovery = Math.min(this._wakeMax, Math.round(sleepMinutes / 510 * 100) * recoveryFactor *
            (1 + 0.14 * param.recoveryBonusCount));
        const myRestoreEnergy = param.e4eEnergy * recoveryFactor;
        const sleepTime = 1440 - sleepMinutes;

        let events: EnergyEvent[];
        let efficiencies: EfficiencyEvent[];
        if (param.isEnergyAlwaysFull) {
            events = [
                {minutes: 0, type: 'wake', energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true },
                {minutes: sleepTime, type: 'sleep', energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true },
                {minutes: 1440, type: 'wake', energyBefore: 100, energyAfter: 100, isSnacking: false, isInPeriod: true },
            ];
            efficiencies = [
                {start: 0, end: sleepTime, isAwake: true, efficiency: 2.222, frequencyRate: 0.45, isSnacking: false, isInPeriod: true},
                {start: sleepTime, end: 1440, isAwake: false, efficiency: 2.222, frequencyRate: 0.45, isSnacking: false, isInPeriod: true},
            ];
        }
        else {
            events = this.createEvents(param.e4eCount, sleepTime);

            // 1st calculation to know the initialEnergy
            this.calculateEnergyForEvents(events, myRestoreEnergy, sleepRecovery,
                sleepRecovery, bonus.energyFromDish);
            const initialEnergy = events[events.length - 1].energyAfter;

            // 2nd calculation using initialEnergy
            this.calculateEnergyForEvents(events, myRestoreEnergy, sleepRecovery,
                initialEnergy, bonus.energyFromDish);
            this.addEmptyEvent(events);

            // calculate efficiency
            efficiencies = this.calculateEfficiency(events, sleepTime);
        }

        // Split events and efficiencies, if period < 24
        if (param.period < 24) {
            this.splitEventAndEfficiencyByPeriod(events, efficiencies, param);
        }

        // calculate average efficiency
        const total = this.calculateAverageEfficiency(efficiencies
            .filter(x => x.isInPeriod));
        const awake = this.calculateAverageEfficiency(efficiencies
            .filter(x => x.isInPeriod && x.isAwake));
        const asleep = this.calculateAverageEfficiency(efficiencies
            .filter(x => x.isInPeriod && !x.isAwake));

        // calculate Sneaky Snacking
        const showSkillStock = (param.tapFrequencyAwake !== NoTap &&
            param.tapFrequencyAsleep === NoTap);

        return {sleepTime, events, efficiencies, showSkillStock,
            averageEfficiency: { total, awake, asleep },
        };
    }

    /**
     * Create recovery events (energyBefore and energyAfter is filled with -1).
     * @param e4eCount The number of times the 'Energy for everyone' skill is triggered.
     * @param sleepTime The time when going to bed.
     * @returns Event list.
     */
    createEvents(e4eCount: number, sleepTime: number): EnergyEvent[] {
        // Assumptions:
        // * Sleep at 23:30., wake up at 8:00.
        // * Cook at 10:00, 14:00, and 20:00.
        // * Restore occurs every (15.5 / (e4eCount + 1)) hours
        const events: EnergyEvent[] = [
            // 8:00
            {minutes: 0, type: 'wake', energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            // 10:00
            {minutes: 120, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            // 14:00
            {minutes: 360, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
            // 20:00
            {minutes: 720, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true },
        ];
        for (let i = 0; i < e4eCount; i++) {
            events.push({
                minutes: Math.floor((i + 1) * 930 / (e4eCount + 1) / 10) * 10,
                type: 'e4e',
                energyBefore: -1, energyAfter: -1,
                isSnacking: false,
                isInPeriod: true,
            });
        }
        events.push({
            minutes: sleepTime, type: 'sleep',
            energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true,
        });
        events.push({
            minutes: 1440, type: 'wake',
            energyBefore: -1, energyAfter: -1, isSnacking: false, isInPeriod: true,
        });
        return events.sort((a, b) => a.minutes - b.minutes);
    }

    /**
     * Calculate energy for every events.
     * @param events Event to be calculated.
     * @param myRestoreEnergy The amount of energy to be restored by e4e.
     * @param sleepRecovery Energy recovery by sleep.
     * @param initialEnergy Energy value after waking up.
     * @param energyFromDishBonus: Energy recovery bonus by dish.
     */
    calculateEnergyForEvents(events: EnergyEvent[], myRestoreEnergy: number,
        sleepRecovery: number, initialEnergy: number, energyFromDishBonus: number
    ) {
        events[0].energyAfter = initialEnergy;
        for (let i = 1; i < events.length; i++) {
            const prevEvent = events[i - 1];
            const curEvent = events[i];
            const energyConsumed = (curEvent.minutes - prevEvent.minutes) / 10;

            curEvent.energyBefore = Math.max(0, prevEvent.energyAfter - energyConsumed);
            curEvent.energyAfter = curEvent.energyBefore;
            if (curEvent.type === 'cook') {
                curEvent.energyAfter +=
                    this.getEnergyRecoveryForCook(curEvent.energyBefore) + energyFromDishBonus;
            }
            else if (curEvent.type === 'e4e') {
                curEvent.energyAfter = Math.min(150, curEvent.energyAfter + myRestoreEnergy);
            }
            else if (curEvent.type === 'wake') {
                curEvent.energyAfter = Math.min(this._wakeMax, curEvent.energyAfter + sleepRecovery);
            }
            else if (curEvent.type === 'sleep') {
                curEvent.energyAfter = curEvent.energyBefore;
                continue;
            }
            else if (curEvent.type === 'empty') {
                continue;
            }
            else {
                throw new Error(`unknown event type: ${curEvent.type}`);
            }

            // energy is ceiled when it raises up
            curEvent.energyAfter = Math.ceil(curEvent.energyAfter);
        }
        events[0].energyBefore = events[events.length - 1].energyBefore;
    }

    /**
     * Add empty event if energy becomes 0 between two events.
     * @param events Event to be calculated.
     */
    addEmptyEvent(events: EnergyEvent[]) {
        for (let i = 1; i < events.length; i++) {
            const prevEvent = events[i - 1];
            const curEvent = events[i];
            const energyConsumed = (curEvent.minutes - prevEvent.minutes) / 10;

            // if energy becomes empty, add empty event
            if (prevEvent.energyAfter > 0 && prevEvent.energyAfter < energyConsumed) {
                const minutes = prevEvent.minutes + prevEvent.energyAfter * 10;
                events.splice(i, 0, {minutes, type: 'empty',
                    energyBefore: 0, energyAfter: 0,
                    isSnacking: false, isInPeriod: true});
                continue;
            }
        }
    }

    /**
     * Calculate efficiency time table.
     * @param events Event list.
     * @param sleepTime The time when going to bed.
     * @returns Efficiency time table.
     */
    calculateEfficiency(events: EnergyEvent[],
        sleepTime: number
    ): EfficiencyEvent[] {
        // Calculate efficiency
        const ret: EfficiencyEvent[] = [];
        for (let i = 1; i < events.length; i++) {
            const prevEnergy = events[i - 1].energyAfter;
            const prevMinutes = events[i - 1].minutes;
            const curMinutes = events[i].minutes;

            let energy = prevEnergy;
            let start = prevMinutes;
            while (true) {
                if (energy <= 1) {
                    energy = 0;
                    break;
                }

                const threshold = energy <= 40 ? 1 :
                    energy % 20 === 0 ? energy - 20 :
                    Math.floor(energy / 20) * 20;
                const end = start + (energy - threshold) * 10;
                if (end > curMinutes) {
                    break;
                }
                ret.push({
                    start, end,
                    efficiency: getEfficiencyByEnergy(energy),
                    frequencyRate: getFrequencyRateByEnergy(energy),
                    isAwake: true, isSnacking: false, isInPeriod: true,
                });

                energy = threshold;
                start = end;
            }
            ret.push({
                start, end: curMinutes,
                efficiency: getEfficiencyByEnergy(energy),
                frequencyRate: getFrequencyRateByEnergy(energy),
                isAwake: true, isSnacking: false, isInPeriod: true,
            });
        }

        // merge efficiency
        for (let i = 0; i < ret.length - 1; i++) {
            if (ret[i].efficiency === ret[i + 1].efficiency) {
                ret[i].end = ret[i + 1].end;
                ret.splice(i + 1, 1);
                i--;
            }
        }

        // split by isAwake
        for (let i = 0; i < ret.length; i++) {
            if (ret[i].end <= sleepTime) {
                ret[i].isAwake = true;
                continue;
            }
            if (ret[i].start >= sleepTime) {
                ret[i].isAwake = false;
                continue;
            }

            // split into two efficiency object
            const copied = {...ret[i]};
            ret[i].end = sleepTime;
            ret[i].isAwake = true;
            copied.start = sleepTime;
            copied.isAwake = false;
            ret.splice(i + 1, 0, copied);
        }

        return ret;
    }

    /**
     * Splits energy events and efficiency events based on the specified period,
     * and sets the isInPeriod flag for each entry accordingly.
     *
     * @param events Array of energy events. If an event's minutes are less than
     *               period * 60, it is marked as in-period (isInPeriod = true).
     *               Inserts an empty event to split the timeline when crossing
     *               the threshold.
     * @param efficiencies Array of efficiency events. If an event spans across the
     *                     threshold,  it is split into two entries.
     * @param period EnergyParameter which has period and isEnergyAlwaysFull.
     */
    splitEventAndEfficiencyByPeriod(events: EnergyEvent[],
        efficiencies: EfficiencyEvent[], param: EnergyParameter
    ): void {
        const threshold = param.period * 60;

        // split events
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const nextEvent = events[i + 1] ?? event;
            if (event.minutes < threshold) {
                event.isInPeriod = true;
                if (nextEvent.minutes < threshold) {
                    continue;
                }
            }
            else if (event.minutes >= threshold) {
                event.isInPeriod = false;
                continue
            }

            // insert empty event object
            const energy = param.isEnergyAlwaysFull ? event.energyAfter :
                Math.max(0, event.energyAfter - (threshold - event.minutes) / 10);
            events.splice(i + 1, 0, {
                minutes: threshold, type: 'empty',
                energyBefore: energy,
                energyAfter: energy,
                isSnacking: event.isSnacking,
                isInPeriod: false,
            });
        }

        // split efficiencies
        for (let i = 0; i < efficiencies.length; i++) {
            const efficiency = efficiencies[i];
            if (efficiency.start >= threshold) {
                efficiency.isInPeriod = false;
                continue;
            }
            if (efficiency.end < threshold) {
                efficiency.isInPeriod = true;
                continue;
            }

            // split into two efficiency object
            const copied = {...efficiency};
            efficiency.end = threshold;
            efficiency.isInPeriod = true;
            copied.start = threshold;
            copied.isInPeriod = false;
            efficiencies.splice(i + 1, 0, copied);
        }
    }

    calculateAverageEfficiency(efficiency: EfficiencyEvent[]): number {
        let total = 0;
        let time = 0;
        for (const e of efficiency) {
            const duration = e.end - e.start;
            total += e.efficiency * duration;
            time += duration;
        }
        if (time === 0) {
            return 1;
        }
        return Math.round(total / time * 1000) / 1000;
    }

    getEnergyRecoveryForCook(energy: number) {
        if (energy > 80) { return 1; }
        if (energy > 60) { return 2; }
        if (energy > 40) { return 3; }
        if (energy > 20) { return 4; }
        return 5;
    }

}

export function getEfficiencyByEnergy(energy: number): EfficiencyList {
    if (energy > 80) { return 2.222; }
    if (energy > 60) { return 1.923; }
    if (energy > 40) { return 1.724; }
    if (energy > 1) { return 1.515; }
    return 1;
}

export function getFrequencyRateByEnergy(energy: number): FrequencyRate {
    if (energy > 80) { return 0.45; }
    if (energy > 60) { return 0.52; }
    if (energy > 40) { return 0.58; }
    if (energy > 1) { return 0.66; }
    return 1;
}

export default Energy;
