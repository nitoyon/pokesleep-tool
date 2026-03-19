import PokemonIv, { type InventoryBonus } from './PokemonIv';

/**
 * Cumulative distribution function (CDF) array for inventory fill probability.
 *
 * Array format:
 * - `result[0] = 0` (cannot fill before first help)
 * - `result[i]` = P(inventory fills by end of help i) - cumulative probability
 * - `result[result.length - 1]` should be ≈ 1.0
 *
 * Index i represents "after help i completes".
 */
export type InventoryDistributionResult = number[];

/**
 * Calculates the probability distribution of when a Pokémon's
 * inventory fills.
 *
 * Returns CDF array of fill probabilities.
 * Uses Forward DP for exact probabilities.
 * 
 * Implementation Details:
 *
 * @param iv - PokemonIv instance with carry limit and item rates
 * @param isGoodCampTicketSet - Good camp ticket is set.
 * @param bonus - Optional inventory bonuses from events and expert mode
 * @returns CDF array where index i = P(inventory filled by help i or earlier)
 *
 * @example
 * ```typescript
 * const iv = new PokemonIv({pokemonName: 'Pikachu', level: 30});
 * const dist = calculateInventoryDistribution(iv);
 * // dist[0] = 0 (before any helps)
 * // dist[5] = 0.65 (65% chance filled by help 5)
 * // dist[10] = 0.95 (95% chance filled by help 10)
 * ```
 */
export function calculateInventoryDistribution(
    iv: PokemonIv,
    isGoodCampTicketSet?: boolean,
    bonus?: Partial<InventoryBonus>
): InventoryDistributionResult {
    // Get inventory usage distribution from PokemonIv
    // (ex) Venusaur Lv.9 (Ing rate: 26.6)
    // => {1: 0.734, 2: 0.266}
    const itemDist = new Map<number, number>();
    const bagUsage = iv.getBagUsagePerHelpDetail(bonus);
    for (const {count, p} of bagUsage) {
        const existingP = itemDist.get(count) || 0;
        itemDist.set(count, existingP + p);
    }

    // Find minimum item count for array length calculation
    const carryLimit = Math.ceil(iv.carryLimit *
        (isGoodCampTicketSet ? 1.2 : 1));
    const minItemCount = Math.min(...itemDist.keys());

    // Calculate array length with minimum of 2
    const maxHelps = Math.ceil(carryLimit / minItemCount);
    const arrayLength = Math.max(2, maxHelps + 1);

    // Initialize DP state: Map<inventoryUsed, probability>
    let currentState = new Map<number, number>();
    currentState.set(0, 1.0); // Start with 0 items, probability 1.0

    // Track cumulative probability of filling at each help
    const cdf: number[] = [0]; // cdf[0] = 0 (cannot fill before any helps)
    let cumulativeFilled = 0;

    // Iterate through helps
    const maxIterations = Math.min(100, arrayLength - 1);
    for (let h = 0; h < maxIterations; h++) {
        const nextState = new Map<number, number>();
        let probFilledByThisHelp = 0;

        // For each current state (inventoryUsed, probability)
        for (const [currentInv, currentProb] of currentState.entries()) {
            // For each possible item outcome
            for (const [count, p] of itemDist.entries()) {
                const newInv = currentInv + count;

                if (newInv >= carryLimit) {
                    // Inventory fills
                    probFilledByThisHelp += currentProb * p;
                } else {
                    // Continue accumulating
                    const existingProb = nextState.get(newInv) || 0;
                    nextState.set(newInv, existingProb + currentProb * p);
                }
            }
        }

        // Update cumulative filled probability
        cumulativeFilled += probFilledByThisHelp;
        cdf.push(cumulativeFilled);

        // Early termination if CDF converges or no more active states
        if (cumulativeFilled >= 0.9999 || nextState.size === 0) {
            break;
        }

        currentState = nextState;
    }

    // Pad array to target length if needed
    while (cdf.length < arrayLength) {
        cdf.push(cumulativeFilled);
    }

    // Ensure we have at least the minimum length
    if (cdf.length < 2) {
        cdf.push(cumulativeFilled);
    }

    return cdf;
}

