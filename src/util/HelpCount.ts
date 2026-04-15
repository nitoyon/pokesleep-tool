import { IngredientName } from "../data/pokemons";
import PokemonIv, {
    BagUsagePerHelpDetailItem, IngredientSlot, InventoryBonus
} from './PokemonIv';
import {
    EfficiencyEvent, EnergyParameter, EnergyResult, AlwaysTap, NoTap,
} from './Energy';
import { BonusEffects } from '../data/events';
import { isExpertField } from "../data/fields";

/**
 * Represents help count split by normal and sneaky snacking.
 */
export type NormalAndSnackingHelpCount = {
    /** Total help count (normal + sneakySnacking) */
    all: number;
    /** Help count stored in Pokemon's inventory */
    normal: number;
    /** Help count directly granted to Snorlax (all berries) */
    sneakySnacking: number;
};

/**
 * Represents the result of ingredient help calculation.
 */
export interface IngredientHelp {
    /** Ingredient name. */
    name: IngredientName;
    /** Ingredient count. */
    count: number;
    /** Overflow ingredient count */
    overflowCount: number;
    /** Help count. */
    helpCount: number;
    /** Ingredient count by single help (0 if locked) */
    countPerHelp: number;
    /** Array of ingredient slot */
    slots: IngredientSlot[];
}

/**
 * Represents the help count breakdown by berry, ingredient, and skill.
 */
export interface HelpCountResult {
    /** Base frequency per help (energy=0) */
    baseFreq: number;
    /** Carry limit with bonus (Good camp ticket & event bonus) */
    carryLimit: number;
    /** Bonus that affect inventory consumption. */
    inventoryBonus: InventoryBonus;
    /** Sleep time required to fulfill inventory. -1 when not fulfilled. */
    timeToFullInventory: number,

    /** Total help count during the specified period */
    total: NormalAndSnackingHelpCount;
    /** Awake help count */
    awake: NormalAndSnackingHelpCount;
    /** Asleep help count */
    asleep: NormalAndSnackingHelpCount;

    /** Berry rate */
    berryRate: number;
    /**
     * The number of berries brought by the Pokémon.
     * (berryNormalHelpCount * berryCountPerNormalHelp +
     * berrySneakySnackingCount * berryCountPerSneakySnacking)
     */
    berryCount: number;
    /** Berry help count (normal help + sneaky snacking) */
    berryHelpCount: number;
    /** Berry help count (normal help) */
    berryNormalHelpCount: number;
    /** Berry help count (sneaky snacking) */
    berrySneakySnackingCount: number;
    /** Berry count per normal help */
    berryCountPerNormalHelp: number;
    /**
     * Berry count per sneaky snacking
     *
     * This value is different from berryCountPerNormalHelp when
     * an event bonus for berries is active.
     */
    berryCountPerSneakySnacking: number;
    /** Ingredient rate */
    ingRate: number;
    /** Number of ingredient slots (e.g., AAA Lv60 → 3) */
    ingSlotCount: number;
    /** Ingredient help count */
    ingHelpCount: number;
    /** Ing1 name and count */
    ing1: IngredientSlot;
    /** Ing2 name and count */
    ing2: IngredientSlot;
    /** Ing3 name and count */
    ing3: IngredientSlot;
    /** Ing1 ~ Ing3 name, count */
    ingredients: IngredientHelp[];
    /** Skill rate */
    skillRate: number;
    /** Overall skill rate (with pity proc) */
    overallSkillRate: number;
    /** Total skill count */
    skillCount: number;
    /** Skill% after wakeup */
    skillProbabilityAfterWakeup: {
        /** Skill triggered once% after wakeup */
        once: number,
        /** Skill triggered twice% after wakeup.
         * Always 0 if specialty is not skill.
         */
        twice: number,
    },
}

/**
 * Calculate help count for the given condition.
 *
 * @param iv The Pokémon with the Berry Burst skill.
 * @param param The strength parameters, including team settings.
 * @param energy The energy calculation result.
 * @param bonus The help bonus.
 * @param isWhistle Whether the whistle is used.
 * @returns Help count calculated.
 */
