/**
 * Creates a Worker that runs the team simulation (see teamSimulation.worker.ts).
 *
 * Kept in its own .mts file: `import.meta.url` requires this file to be an ES
 * module, while the rest of the app type-checks as CommonJS per package.json
 * (.mts always type-checks as ESM regardless of that setting).
 */
export function createTeamSimulationWorker(): Worker {
	return new Worker(new URL("./teamSimulation.worker.ts", import.meta.url), {
		type: "module",
	});
}
