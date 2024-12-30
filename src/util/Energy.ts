import PokemonIv from './PokemonIv';
import PokemonRp from './PokemonRp';

/** Efficiency list */
type EfficiencyList = 2.222 | 1.923 | 1.724 | 1.515 | 1.0;

export interface EnergyParameter {
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
    event: "none";
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
         * Always 0 if speciality is not skill.
         */
        twice: number,
    },
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

    /**
     * Initialize Energy instance.
     * @param iv Pokemon IV data.
     */
    constructor(iv: PokemonIv) {
        this._iv = iv;
    }

    calculate(param: EnergyParameter): EnergyResult {
        const sleepMinutes = param.sleepScore * 510 / 100;
        const recoveryFactor = this._iv.nature.energyRecoveryFactor;
        const sleepRecovery = Math.min(100, Math.round(sleepMinutes / 510 * 100) * recoveryFactor *
            (1 + 0.14 * param.recoveryBonusCount));
        const myRestoreEnergy = param.e4eEnergy * recoveryFactor;
        const sleepTime = 1440 - sleepMinutes;

        let events: EnergyEvent[];
        let efficiencies: EfficiencyEvent[];
        if (param.isEnergyAlwaysFull) {
            events = [
                {minutes: 0, type: 'wake', energyBefore: 100, energyAfter: 100, isSnacking: false },
                {minutes: sleepTime, type: 'sleep', energyBefore: 100, energyAfter: 100, isSnacking: false },
                {minutes: 1440, type: 'wake', energyBefore: 100, energyAfter: 100, isSnacking: false },
            ];
            efficiencies = [
                {start: 0, end: sleepTime, isAwake: true, efficiency: 2.222, isSnacking: false},
                {start: sleepTime, end: 1440, isAwake: false, efficiency: 2.222, isSnacking: false},
            ];
        }
        else {
            events = this.createEvents(param.e4eCount, sleepTime);

            // 1st calculation to know the initialEnergy
            this.calculateEnergyForEvents(events, myRestoreEnergy, sleepRecovery,
                sleepRecovery);
            const initialEnergy = events[events.length - 1].energyAfter;

            // 2nd calculation using initialEnergy
            this.calculateEnergyForEvents(events, myRestoreEnergy, sleepRecovery,
                initialEnergy);
            this.addEmptyEvent(events);

            // calculate efficiency
            efficiencies = this.calculateEfficiency(events, sleepTime);
        }

        // calculate average efficiency
        const total = this.calculateAverageEfficiency(efficiencies);
        const awake = this.calculateAverageEfficiency(efficiencies
            .filter(x => x.isAwake));
        const sleep = this.calculateAverageEfficiency(efficiencies
            .filter(x => !x.isAwake));

        // calculate Sneaky Snacking
        const {timeToFullInventory, helpCount, skillProbabilityAfterWakeup } =
            this.calculateSneakySnacking(events, efficiencies, param);
        const canBeFullInventory = (param.tapFrequency === "always" &&
            param.tapFrequencyAsleep === "none");

        return {sleepTime, events, efficiencies, canBeFullInventory,
            timeToFullInventory, helpCount, skillProbabilityAfterWakeup,
            averageEfficiency: { total, awake, asleep: sleep },
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
            {minutes: 0, type: 'wake', energyBefore: -1, energyAfter: -1, isSnacking: false },
            // 10:00
            {minutes: 120, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false },
            // 14:00
            {minutes: 360, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false },
            // 20:00
            {minutes: 720, type: 'cook', energyBefore: -1, energyAfter: -1, isSnacking: false },
        ];
        for (let i = 0; i < e4eCount; i++) {
            events.push({
                minutes: Math.floor((i + 1) * 930 / (e4eCount + 1) / 10) * 10,
                type: 'e4e',
                energyBefore: -1, energyAfter: -1,
                isSnacking: false,
            });
        }
        events.push({
            minutes: sleepTime, type: 'sleep',
            energyBefore: -1, energyAfter: -1, isSnacking: false,
        });
        events.push({
            minutes: 1440, type: 'wake',
            energyBefore: -1, energyAfter: -1, isSnacking: false,
        });
        return events.sort((a, b) => a.minutes - b.minutes);
    }

    /**
     * Calculate energy for every events.
     * @param events Event to be calculated.
     * @param myRestoreEnergy The amount of energy to be restored by e4e.
     * @param sleepRecovery Energy recovery by sleep.
     * @param initialEnergy Energy value after waking up.
     */
    calculateEnergyForEvents(events: EnergyEvent[], myRestoreEnergy: number,
        sleepRecovery: number, initialEnergy=100
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
                    this.getEnergyRecoveryForCook(curEvent.energyBefore);
            }
            else if (curEvent.type === 'e4e') {
                curEvent.energyAfter = Math.min(150, curEvent.energyAfter + myRestoreEnergy);
            }
            else if (curEvent.type === 'wake') {
                curEvent.energyAfter = Math.min(100, curEvent.energyAfter + sleepRecovery);
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
                    energyBefore: 0, energyAfter: 0, isSnacking: false});
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
                    isAwake: true, isSnacking: false,
                });

                energy = threshold;
                start = end;
            }
            ret.push({
                start, end: curMinutes,
                efficiency: this.getEfficiencyByEnergy(energy),
                isAwake: true, isSnacking: false,
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

    calculateAverageEfficiency(efficiency: EfficiencyEvent[]): number {
        let total = 0;
        let time = 0;
        for (let e of efficiency) {
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
     * @param param EnergyParameter.
     * @return Help count and time to full inverntory.
     */
    calculateSneakySnacking(events: EnergyEvent[], efficiencies: EfficiencyEvent[],
        param: EnergyParameter):
    {
        timeToFullInventory: number,
        skillProbabilityAfterWakeup: {
            once: number,
            twice: number,
        },
        helpCount: {
            awake: number,
            asleepNotFull: number,
            asleepFull: number,
        },
    } {
        if (this._iv.pokemon.frequency === 0) {
            return {
                timeToFullInventory: -1,
                skillProbabilityAfterWakeup: { once: 0, twice: 0 },
                helpCount: {
                    awake: 0, asleepNotFull: 0, asleepFull: 0
                }
            };
        }

        const isEnergyAlwaysFull = param.isEnergyAlwaysFull;
        const helpBonusCount = param.helpBonusCount +
            (this._iv.hasHelpingBonusInActiveSubSkills ? 1 : 0);
        const isGoodCampTicketSet = param.isGoodCampTicketSet;
        const alwaysSnacking = param.tapFrequency === "none";
        const alwaysTapAsleep = param.tapFrequencyAsleep === "always";

        // get carry limit (assumes that we evolved this pokemon from the beginning)
        const carryLimit = Math.ceil(this._iv.carryLimit * (isGoodCampTicketSet ? 1.2 : 1));

        // calculate the number of berries and ings per help
        const rp = new PokemonRp(this._iv);
        const baseFreq = rp.frequencyWithHelpingBonus(helpBonusCount) /
            (isGoodCampTicketSet ? 1.2 : 1);
        const bagUsagePerHelp = rp.bagUsagePerHelp;

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
                    energyBefore: energy, energyAfter: energy, isSnacking: false,
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
                });
            }
        }
        if (timeToFullInventory > 1440) {
            timeToFullInventory = -1;
        }

        // calculate snacking count
        const awake = efficiencies
            .filter(x => x.isAwake)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);
        const asleepNotFull = efficiencies
            .filter(x => !x.isAwake && !x.isSnacking)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);
        const asleepFull = efficiencies
            .filter(x => !x.isAwake && x.isSnacking)
            .reduce((p, c) => p + (c.end - c.start) * 60 / baseFreq * c.efficiency, 0);

        const skillProbabilityAfterWakeup = {once: 0, twice: 0};
        const lotteryCount = Math.ceil(asleepNotFull);
        if (lotteryCount > 0) {
            const isEventBoosted = false;
            const skillRatio = rp.skillRatio * (isEventBoosted ? 1.5 : 1);
            const skillNone = Math.pow(1 - skillRatio, lotteryCount);
            if (this._iv.pokemon.speciality !== 'Skills') {
                skillProbabilityAfterWakeup.once = 1 - skillNone;
            }
            else {
                const skillOnce = lotteryCount * skillRatio *
                    Math.pow(1 - skillRatio, lotteryCount - 1);
                skillProbabilityAfterWakeup.once = skillOnce;
                skillProbabilityAfterWakeup.twice = 1 - skillNone - skillOnce;
            }
        }
        return {timeToFullInventory, skillProbabilityAfterWakeup,
            helpCount: { awake, asleepNotFull, asleepFull }
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