export function calculateHelpCount(
    iv: PokemonIv,
    param: EnergyParameter,
    energy: EnergyResult,
    bonus: BonusEffects,
    isWhistle: boolean
): HelpCountResult {
    const countRate = param.period < 0 ? 1 : Math.ceil(param.period / 24);

    // Calculate help count
    const sleepScoreSeconds = param.sleepScore * 510 * 60 / 100;
    const awakeSeconds = Math.min(1440 * 60 - sleepScoreSeconds,
        param.period * 60 * 60);
    const sleepSeconds = Math.min(sleepScoreSeconds,
        param.period * 60 * 60 - awakeSeconds);

    // Initialize return value
    const ret: HelpCountResult = initializeHelpCountResult(
        iv, param, energy, bonus, isWhistle);

    // Awake helps
    const simulation = new HelpCountSimulation(iv, param.isGoodCampTicketSet,
        ret.overallSkillRate, ret.inventoryBonus);
    calculateAwakeHelpCount(ret, param, awakeSeconds, ret.baseFreq,
        energy, simulation, isWhistle);
    ret.awake = {...ret.total};

    // Asleep helps
    calculateAsleepHelpCount(ret, param, sleepSeconds, ret.baseFreq,
        energy, simulation, isWhistle);
    ret.asleep = {
        all: ret.total.all - ret.awake.all,
        normal: ret.total.normal - ret.awake.normal,
        sneakySnacking: ret.total.sneakySnacking - ret.awake.sneakySnacking,
    };

    // multiply count rate
    if (countRate > 1) {
        ret.berryHelpCount *= countRate;
        ret.ingHelpCount *= countRate;
        ret.ingredients.forEach(x => x.count *= countRate);
        ret.skillCount *= countRate;

        function multiply(help: NormalAndSnackingHelpCount) {
            help.all *= countRate;
            help.normal *= countRate;
            help.sneakySnacking *= countRate;
        }
        multiply(ret.total);
        multiply(ret.awake);
        multiply(ret.asleep);
    }

    return ret;
}

function initializeHelpCountResult(
    iv: PokemonIv,
    param: EnergyParameter,
    energy: EnergyResult,
    bonus: BonusEffects,
    isWhistle: boolean
): HelpCountResult {
    const {baseFreq, inventoryBonus} = calculateBaseFreqAndBonus(iv, param,
        bonus, isWhistle);
    const carryLimit = Math.ceil((iv.carryLimit + bonus.carryLimit) *
        (param.isGoodCampTicketSet ? 1.2 : 1));

    const level = iv.level;
    const ingEventAdd: number = (isWhistle ? 0 : bonus.ingredient);

    let ingSlotCount = 0;
    const ing1 = { ...iv.ingredient1 };
    if (iv.ingredient1.count > 0) {
        ingSlotCount++;
        ing1.count += ingEventAdd;
    }

    const ing2 = { ...iv.ingredient2, count: 0 };
    if (level >= 30 && iv.ingredient2.count > 0) {
        ingSlotCount++;
        ing2.count = iv.ingredient2.count + ingEventAdd;
    }

    const ing3 = { ...iv.ingredient3, count: 0 }
    if (level >= 60 && iv.ingredient3.count > 0) {
        ingSlotCount++;
        ing3.count = iv.ingredient3.count + ingEventAdd;
    }

    const skillRate = iv.skillRate * bonus.skillTrigger;
    const overallSkillRate = !param.pityProc ? skillRate :
        iv.calculateSkillRateWithPityProc(skillRate);

    const timeToFullInventory = calculateTimeToFullInventory(
        iv, baseFreq, inventoryBonus, param, carryLimit, energy);

    const ret: HelpCountResult = {
        baseFreq,
        carryLimit,
        inventoryBonus,
        timeToFullInventory,
    
        total: {
            all: 0,
            normal: 0,
            sneakySnacking: 0,
        },
        awake: {
            all: 0,
            normal: 0,
            sneakySnacking: 0,
        },
        asleep: {
            all: 0,
            normal: 0,
            sneakySnacking: 0,
        },

        berryRate: iv.berryRate,
        berryCount: 0,
        berryHelpCount: 0,
        berryNormalHelpCount: 0,
        berrySneakySnackingCount: 0,
        berryCountPerNormalHelp: iv.berryCount + bonus.berry,
        berryCountPerSneakySnacking: iv.berryCount,
        ingRate: iv.ingredientRate,
        ingSlotCount,
        ingHelpCount: 0,
        ing1, ing2, ing3,
        ingredients: [],
        skillRate, overallSkillRate,
        skillCount: 0,
        skillProbabilityAfterWakeup: { once: 0, twice: 0 },
    };

    // initialize ingredients
    function addIngredients(ret: HelpCountResult, ing: IngredientSlot) {
        const entry = ret.ingredients.find(x => x.name === ing.name);
        if (entry !== undefined) {
            entry.slots.push(ing);
            return;
        }
        ret.ingredients.push({
            name: ing.name,
            count: 0,
            overflowCount: 0,
            countPerHelp: ing.count,
            helpCount: 0,
            slots: [ing],
        });
    }
    addIngredients(ret, ret.ing1);
    if (ret.ingSlotCount >= 2) {
        addIngredients(ret, ret.ing2);
    }
    if (ret.ingSlotCount >= 3) {
        addIngredients(ret, ret.ing3);
    }

    // Fix ingredients.countPerHelp to the average countPerHelp
    for (const ing of ret.ingredients) {
        ing.countPerHelp =
            ing.slots.reduce((p, c) => p + c.count, 0) /
            ing.slots.length;
    }

    return ret;
}

/**
 * Calculate base help frequency and inventory bonus.
 * @param iv PokemonIv instance.
 * @param param Strength parameters.
 * @param bonus The help bonus.
 * @param isWhistle Whether the whistle is used.
 * @returns Base help frequency and inventory bonus.
 */
