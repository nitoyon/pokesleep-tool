import { describe, expect, test } from "vitest";
import { PokemonBoxItem } from "../PokemonBox";
import PokemonIv from "../PokemonIv";
import { simulateTeam } from "./Simulate";
import { testParam } from "./testHelpers";

/**
 * `TeamView` maps each slot to `enabled ? item : undefined` before calling
 * `simulateTeam`, so a disabled member reaches the simulator as an empty slot.
 * These tests lock in that a disabled member is fully excluded from the team
 * total while the slot alignment of `result.members` is preserved.
 *
 * The simulation is Monte Carlo with an unseeded RNG, so assertions compare
 * values within a single `simulateTeam` call, never across calls.
 */
describe("simulateTeam member exclusion", () => {
	function makeItem(pokemonName: string): PokemonBoxItem {
		return new PokemonBoxItem(new PokemonIv({ pokemonName, level: 30 }));
	}

	// keep runs cheap
	const param = testParam({ period: 24 });
	const iterations = 20;

	test("a disabled (undefined) slot maps to undefined and is left out of the total", () => {
		const raichu = makeItem("Raichu");
		const pikachu = makeItem("Pikachu");

		const result = simulateTeam(
			[raichu, undefined, pikachu],
			param,
			iterations,
		);

		// slot alignment is kept: the disabled middle slot is undefined
		expect(result.members).toHaveLength(3);
		expect(result.members[0]).toBeDefined();
		expect(result.members[1]).toBeUndefined();
		expect(result.members[2]).toBeDefined();

		// the team total is exactly the sum of the two active members
		const sum =
			(result.members[0]?.totalStrength ?? 0) +
			(result.members[2]?.totalStrength ?? 0);
		expect(result.total.totalStrength).toBeCloseTo(sum, 5);
	});

	test("disabling every member but one leaves the whole team total on that member", () => {
		const raichu = makeItem("Raichu");

		const result = simulateTeam(
			[undefined, raichu, undefined],
			param,
			iterations,
		);

		expect(result.members[0]).toBeUndefined();
		expect(result.members[2]).toBeUndefined();
		expect(result.total.totalStrength).toBeCloseTo(
			result.members[1]?.totalStrength ?? 0,
			5,
		);
	});

	test("a fully disabled team returns empty results", () => {
		const result = simulateTeam([undefined, undefined], param, iterations);
		expect(result.total.totalStrength).toBe(0);
		expect(result.members).toEqual([undefined, undefined]);
	});
});
