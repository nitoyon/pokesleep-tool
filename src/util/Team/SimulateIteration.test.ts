import { describe, expect, test } from "vitest";
import { runIteration } from "./SimulateIteration";
import { createTestMember, createTestSim } from "./testHelpers";

describe("runIteration", () => {
	test("runs a single iteration with period = 3", () => {
		const member = createTestMember();
		const sim = createTestSim([member], { period: 3 });

		const result = runIteration(sim);

		expect(result).toHaveLength(1);
	});

	test("runs a single iteration with period = 24, crossing a cook event boundary", () => {
		const member = createTestMember();
		const sim = createTestSim([member], { period: 24 });

		const result = runIteration(sim);

		expect(result).toHaveLength(1);
		expect(result[0].berryTotalStrength).toBeGreaterThan(0);
	});

	test("isEnergyAlwaysFull member always taps at the full-energy frequency over a 24h period", () => {
		const member = createTestMember({ isEnergyAlwaysFull: true });
		const sim = createTestSim([member], { period: 24 });

		runIteration(sim);

		const expectedHelpCount = Math.floor((24 * 60 * 60) / (2200 * 0.45));
		expect(member.progress.help.all).toBe(expectedHelpCount);
	});
});