function calculateBaseFreqAndBonus(
    iv: PokemonIv,
    param: EnergyParameter,
    bonus: BonusEffects,
    isWhistle: boolean
): {
    baseFreq: number,
    inventoryBonus: InventoryBonus,
 } {
    const helpBonusCount = param.helpBonusCount +
        (iv.hasHelpingBonusInActiveSubSkills ? 1 : 0);
    const isExpertMode = isExpertField(param.fieldIndex) && !isWhistle;
    const isFavoriteBerry = isExpertMode && param.favoriteType.includes(iv.pokemon.type);
    const isMainBerry = isExpertMode && (param.favoriteType[0] === iv.pokemon.type);
    const isNonFavoriteBerry = isExpertMode && !isFavoriteBerry;

    const baseFreq = iv.getBaseFrequency(helpBonusCount,
        param.isGoodCampTicketSet, isMainBerry, isNonFavoriteBerry);
    const inventoryBonus = {
        berryBonus: bonus.berry,
        ingredientBonus: bonus.ingredient,
        carryLimitBonus: bonus.carryLimit,
        expertIngBonus: isFavoriteBerry && param.expertEffect === "ing",
    };
    return { baseFreq, inventoryBonus };
}

function calculateTimeToFullInventory(
    iv: PokemonIv,
    baseFreq: number,
    inventoryBonus: InventoryBonus,
    param: EnergyParameter,
    carryLimit: number,
    energy: EnergyResult
) {
    const alwaysSnacking = param.tapFrequencyAwake === NoTap;
    const alwaysTapAsleep = param.tapFrequencyAsleep === AlwaysTap;
    const bagUsagePerHelp = iv.getBagUsagePerHelp(inventoryBonus);

        // calculate timeToFullInventory & timeFullInventory
    let carryLeft = carryLimit;
    let timeToFullInventory = 9999; // elapsed time since sleep start when bag becomes full
    const sleepEfficiencies = alwaysSnacking || alwaysTapAsleep ? [] :
        energy.efficiencies.filter(x => !x.isAwake);
    for (const efficiency of sleepEfficiencies) {
        // calculate help count for this efficiency
        const time = efficiency.end - efficiency.start;
        const freq = baseFreq * efficiency.frequencyRate;
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
        break;
    }

    if (timeToFullInventory > 1440) {
        timeToFullInventory = -1;
    }

    return timeToFullInventory;
}

/**
 * Calculate awake help count.
 * @param ret HelpCountResult object.
 * @param param The strength parameters, including team settings.
 * @param awakeSeconds Awake seconds
 * @param baseFreq Base frequency.
 * @param energy The energy calculation result.
 * @param simulation HelpCountSimulation object.
 * @param isWhistle Whether the whistle is used.
 */
function calculateAwakeHelpCount(
    ret: HelpCountResult,
    param: EnergyParameter,
    awakeSeconds: number,
    baseFreq: number,
    energy: EnergyResult,
    simulation: HelpCountSimulation,
    isWhistle: boolean
) {
    // Specified help count
    if (param.period < 0) {
        addAlwaysTapHelps(ret, -param.period, false);
        return;
    }

    // Calculate help count
    const tapIntervalAwake = (
        param.tapFrequencyAwake === AlwaysTap ||
        param.tapFrequencyAwake === NoTap
    ) ? awakeSeconds : param.tapFrequencyAwake * 60;
    const helpCounts = calculateHelpCountPerTap(energy.efficiencies, 0,
        baseFreq, tapIntervalAwake, awakeSeconds);

    // NoTap: Sneaky snacking
    if (param.tapFrequencyAwake === NoTap) {
        ret.total.all = ret.total.sneakySnacking = helpCounts[0];
        ret.berryHelpCount = helpCounts[0];
        ret.berryCount = ret.berryHelpCount * ret.berryCountPerSneakySnacking;
        ret.berrySneakySnackingCount = helpCounts[0];
        return;
    }
    
    // AlwaysTap or Whistle: Always tap simulation
    if (param.tapFrequencyAwake === AlwaysTap || isWhistle) {
        addAlwaysTapHelps(ret, helpCounts[0], !isWhistle);
        return;
    }

    // Tap frequency simulation
    for (const helpCount of helpCounts) {
        const result = simulation.compute(helpCount);
        ret.total.all += helpCount;
        ret.total.normal += result.normalHelpCount;
        ret.total.sneakySnacking += result.sneakySnackingCount;
        ret.berryCount += result.berryCount;
        ret.berryNormalHelpCount += result.normalHelpCount * ret.berryRate;
        ret.berrySneakySnackingCount += result.sneakySnackingCount;

        const ingHelpCount = result.normalHelpCount * ret.ingRate;
        ret.ingHelpCount += ingHelpCount;
        ret.ingredients.forEach((ingredient, index) => {
            ingredient.count += result.ingredientCount[index];
            ingredient.helpCount += ingHelpCount / ret.ingSlotCount * ingredient.slots.length;
            ingredient.slots.forEach((slot) => {
                ingredient.overflowCount += result.overflowIngsPerSlot[slot.index];
            });
        });

        ret.skillCount += result.skillOnce + result.skillTwice * 2;
    }
    ret.berryHelpCount = ret.berryNormalHelpCount +
        ret.berrySneakySnackingCount;
}

