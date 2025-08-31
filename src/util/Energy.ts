import { BonusEffects, emptyBonusEffects } from '../data/events';
import { isExpertField } from '../data/fields';
import { PokemonType } from '../data/pokemons';
import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';
import {
    ExpertEffects,
    expertMainBerrySpeedBonus, expertNonFavoriteBerrySpeedPenalty,
 } from './PokemonStrength';
import { HelpEventBonus } from '../data/events';

/** Efficiency list */
type EfficiencyList = 2.222 | 1.923 | 1.724 | 1.515 | 1.0;

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

    /** How often tap the pokemon (awake) */
    tapFrequency: "always"|"none";

    /** How often tap the pokemon (asleep) */
    tapFrequencyAsleep: "always"|"none";

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
type EfficiencyEvent = {
    /** Start minutes since wake up */
    start: number;
    /** End minutes since wake up. */
    end: number;
    /** Efficiency rating */
    efficiency: EfficiencyList;
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
    sleepTime: number;
    /** Recovery event list */
    events: EnergyEvent[];
    /** Efficiency event list */
    efficiencies: EfficiencyEvent[];
    /** Whether inventory can be full
     * (awake tap frequency == always && asleep tap frequency == none) */
    canBeFullInventory: boolean;
    /** Sleep time required to fulfill inventory. -1 when not fulfilled. */
    timeToFullInventory: number,
    /** Skill% after wakeup */
    skillProbabilityAfterWakeup: {
        /** Skill triggered once% after wakeup */
        once: number,
        /** Skill triggered twice% after wakeup.
         * Always 0 if specialty is not skill.
         */
        twice: number,
    },
    /** Carry limit */
    carryLimit: number,
    /** Skill ratio */
    skillRatio: number,
    /** Help count */
    helpCount: {
        /** Help count while awake */
        awake: number,
        /** Help count while asleep (before inventory full) */
        asleepNotFull: number,
        /** Help count while asleep (after inventory full) */
        asleepFull: number,
    },
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
     * @param isWhistle Whether whistle is used or not.
     * @returns Calculation result (EnergyResult).
     */
    calculate(param: EnergyParameter,
        bonus: Readonly<BonusEffects> = emptyBonusEffects,
        isWhistle: boolean = false
    ): EnergyResult {
        // return empty EnergyResult when param.period is negative.
        if (param.period < 0) {
            return {
                sleepTime: 0, events: [], efficiencies: [],
                canBeFullInventory: false, timeToFullInventory: -1,
                skillProbabilityAfterWakeup: { once: 0, twice: 0 },
                carryLimit: Math.ceil(this._iv.carryLimit * (param.isGoodCampTicketSet ? 1.2 : 1)),
                skillRatio: 0,
                helpCount: { awake: 0, asleepNotFull: 0, asleepFull: 0 },
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
                {start: 0, end: sleepTime, isAwake: true, efficiency: 2.222, isSnacking: false, isInPeriod: true},
                {start: sleepTime, end: 1440, isAwake: false, efficiency: 2.222, isSnacking: false, isInPeriod: true},
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
        const {carryLimit, skillRatio, timeToFullInventory,
            helpCount, skillProbabilityAfterWakeup } =
            this.calculateSneakySnacking(events, efficiencies, param, bonus, isWhistle);
        const canBeFullInventory = (param.tapFrequency === "always" &&
            param.tapFrequencyAsleep === "none");

        return {sleepTime, events, efficiencies, canBeFullInventory,
            timeToFullInventory, carryLimit, skillRatio,
            helpCount, skillProbabilityAfterWakeup,
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
        let events: EnergyEvent[] = [
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
                    efficiency: this.getEfficiencyByEnergy(energy),
                    isAwake: true, isSnacking: false, isInPeriod: true,
                });

                energy = threshold;
                start = end;
            }
            ret.push({
                start, end: curMinutes,
                efficiency: this.getEfficiencyByEnergy(energy),
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

    /**
     * Calculate sneaky snacking and returns help count while sleeping.
     * @param events Events.
     * @param efficiencies Efficiencies.
     * @param param Parameters for energy calculation.
     * @param bonus Bonus effects for the Pokémon and StrengthParameter.
     * @return Help count and time to full inverntory.
     */
    calculateSneakySnacking(events: EnergyEvent[], efficiencies: EfficiencyEvent[],
        param: EnergyParameter, bonus: BonusEffects, isWhistle: boolean):
    {
        carryLimit: number,
        skillRatio: number,
        timeToFullInventory: number,
        skillProbabilityAfterWakeup: {
            once: number,
            twice: number,
        },
        helpCount: {
            total: number,
            awake: number,
            asleepNotFull: number,
            asleepFull: number,
        },
    } {
        if (this._iv.pokemon.frequency === 0) {
            return {
                carryLimit: this._iv.pokemon.carryLimit,
                skillRatio: 0,
                timeToFullInventory: -1,
                skillProbabilityAfterWakeup: { once: 0, twice: 0 },
                helpCount: {
                    total: 0, awake: 0, asleepNotFull: 0, asleepFull: 0
                }
            };
        }

        const isEnergyAlwaysFull = param.isEnergyAlwaysFull;
        const helpBonusCount = param.helpBonusCount +
            (this._iv.hasHelpingBonusInActiveSubSkills ? 1 : 0);
        const isGoodCampTicketSet = param.isGoodCampTicketSet;
        const alwaysSnacking = param.tapFrequency === "none";
        const alwaysTapAsleep = param.tapFrequencyAsleep === "always";

        // check if the field is expert mode
        const isExpertMode = isExpertField(param.fieldIndex) && !isWhistle;
        const isMainBerry = isExpertMode &&
            (param.favoriteType[0] === this._iv.pokemon.type);
        const isNonFavoriteBerry = isExpertMode &&
            !param.favoriteType.includes(this._iv.pokemon.type);

        // get carry limit
        const carryLimit = Math.ceil(this._iv.carryLimit * (isGoodCampTicketSet ? 1.2 : 1));

        // calculate the number of berries and ings per help
        const rp = new PokemonRp(this._iv);
        const baseFreq = rp.frequencyWithHelpingBonus(helpBonusCount) /
            (isGoodCampTicketSet ? 1.2 : 1) *
            (isMainBerry ? 1 - expertMainBerrySpeedBonus : 1) *
            (isNonFavoriteBerry ? 1 + expertNonFavoriteBerrySpeedPenalty : 1);
        const bagUsagePerHelp = rp.getBagUsagePerHelp(bonus.ingredient);

        // calculate timeToFullInventory & timeFullInventory
        let carryLeft = carryLimit;
        let timeToFullInventory = 9999; // elapsed time since sleep start when bag becomes full
        let timeFullInventory = 9999; // time when bag becomes full
        const sleepEfficiencies = alwaysSnacking || alwaysTapAsleep ? [] :
            efficiencies.filter(x => !x.isAwake);
        for (const efficiency of sleepEfficiencies) {
            // calculate help count for this efficiency
            const time = efficiency.end - efficiency.start;
            const freq = baseFreq / efficiency.efficiency;
            const helpCount = time * 60 / freq;

            // calculate bag usage for this efficiency
            const bagUsage = bagUsagePerHelp * helpCount;
            if (bagUsage < carryLeft) {
                carryLeft -= bagUsage;
                continue;
            }

            // If bag reaches full capacity at this frequency, calculate when the bag
            // becomes full
            const requiredHelpCount = carryLeft / bagUsagePerHelp;
            timeToFullInventory = requiredHelpCount * freq / 60 +
                efficiency.start - sleepEfficiencies[0].start;
            timeFullInventory = timeToFullInventory + sleepEfficiencies[0].start;
            break;
        }

        // Apply isSnacking to events and efficiencies
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            if (alwaysSnacking || event.minutes >= timeFullInventory) {
                event.isSnacking = true;
                continue;
            }

            if (i < events.length - 1 && events[i + 1].minutes > timeFullInventory) {
                const energy = isEnergyAlwaysFull ? 100 : Math.max(0,
                    event.energyAfter - (timeFullInventory - event.minutes) / 10);
                events.splice(i + 1, 0, {
                    minutes: timeFullInventory, type: 'snack',
                    energyBefore: energy, energyAfter: energy,
                    isSnacking: false, isInPeriod: event.isInPeriod,
                });
            }
        }
        for (let i = 0; i < efficiencies.length; i++) {
            const efficiency = efficiencies[i];
            if (alwaysSnacking || efficiency.start >= timeFullInventory) {
                efficiency.isSnacking = true;
                continue;
            }

            if (timeFullInventory < efficiency.end) {
                const end = efficiency.end;
                efficiency.end = timeFullInventory;
                efficiencies.splice(i + 1, 0, {
                    start: timeFullInventory, end,
                    efficiency: efficiency.efficiency,
                    isAwake: efficiency.isAwake, isSnacking: true,
                    isInPeriod: efficiency.isInPeriod,
                });
            }
        }
        if (timeToFullInventory > 1440) {
            timeToFullInventory = -1;
        }

        // calculate snacking count
        const total = efficiencies
            .filter(x => x.isInPeriod)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);
        const awake = efficiencies
            .filter(x => x.isInPeriod && x.isAwake)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);
        const asleepNotFull = efficiencies
            .filter(x => x.isInPeriod && !x.isAwake && !x.isSnacking)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);
        const asleepFull = efficiencies
            .filter(x => x.isInPeriod && !x.isAwake && x.isSnacking)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);

        const skillProbabilityAfterWakeup = {once: 0, twice: 0};
        const lotteryCount = Math.ceil(asleepNotFull);
        const skillRatio = rp.skillRatio * bonus.skillTrigger;
        if (lotteryCount > 0) {
            const skillNone = Math.pow(1 - skillRatio, lotteryCount);
            if (this._iv.pokemon.specialty !== 'Skills' &&
                this._iv.pokemon.specialty !== 'All'
            ) {
                skillProbabilityAfterWakeup.once = 1 - skillNone;
            }
            else {
                const skillOnce = lotteryCount * skillRatio *
                    Math.pow(1 - skillRatio, lotteryCount - 1);
                skillProbabilityAfterWakeup.once = skillOnce;
                skillProbabilityAfterWakeup.twice = 1 - skillNone - skillOnce;
            }
        }
        return {carryLimit, skillRatio,
            timeToFullInventory, skillProbabilityAfterWakeup,
            helpCount: { total, awake, asleepNotFull, asleepFull }
        };
    }

    getEnergyRecoveryForCook(energy: number) {
        if (energy > 80) { return 1; }
        if (energy > 60) { return 2; }
        if (energy > 40) { return 3; }
        if (energy > 20) { return 4; }
        return 5;
    }

    getEfficiencyByEnergy(energy: number): EfficiencyList {
        if (energy > 80) { return 2.222; }
        if (energy > 60) { return 1.923; }
        if (energy > 40) { return 1.724; }
        if (energy > 1) { return 1.515; }
        return 1;
    }
}

export default Energy;
