import { IngredientName } from "../data/pokemons";
import PokemonIv, { BagUsagePerHelpDetailItem, InventoryBonus } from './PokemonIv';
import {
    EnergyParameter, EnergyResult, AlwaysTap, NoTap, whistlePeriod,
} from './Energy';
import { BonusEffects } from '../data/events';

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
    /** Ingredient count by single help */
    countPerHelp: number;
}

/**
 * Represents the help count breakdown by berry, ingredient, and skill.
 */
export interface HelpCountResult {
    /** Total help count during the specified period */
    total: NormalAndSnackingHelpCount;

    /** Berry rate */
    berryRate: number;
    /** Berry help count */
    berryHelpCount: number;
    /** Berry count per help */
    berryCount: number;
    /** Ingredient rate */
    ingRate: number;
    /** Ingredient help count */
    ingHelpCount: number;
    /** Ing1 name and count */
    ing1: IngredientHelp;
    /** Ing2 name and count */
    ing2: IngredientHelp;
    /** Ing3 name and count */
    ing3: IngredientHelp;
    /** Ing1 ~ Ing3 name, count */
    ingredients: IngredientHelp[];
    /** Skill rate */
    skillRate: number;
    /** Overall skill rate (with pity proc) */
    overallSkillRate: number;
    /** Total skill count */
    skillCount: number;
}

/**
 * Calculate help count for the given condition.
 *
 * @param iv The Pokémon with the Berry Burst skill.
 * @param param The strength parameters, including team settings.
 * @param energy The energy calculation result.
 * @param bonus The help bonus.
 * @param isWhistle 
 * @returns Help count calculated.
 */
export function calculateHelpCount(
    iv: PokemonIv,
    param: EnergyParameter,
    energy: EnergyResult,
    bonus: BonusEffects,
    isWhistle: boolean
): HelpCountResult {
    const level = iv.level;
    const countRate = Math.ceil(param.period / 24);
    const normal = param.period < 0 ? -param.period :
        param.tapFrequencyAwake === NoTap ? 0 :
        (energy.helpCount.awake + energy.helpCount.asleepNotFull) * countRate;
    const sneakySnacking = param.period < 0 ? 0 :
        param.tapFrequencyAwake === NoTap ?
        (energy.helpCount.awake + energy.helpCount.asleepNotFull + energy.helpCount.asleepFull) * countRate :
        energy.helpCount.asleepFull * countRate;

    // calc ingredient
    const ingRate = iv.ingredientRate;
    const ingHelpCount = normal * ingRate;
    const ingUnlock = 1 +
        (level >= 30 && iv.ingredient2.count > 0 ? 1 : 0) +
        (level >= 60 && iv.ingredient3.count > 0 ? 1 : 0);
    const ingEventAdd: number = (param.period !== whistlePeriod ? bonus.ingredient : 0);

    const ing1: IngredientHelp = {
        ...iv.ingredient1,
        countPerHelp: iv.ingredient1.count + ingEventAdd,
    };
    ing1.count = ingHelpCount * (1 / ingUnlock) * ing1.countPerHelp;

    const ing2: IngredientHelp = {
        ...iv.ingredient2,
        countPerHelp: iv.ingredient2.count + ingEventAdd,
    };
    ing2.count = level < 30 || ing2.count === 0 ? 0 :
        ingHelpCount * (1 / ingUnlock) * ing2.countPerHelp;

    const ing3 = {
        ...iv.ingredient3,
        countPerHelp: iv.ingredient3.count + ingEventAdd,
    };
    ing3.count = level < 60 || ing3.count === 0 ? 0 :
        ingHelpCount * (1 / ingUnlock) * ing3.countPerHelp;

    const ing: {[name: string]: IngredientHelp} = {};
    const ingNames: IngredientName[] = [];
    ing[ing1.name] = {...ing1};
    ingNames.push(ing1.name);
    if (ing2.count > 0) {
        if (!(ing2.name in ing)) {
            ing[ing2.name] = {name: ing2.name, count: 0, countPerHelp: 0 };
            ingNames.push(ing2.name);
        }
        ing[ing2.name].count += ing2.count;
        ing[ing2.name].countPerHelp += ing2.countPerHelp;
    }
    if (ing3 !== undefined && ing3.count > 0) {
        if (!(ing3.name in ing)) {
            ing[ing3.name] = {name: ing3.name, count: 0, countPerHelp: 0 };
            ingNames.push(ing3.name);
        }
        ing[ing3.name].count += ing3.count;
        ing[ing3.name].countPerHelp += ing3.countPerHelp;
    }
    const ingredients = ingNames.map(x => ing[x]);

    // calc berry
    const berryRate = iv.berryRate;
    const berryHelpCount = (normal + sneakySnacking) - ingHelpCount;
    const berryCount = iv.berryCount;

    // calc skill
    const skillRate = energy.skillRate;
    const overallSkillRate = energy.overallSkillRate;
    let skillCount = 0;
    if (param.period > 0 && !isWhistle && param.tapFrequencyAwake !== NoTap) {
        if (param.tapFrequencyAsleep === AlwaysTap) {
            const helpCount = energy.helpCount.awake + energy.helpCount.asleepNotFull;
            skillCount = helpCount * overallSkillRate * countRate;
        }
        else {
            const skillCountAwake = energy.helpCount.awake * overallSkillRate;
            const skillCountSleeping = energy.skillProbabilityAfterWakeup.once +
                energy.skillProbabilityAfterWakeup.twice * 2;
            skillCount = (skillCountAwake + skillCountSleeping) * countRate;
        }
    }

    return {
        total: {
            all: normal + sneakySnacking,
            normal,
            sneakySnacking,
        },

        berryRate, berryHelpCount, berryCount,
        ingRate, ingHelpCount, ing1, ing2, ing3, ingredients,
        skillRate, overallSkillRate, skillCount,
    }
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
     * @param bonus - Optional inventory bonuses from events and expert mode.
     */
    constructor(iv: PokemonIv, isGoodCampTicketSet?: boolean, bonus?: Partial<InventoryBonus>) {
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
        this.skillRate = iv.skillRate;
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