/**
 * Calculate sleep help count.
 * @param ret HelpCountResult object.
 * @param param The strength parameters, including team settings.
 * @param sleepSeconds Sleep seconds
 * @param baseFreq Base frequency.
 * @param energy The energy calculation result.
 * @param simulation HelpCountSimulation object.
 * @param isWhistle Whether the whistle is used.
 */
function calculateAsleepHelpCount(
    ret: HelpCountResult,
    param: EnergyParameter,
    sleepSeconds: number,
    baseFreq: number,
    energy: EnergyResult,
    simulation: HelpCountSimulation,
    isWhistle: boolean
) {
    // Skip for help count and whistle
    if (param.period < 0 || isWhistle) {
        return;
    }

    // Skip if sleep seconds is 0
    if (sleepSeconds <= 0) {
        return;
    }

    // Calculate help count
    const tapIntervalAsleep = (
        param.tapFrequencyAsleep === AlwaysTap ||
        param.tapFrequencyAsleep === NoTap
    ) ? sleepSeconds : param.tapFrequencyAsleep * 60;
    const asleepHelpCounts = calculateHelpCountPerTap(energy.efficiencies,
        1440 * 60 - sleepSeconds, baseFreq, tapIntervalAsleep, sleepSeconds);

    // Always sneaky snacking simulation
    if (param.tapFrequencyAwake === NoTap) {
        ret.total.all += asleepHelpCounts[0];
        ret.total.sneakySnacking += asleepHelpCounts[0];
        ret.berryHelpCount = asleepHelpCounts[0];
        ret.berryCount = ret.berryHelpCount * ret.berryCountPerSneakySnacking;
        ret.berrySneakySnackingCount = asleepHelpCounts[0];
        return;
    }

    // Always tap simulation
    if (param.tapFrequencyAsleep === AlwaysTap) {
        addAlwaysTapHelps(ret, asleepHelpCounts[0], true);
        return;
    }

    // Tap frequency simulation (Including NoTap)
    for (const helpCount of asleepHelpCounts) {
        const result = simulation.compute(helpCount);
        ret.total.all += helpCount;
        ret.total.normal += result.normalHelpCount;
        ret.total.sneakySnacking += result.sneakySnackingCount;
        ret.berryCount += result.berryCount;
        ret.berryNormalHelpCount += result.normalHelpCount * ret.berryRate;
        ret.berrySneakySnackingCount += result.sneakySnackingCount;

        const ingHelpCount = result.normalHelpCount * ret.ingRate;
        ret.ingHelpCount += ingHelpCount;
        ret.ingredients.forEach((ingredient, index) => {
            ingredient.count += result.ingredientCount[index];
            ingredient.helpCount += ingHelpCount / ret.ingSlotCount * ingredient.slots.length;
            ingredient.slots.forEach((slot) => {
                ingredient.overflowCount += result.overflowIngsPerSlot[slot.index];
            });
        });

        // If no tap during the day, don't count skills at night
        if (param.tapFrequencyAwake === NoTap &&
            param.tapFrequencyAsleep === NoTap) {
            continue;
        }

        // If tap during awake and no tap during sleep,
        // add skill probability after wake up
        if (param.tapFrequencyAsleep === NoTap) {
            ret.skillProbabilityAfterWakeup.once = result.skillOnce;
            ret.skillProbabilityAfterWakeup.twice = result.skillTwice;
        }
        ret.skillCount += result.skillOnce + result.skillTwice * 2;
    }
    ret.berryHelpCount = ret.berryNormalHelpCount +
        ret.berrySneakySnackingCount;
}

/**
 * Add always tap help to HelpCountResult.
 * @param ret HelpCountResult to be added.
 * @param helpCount The number of helps.
 * @param addSkillCount Wheather skill count is added or not.
 */
function addAlwaysTapHelps(
    ret: HelpCountResult,
    helpCount: number,
    addSkillCount: boolean
) {
    // total
    ret.total.all += helpCount;
    ret.total.normal += helpCount;

    // berry
    const berryHelpCount = helpCount * ret.berryRate;
    ret.berryHelpCount += berryHelpCount;
    ret.berryCount += berryHelpCount * ret.berryCountPerNormalHelp;
    ret.berryNormalHelpCount += berryHelpCount;

    // ingredient
    const ingHelpCount = helpCount * ret.ingRate;
    ret.ingHelpCount += ingHelpCount;
    for (const ing of ret.ingredients) {
        const helpCount = ingHelpCount / ret.ingSlotCount * ing.slots.length;
        ing.helpCount += helpCount;
        ing.count += helpCount * ing.countPerHelp;
    }

    // skill
    if (addSkillCount) {
        ret.skillCount += helpCount * ret.overallSkillRate;
    }
}

