import { describe, expect, test } from "vitest";
import { NoTap } from "../Energy";
import PokemonIv from "../PokemonIv";
import { runIteration } from "./SimulateIteration";
import { initializeSkillValue } from "./Skill/SkillInitializer";
import {
	createTestMember,
	createTestProfile,
	createTestSim,
	testParam,
} from "./testHelpers";

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

	test("taps during sleep using tapFrequencyAsleep, crossing sleep and wake boundaries", () => {
		const member = createTestMember();
		const sim = createTestSim(
			[member],
			{ period: 24, tapFrequencyAwake: 120, tapFrequencyAsleep: 60 },
			{ sleepTimeSec: 43200, dayLengthSec: 86400 },
		);

		const result = runIteration(sim);

		expect(result).toHaveLength(1);
		expect(result[0].berryTotalStrength).toBeGreaterThan(0);
	});

	test("still taps at every sleep/wake transition when both frequencies are NoTap", () => {
		const member = createTestMember({ isEnergyAlwaysFull: true });
		const sim = createTestSim(
			[member],
			{ period: 24, tapFrequencyAwake: NoTap, tapFrequencyAsleep: NoTap },
			{ sleepTimeSec: 43200, dayLengthSec: 86400 },
		);

		runIteration(sim);

		expect(member.progress.help.all).toBeGreaterThan(0);
	});

	test("grants sleep recovery at period end without entering sleeping state when period is shorter than the sleep session", () => {
		const sleepRecovery = 5;
		const member = createTestMember({ sleepRecovery }, { energy: 100 });
		const sim = createTestSim(
			[member],
			{ period: 1, tapFrequencyAwake: NoTap, tapFrequencyAsleep: NoTap },
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);

		runIteration(sim);

		// -6 energy for 1h
		// +5 energy for sleep recovery
		expect(member.progress.energy).toBe(100 - 6 + sleepRecovery);
		expect(member.progress.sleeping).toBe(false);
	});

	test("repeats the sleep/wake tap pattern across a multi-day period", () => {
		const member = createTestMember();
		const sim = createTestSim(
			[member],
			{ period: 48, tapFrequencyAwake: 120, tapFrequencyAsleep: 60 },
			{ sleepTimeSec: 43200, dayLengthSec: 86400 },
		);

		const result = runIteration(sim);

		expect(result).toHaveLength(1);
		expect(result[0].berryTotalStrength).toBeGreaterThan(0);
	});

	test("runs a team including Mew (Versatile) and Mr. Mime (Skill Copy)", () => {
		const mewIv = new PokemonIv({
			pokemonName: "Mew",
			level: 30,
			versatileSkill: "Charge Strength S",
		});
		const profiles = [
			createTestProfile({ index: 0, iv: mewIv, skillRate: 1 }),
			createTestProfile({
				index: 1,
				pokemonName: "Mr. Mime",
				skillRate: 1,
			}),
		];
		initializeSkillValue(profiles, testParam({ pityProc: true }));

		const sim = createTestSim(profiles, { pityProc: true }, {});
		const result = runIteration(sim);

		expect(result).toHaveLength(2);
		expect(result[0].skillCount).toBeGreaterThan(0);
		expect(result[0].skillStrength).toBeGreaterThan(0);
		expect(result[1].skillCount).toBeGreaterThan(0);
	});
});
