/**
 * Creates a Worker that calculates the rating (see rating.worker.ts).
 *
 * Kept in its own .mts file: `import.meta.url` requires this file to be an ES
 * module, while the rest of the app type-checks as CommonJS per package.json
 * (.mts always type-checks as ESM regardless of that setting).
 */
export function createRatingWorker(): Worker {
	return new Worker(new URL("./rating.worker.ts", import.meta.url), {
		type: "module",
	});
}