/**
 * Calculate the elapsed time (in seconds) when the next help will complete.
 *
 * @param efficiencies - Efficiency event list (start/end in minutes since wake up).
 * @param elapsed - Help start time in seconds since wake up.
 * @param baseFreq - Base help frequency in seconds.
 * @returns Elapsed time in seconds when the next help completes.
 */
export function calculateNextHelpElapsed(
    efficiencies: EfficiencyEvent[],
    elapsed: number,
    baseFreq: number
): number {
    const elapsedMin = elapsed / 60;
    const event = efficiencies.find(e => e.start <= elapsedMin && elapsedMin < e.end);
    const frequencyRate = event?.frequencyRate ?? 1;
    return elapsed + baseFreq * frequencyRate;
}

/** Result of calculateHelpCountInInterval(). */
export type HelpCountInIntervalResult = {
    /** Number of complete helps within the interval (integer) */
    count: number;
    /** Fractional progress toward the next help (0 to <1) */
    fractionalCount: number;
    /** Seconds past the interval end when the next help would complete */
    overflowSeconds: number;
    /** Help start time of the next (incomplete) help, in seconds since wake up */
    elapsed: number;
};

/**
 * Calculate the number of helps that occur within a given time interval.
 *
 * @param efficiencies - Efficiency event list (start/end in minutes since wake up).
 * @param elapsed - Help start time in seconds since wake up.
 * @param baseFreq - Base help frequency in seconds.
 * @param interval - Time window in seconds.
 * @returns Help count breakdown for the interval.
 */
export function calculateHelpCountInInterval(
    efficiencies: EfficiencyEvent[],
    elapsed: number,
    baseFreq: number,
    interval: number
): HelpCountInIntervalResult {
    const endTime = elapsed + interval;
    let currentElapsed = elapsed;
    let count = 0;

    while (true) {
        const nextElapsed = calculateNextHelpElapsed(efficiencies, currentElapsed, baseFreq);
        if (nextElapsed <= endTime) {
            count++;
            currentElapsed = nextElapsed;
        }
        if (nextElapsed >= endTime) {
            const helpDuration = nextElapsed - currentElapsed;
            const fractionalCount = (helpDuration === 0 ? 0 :
                (endTime - currentElapsed) / helpDuration);
            const overflowSeconds = nextElapsed - endTime;
            return { count, fractionalCount, overflowSeconds, elapsed: currentElapsed };
        }
    }
}

/**
 * Calculate the number of helps per tap interval over a total duration.
 *
 * @param efficiencies - Efficiency event list (start/end in minutes since wake up).
 * @param elapsed - Help start time in seconds since wake up.
 * @param baseFreq - Base help frequency in seconds.
 * @param tapInterval - Length of each tap interval in seconds.
 * @param duration - Total duration in seconds.
 * @returns Array of help counts per tap. The last element may be fractional.
 *   Taps with zero completed helps are omitted from the array.
 */
export function calculateHelpCountPerTap(
    efficiencies: EfficiencyEvent[],
    elapsed: number,
    baseFreq: number,
    tapInterval: number,
    duration: number
): number[] {
    if (tapInterval <= 0) {
        throw new Error('tap interval must be positive');
    }

    // Absolute seconds of the end of the duration
    const endTime = elapsed + duration;
    // Start of the next calculateHelpCountInInterval segment, or the time the
    // in-progress overflow help completes.
    let segmentStart = elapsed;
    // 1 if an overflow help from the previous tap is still in progress; 0 otherwise.
    let pendingHelp = 0;
    // Start time of the currently in-progress overflow help (for fractional calculation).
    let inProgressHelpStart = elapsed;
    let tapEnd = elapsed + tapInterval;
    const ret: number[] = [];

    while (true) {
        const isLast = tapEnd >= endTime;
        const segmentEnd = isLast ? endTime : tapEnd;

        // The in-progress overflow help hasn't completed by segmentEnd yet.
        if (segmentStart > segmentEnd) {
            if (isLast) {
                // Push fractional progress of the overflow help through the last segment.
                const helpDuration = segmentStart - inProgressHelpStart;
                const fractional = helpDuration > 0 ?
                    (segmentEnd - inProgressHelpStart) / helpDuration :
                    0;
                if (fractional > 0) {
                    ret.push(fractional);
                }
                break;
            }
            // This tap is empty (overflow help still running); skip to next tap.
            tapEnd += tapInterval;
            continue;
        }

        const result = calculateHelpCountInInterval(
            efficiencies, segmentStart, baseFreq, segmentEnd - segmentStart
        );
        const count = pendingHelp + result.count;

        if (isLast) {
            const total = count + result.fractionalCount;
            if (total > 0) {
                ret.push(total);
            }
            break;
        }

        // Handle overflow help
        inProgressHelpStart = result.elapsed;
        if (result.overflowSeconds > 0) {
            pendingHelp = 1;
            segmentStart = tapEnd + result.overflowSeconds;
        } else {
            pendingHelp = 0;
            segmentStart = tapEnd;
        }

        if (count > 0) {
            ret.push(count);
        }
        tapEnd += tapInterval;
    }

    return ret;
}

