import { describe, expect, test } from "vitest";
import { NoTap } from "../Energy";
import { runIteration } from "./SimulateIteration";
import { resetTeamContext } from "./TeamContext";
import { createTestMember, createTestSim } from "./testHelpers";

describe("resetTeamContext", () => {
	test("carries leftover nextHelpSec past the period into the next iteration", () => {
		// period: 1 hour => periodSec = 3600
		const sim = createTestSim([createTestMember({}, { nextHelpSec: 3800 })], {
			period: 1,
		});

		resetTeamContext(sim);

		expect(sim.members[0].progress.nextHelpSec).toBe(200);
	});

	test("keeps the sentinel when nextHelpSec was never scheduled", () => {
		const sim = createTestSim([createTestMember({}, { nextHelpSec: -1 })], {
			period: 1,
		});

		resetTeamContext(sim);

		expect(sim.members[0].progress.nextHelpSec).toBe(-1);
	});

	test("a help pending past the period boundary completes early in the next iteration", () => {
		// Bonsly-like member: at 0 energy, a help takes 1.5 hours (5400s).
		// With a 1-hour (3600s) period, no help completes within the first
		// iteration, but the 1800s pending past the boundary carries into
		// the second iteration and completes exactly one help there.
		const member = createTestMember(
			{ pokemonName: "Bonsly", baseFreq: 5400 },
			{ energy: 0 },
		);
		const sim = createTestSim([member], {
			period: 1,
			tapFrequencyAwake: NoTap,
			tapFrequencyAsleep: NoTap,
		});

		resetTeamContext(sim);
		runIteration(sim);
		expect(sim.members[0].progress.help.all).toBe(0);

		resetTeamContext(sim);
		runIteration(sim);
		expect(sim.members[0].progress.help.all).toBe(1);
	});
});
