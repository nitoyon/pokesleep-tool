
/** Configuration for candy dialog */
export type CandyCount = {
    /** Handy candy S (3) */
    handyS: number;
    /** Handy candy M (20) */
    handyM: number;
    /** Handy candy L (100) */
    handyL: number;
    /** Type candy S (4) */
    typeS: number;
    /** TYpe candy M (25) */
    typeM: number;
    /** Type candy L (125) */
    typeL: number;
};

/** Candy types and values */
const candyTypes: { key: keyof CandyCount; value: number; limit: number }[] = [
    { key: 'typeL', value: 125, limit: 99 },
    { key: 'typeM', value: 25, limit: 99 },
    { key: 'typeS', value: 4, limit: 999 },
    { key: 'handyL', value: 100, limit: 99 },
    { key: 'handyM', value: 20, limit: 99 },
    { key: 'handyS', value: 3, limit: 999 },
];

/**
 * Returns combinations of handy candies and type candies to create
 * the number of candies specified by required.
 *
 * When used, each candy becomes the following number of candies
 * (limits in parentheses).
 *
 * * handyS: 3 (999)
 * * handyM: 20 (99)
 * * handyL: 100 (99)
 * * typeS: 4 (999)
 * * typeM: 25 (99)
 * * typeL: 125 (99)
 *
 * (ex) required: 30, handyS: 40, handyM: 3, handyL: 1, typeS: 10, typeM: 1, typeL: 1
 * [
 *     { typeS: 10 }, // No excess (consumes 10 type candies)
 *     { typeS: 6, handyS: 2}, // No excess (consumes 6 type candies)
 *     { handyM: 2 }, // No excess (ranked lower because it doesn't consume type candies)
 *     { handyS: 10 }, // No excess (last because it's handy candy S)
 *     { handyS: 2, typeM: 1 }, // 1 excess
 *     { handyS: 9, typeS: 1 }, // 1 excess
 *        :
 * ]
 *
 * @param required The number of candies to create (max 4,000).
 * @param bag The number of candies in possession.
 * @returns Combinations. Empty if none exist. If multiple exist, returns top 10 in order
 *          of closest to required, preferring consumption of type candies and larger candies.
 */
export default function calcCandyUsage(required: number, bag: CandyCount): CandyCount[] {
    type CandyUsage = CandyCount & { total: number; extra: number };

    // Comparison function for combinations
    function compareCombinations(a: CandyUsage, b: CandyUsage): number {
        // 1. In order of less excess
        if (a.extra !== b.extra) {
            return a.extra - b.extra;
        }

        // 2. In order of consuming more type candies and larger candies
        // Compare in priority order: typeL -> ... -> handyS
        for (const candy of candyTypes) {
            if (a[candy.key] !== b[candy.key]) {
                return b[candy.key] - a[candy.key];
            }
        }

        return 0;
    }

    const results: CandyUsage[] = [];
    const maxResults = 10;

    // Define the order of candy types to process
    const steps: (keyof CandyCount)[] = ['typeL', 'handyL', 'typeM', 'handyM', 'typeS', 'handyS'];

    // DFS to explore all valid candy combinations
    function dfs(
        currentTotal: number,
        current: CandyCount,
        stepIndex: number
    ): void {
        // Periodically prune results to keep only the best ones
        if (results.length >= maxResults) {
            results.sort(compareCombinations);
            results.splice(maxResults); // Keep only top pruneThreshold results
        }
        if (results.length === maxResults && results[maxResults - 1].extra === 0) {
            return;
        }

        // Base case: all candies decided
        if (stepIndex >= steps.length) {
            if (currentTotal >= required) {
                results.push({
                    ...current,
                    total: currentTotal,
                    extra: currentTotal - required,
                });
            }
            return;
        }

        // Get current candy type and info
        const step = steps[stepIndex];
        const candyType = candyTypes.find(c => c.key === step)!;
        const maxCount = Math.min(bag[step], candyType.limit);

        // Determine the range to try
        const base = Math.max(0, required + 125 - currentTotal);
        const maxCountToTry = Math.min(Math.ceil(base / candyType.value), maxCount);

        // Only the very last step (handyS): skip combinations that can't reach required
        const remaining = Math.max(0, required - currentTotal);
        const minCount = stepIndex === steps.length - 1 ? Math.ceil(remaining / candyType.value) : 0;

        // Try each count for current candy type
        for (let count = maxCountToTry; count >= minCount; count--) {
            const newTotal = currentTotal + count * candyType.value;

            // Prune: skip if total already exceeds reasonable limit
            if (newTotal > required + 125) {
                continue;
            }

            // Recurse to next candy type
            dfs(newTotal, { ...current, [step]: count }, stepIndex + 1);
            if (results.length === maxResults && results[maxResults - 1].extra === 0) {
                return;
            }
        }
    }

    // Start DFS
    dfs(0, { typeL: 0, typeM: 0, typeS: 0, handyL: 0, handyM: 0, handyS: 0 }, 0);

    // Sort results
    results.sort(compareCombinations);

    // Return top 10 (excluding total and extra fields)
    return results.slice(0, 10).map(({ handyS, handyM, handyL, typeS, typeM, typeL }) => ({
        handyS, handyM, handyL, typeS, typeM, typeL,
    }));
}

/**
 * Calculates the maximum number of candies that can be obtained from the bag.
 *
 * @param bag The number of candies in possession.
 * @returns The total number of candies.
 */
export function calcMaxCandy(bag: CandyCount): number {
    return candyTypes.reduce((sum, candy) => sum + bag[candy.key] * candy.value, 0);
}