/** Result of HelpCountSimulation.compute(). */
export type HelpCountSimulationResult = {
    /** Expected number of normal helps (not sneaky snacking) */
    normalHelpCount: number;
    /** Expected number of helps where inventory was already full */
    sneakySnackingCount: number;
    /** Expected total berry count */
    berryCount: number;
    /** Expected ingredient counts per ingredient kind index */
    ingredientCount: number[];
    /** Expected overflow ingredient count per slot index (0=ing1, 1=ing2, 2=ing3) */
    overflowIngsPerSlot: number[];
    /**
     * Probability that skill triggered exactly once across normalHelpCount helps.
     * For non-Skills/non-All specialty, this is P(at least 1 trigger).
     */
    skillOnce: number;
    /**
     * Probability that skill triggered twice or more across normalHelpCount helps.
     * 0 for non-Skills/non-All specialty.
     */
    skillTwice: number;
};

/**
 * Simulates inventory state transitions to compute expected sneaky snacking
 * count and expected ingredient counts after N help actions.
 *
 * State is represented as `(berry, a, b, c)` where `a`, `b`, `c` are
 * ingredient counts. Note that if the Pokémon has fewer than 3 ingredient types,
 * B or C stay at 0.
 *
 * The sneaky snacking count is derived from the cumulative probability
 * of the inventory being full at each step.
 *
 * Intermediate DP states are cached so that calling `compute(n)` for
 * increasing `n` values extends from the previous computation.
 */
export class HelpCountSimulation {
    /** DP state maps: steps[i] maps encoded state key to probability. */
    private steps: Map<number, number>[];
    /** Probability that inventory is full by step i. */
    private cumulativeFullProb: number[];
    /** Expected berry count from states that became full by step i. */
    private cumulativeFullBerryExpected: number[];
    /**
     * Expected count of ingredient kind `j` from states that became full
     * by step `i`.
     *
     * (ex) `cumulativeFullIngExpected[5][0]` is the expected count
     * of ingredient A from states that became full by step 5.
     */
    private cumulativeFullIngExpected: number[][];
    /** Maximum inventory capacity. */
    private carryLimit: number;
    /** Encoding base = carryLimit + 1. */
    private M: number;
    /** Possible outcomes per help action. */
    private bagUsage: BagUsagePerHelpDetailItem[];
    /** The number of berries obtained from sneaky snacking. */
    private sneakySnackingBerryCount: number;
    /**
     * Number of distinct ingredient kinds (1, 2, or 3).
     *
     * (ex) If the Pokémon has only 2 ingredient types (ABB),
     * this value is set to 2, and the state is represented
     * as `(berry, a, b, 0)`,
     * (ex) If the Pokémon has only 1 ingredient types (AAA),
     * this value is set to 1, and the state is represented
     * as `(berry, a, 0, 0)`,
     */
    private numIngredientKinds: number;
    /** Cumulative overflow per ingredient slot at each step. */
    private cumulativeOverflowIngSlots: number[][];
    /** Skill trigger rate per help. */
    private skillRate: number;
    /** Whether the Pokémon is Skills or All specialty (enables exact-once/twice split). */
    private isSkillSpecialty: boolean;

    /**
     * Initializes the simulation with carry limit, ingredient index mapping,
     * possible outcomes per help action, and the initial DP state.
     *
     * @param iv - PokemonIv instance providing carry limit and item rates.
     * @param isGoodCampTicketSet - Whether the good camp ticket bonus (1.2x carry) is active.
     * @param skillRate - Skill trigger rate per help.
     * @param bonus - Optional inventory bonuses from events and expert mode.
     */
    constructor(iv: PokemonIv, isGoodCampTicketSet?: boolean,
        skillRate?: number,
        bonus?: Partial<InventoryBonus>
    ) {
        // calculate carryLimit and M
        this.carryLimit = Math.ceil(
            (iv.carryLimit + (bonus?.carryLimitBonus ?? 0)) *
            (isGoodCampTicketSet ? 1.2 : 1)
        );
        this.M = this.carryLimit + 1;

        // Initialize ingNameToIndex
        this.bagUsage = iv.getBagUsagePerHelpDetail(bonus);
        this.numIngredientKinds = Math.max(...this.bagUsage.map(
            usage => usage.ingKindIndex + 1));
        const numSlots = Math.max(...this.bagUsage.map(
            usage => usage.ingSlotIndex + 1));

        // Initialize sneaky snacking berry count
        // If the berry bonus is active, we consider that the berry count
        // from sneaky snacking is not increased by the bonus.
        this.sneakySnackingBerryCount = iv.berryCount;

        // Initialize skill fields
        this.skillRate = skillRate ?? iv.skillRate;
        this.isSkillSpecialty = (iv.pokemon.specialty === 'Skills' ||
            iv.pokemon.specialty === 'All');

        // Initialize steps
        const initialState = new Map<number, number>();
        initialState.set(this.encodeKey(0, 0, 0, 0), 1.0);
        this.steps = [initialState];

        // Initialize cummulative arrays
        this.cumulativeFullProb = [0];
        this.cumulativeFullBerryExpected = [0];
        this.cumulativeFullIngExpected = [new Array(this.numIngredientKinds).fill(0)];
        this.cumulativeOverflowIngSlots = [new Array(numSlots).fill(0)];
    }

    /**
     * Compute simulation results after `n` help actions.
     *
     * @param n - Number of help actions to simulate.
     * @returns Expected sneaky snacking count and expected ingredient counts.
     */
    compute(n: number): HelpCountSimulationResult {
        // Handle integer n
        if (Number.isInteger(n)) {
            return this.computeN(n);
        }

        // Handle non-integer n via linear interpolation
        const nFloor = Math.floor(n);
        const nCeil = Math.ceil(n);
        const frac = n - nFloor;
        const lo = this.compute(nFloor);
        const hi = this.compute(nCeil);
        const lerp = (a: number, b: number) => a + (b - a) * frac;
        return {
            normalHelpCount: lerp(lo.normalHelpCount, hi.normalHelpCount),
            sneakySnackingCount: lerp(lo.sneakySnackingCount, hi.sneakySnackingCount),
            berryCount: lerp(lo.berryCount, hi.berryCount),
            ingredientCount: lo.ingredientCount.map((v, i) => lerp(v, hi.ingredientCount[i])),
            overflowIngsPerSlot: lo.overflowIngsPerSlot.map((v, i) => lerp(v, hi.overflowIngsPerSlot[i])),
            skillOnce: lerp(lo.skillOnce, hi.skillOnce),
            skillTwice: lerp(lo.skillTwice, hi.skillTwice),
        };
    }

    /**
     * Compute simulation results after `n` help actions. (integer version)
     *
     * @param n - Number of help actions to simulate (integer).
     * @returns Expected sneaky snacking count and expected ingredient counts.
     */
    private computeN(n: number): HelpCountSimulationResult {
        // Extend computation if needed
        while (this.steps.length <= n) {
            this.computeStep();
        }

        // Calculate expected sneaky snacking: sum of P(full after step i) for i=0..n-1
        let sneakySnackingCount = 0;
        for (let i = 0; i < n; i++) {
            sneakySnackingCount += this.cumulativeFullProb[i];
        }

        // Calculate expected berries
        // - berries from states that became full by step n
        let berryCount = this.cumulativeFullBerryExpected[n];

        // - berries from active states
        const activeState = this.steps[n];
        for (const [key, prob] of activeState) {
            const [berry, , ,] = this.decodeKey(key);
            berryCount += berry * prob;
        }

        // Calculate expected ingredients
        // - ingredients from states that became full by step n
        const ingredientCount = [...this.cumulativeFullIngExpected[n]];

        // - ingredients from active states at step n
        for (const [key, prob] of activeState) {
            const [, a, b, c] = this.decodeKey(key);
            ingredientCount[0] += a * prob;
            if (this.numIngredientKinds >= 2) {
                ingredientCount[1] += b * prob;
            }
            if (this.numIngredientKinds >= 3) {
                ingredientCount[2] += c * prob;
            }
        }

        const { skillOnce, skillTwice } = this.calculateSkillProbability(n);

        return {
            normalHelpCount: n - sneakySnackingCount,
            sneakySnackingCount,
            berryCount, ingredientCount,
            overflowIngsPerSlot: [...this.cumulativeOverflowIngSlots[n]],
            skillOnce, skillTwice,
        };
    }

    /**
     * Extends the DP by one step, applying every possible outcome to each
     * active state and accumulating full-inventory probabilities and
     * expected item counts into the cumulative arrays.
     */
    private computeStep(): void {
        const stepIndex = this.steps.length;
        const prevState = this.steps[stepIndex - 1];
        const prevCumulativeProb = this.cumulativeFullProb[stepIndex - 1];
        const prevCumulativeIng = this.cumulativeFullIngExpected[stepIndex - 1];
        const prevCumulativeFullBerry = this.cumulativeFullBerryExpected[stepIndex - 1];
        const prevCumulativeOverflow = this.cumulativeOverflowIngSlots[stepIndex - 1];

        const nextState = new Map<number, number>();
        let newFullProb = 0;
        const newFullIng = new Array(this.numIngredientKinds).fill(0);
        let newFullBerry = 0;
        const newOverflowIngSlots = new Array(prevCumulativeOverflow.length).fill(0);

        for (const [key, prob] of prevState) {
            const [berry, a, b, c] = this.decodeKey(key);
            const total = berry + a + b + c;

            // Apply each outcome
            for (const usage of this.bagUsage) {
                const transitionProb = prob * usage.p;
                let newBerry = berry, newA = a, newB = b, newC = c;

                if (usage.name === 'berry') {
                    newBerry += usage.count;
                } else {
                    // Ingredient: cap added amount so total doesn't exceed carryLimit
                    const space = this.carryLimit - total;
                    const addCount = Math.min(usage.count, space);
                    const overflow = usage.count - addCount;
                    if (overflow > 0) {
                        newOverflowIngSlots[usage.ingSlotIndex] += overflow * transitionProb;
                    }
                    switch (usage.ingKindIndex) {
                        case 0: newA += addCount; break;
                        case 1: newB += addCount; break;
                        case 2: newC += addCount; break;
                    }
                }

                const newTotal = newBerry + newA + newB + newC;
                if (newTotal < this.carryLimit) {
                    const newKey = this.encodeKey(newBerry, newA, newB, newC);
                    const existing = nextState.get(newKey) ?? 0;
                    nextState.set(newKey, existing + transitionProb);
                } else {
                    // Inventory becomes full: accumulate immediately
                    newFullProb += transitionProb;
                    newFullBerry += newBerry * transitionProb;
                    newFullIng[0] += newA * transitionProb;
                    if (this.numIngredientKinds >= 2) {
                        newFullIng[1] += newB * transitionProb;
                    }
                    if (this.numIngredientKinds >= 3) {
                        newFullIng[2] += newC * transitionProb;
                    }
                }
            }
        }

        this.steps.push(nextState);
        this.cumulativeFullProb.push(prevCumulativeProb + newFullProb);
        this.cumulativeFullBerryExpected.push(
            prevCumulativeFullBerry +
            prevCumulativeProb * this.sneakySnackingBerryCount +
            newFullBerry
        );

        const cumulativeIng = prevCumulativeIng.map(
            (v: number, i: number) => v + newFullIng[i]
        );
        this.cumulativeFullIngExpected.push(cumulativeIng);

        this.cumulativeOverflowIngSlots.push(
            prevCumulativeOverflow.map(
                (v: number, i: number) => v + newOverflowIngSlots[i]
            )
        );
    }

    /**
     * Calculates exact skill trigger probabilities after `n` help actions by
     * weighting the binomial formula over the distribution of normalHelpCount
     * derived from `cumulativeFullProb`.
     *
     * @param n - Number of help actions (must already be computed).
     */
    private calculateSkillProbability(n: number): {
        skillOnce: number; skillTwice: number;
    } {
        const p = this.skillRate;
        let skillOnce = 0;
        let skillTwice = 0;

        // For k  < n-1, P(normalHelpCount = k) =
        //     cumulativeFullProb[k] - cumulativeFullProb[k-1]
        for (let k = 1; k < n; k++) {
            const prob = this.cumulativeFullProb[k] - this.cumulativeFullProb[k - 1];
            if (prob === 0) { continue; }
            const skillNoneK = Math.pow(1 - p, k);
            if (this.isSkillSpecialty) {
                const onceK = k * p * Math.pow(1 - p, k - 1);
                skillOnce += prob * onceK;
                skillTwice += prob * (1 - skillNoneK - onceK);
            } else {
                skillOnce += prob * (1 - skillNoneK);
            }
        }

        // For n: P(normalHelpCount = n) = 1 - cumulativeFullProb[n-1]
        const probNormalN = n > 0 ? 1 - this.cumulativeFullProb[n - 1] : 1;
        if (probNormalN > 0) {
            const skillNoneN = Math.pow(1 - p, n);
            if (this.isSkillSpecialty) {
                const onceN = n * p * Math.pow(1 - p, n - 1);
                skillOnce += probNormalN * onceN;
                skillTwice += probNormalN * (1 - skillNoneN - onceN);
            } else {
                skillOnce += probNormalN * (1 - skillNoneN);
            }
        }
        return { skillOnce, skillTwice: Math.max(0, skillTwice) };
    }

    /**
     * Encodes a `(berry, a, b, c)` tuple into a single number using
     * mixed-radix encoding with base M.
     *
     * @param berry - Berry count.
     * @param a - Ingredient 0 count.
     * @param b - Ingredient 1 count.
     * @param c - Ingredient 2 count.
     */
    private encodeKey(berry: number, a: number, b: number, c: number): number {
        return ((berry * this.M + a) * this.M + b) * this.M + c;
    }

    /**
     * Decodes a single number back into a `(berry, a, b, c)` tuple
     * (inverse of {@link encodeKey}).
     *
     * @param key - Encoded state key.
     */
    private decodeKey(key: number): [number, number, number, number] {
        const c = key % this.M;
        key = (key - c) / this.M;
        const b = key % this.M;
        key = (key - b) / this.M;
        const a = key % this.M;
        const berry = (key - a) / this.M;
        return [berry, a, b, c];
    }
}
