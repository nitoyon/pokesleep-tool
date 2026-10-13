import { describe, expect, test } from "vitest";
import { createStrengthParameter } from "../PokemonStrength";
import { buildNightCapPikachuProfile } from "./MemberProfile";

describe("buildNightCapPikachuProfile", () => {
	const param = createStrengthParameter({});
	const allLevels = Array.from({ length: 20 }, (_, i) => i + 1);

	const getP = (level: number): Record<string, number> =>
		Object.fromEntries(
			buildNightCapPikachuProfile(param, level).normalBagUsage.map((x) => [
				x.name,
				x.p,
			]),
		);

	describe("baseFreq", () => {
		test.each([
			[1, 4800],
			[2, 4680],
			[3, 4560],
			[4, 4440],
			[5, 4380],
			[6, 4320],
			[7, 4260],
			[8, 4200],
			[9, 4140],
			[10, 4080],
			[11, 4020],
			[12, 3960],
			[13, 3900],
			[14, 3840],
			[15, 3780],
			[16, 3720],
			[17, 3660],
			[18, 3600],
			[19, 3570],
			[20, 3540],
		])("level %i => %i", (level, expected) => {
			expect(buildNightCapPikachuProfile(param, level).baseFreq).toBe(expected);
		});
	});

	describe("carryLimit", () => {
		test.each([
			[1, 8],
			[2, 8],
			[3, 9],
			[4, 9],
			[5, 10],
			[6, 10],
			[7, 11],
			[8, 11],
			[9, 12],
			[10, 12],
			[11, 13],
			[12, 13],
			[13, 14],
			[14, 14],
			[15, 15],
			[16, 15],
			[17, 16],
			[18, 16],
			[19, 17],
			[20, 17],
		])("level %i => %i", (level, expected) => {
			expect(buildNightCapPikachuProfile(param, level).carryLimit).toBe(
				expected,
			);
		});
	});

	describe("p", () => {
		test("level 2 has berry only", () => {
			expect(getP(2)).toEqual({ berry: 1 });
		});

		test("level 3 adds apple", () => {
			expect(getP(3)).toEqual({ berry: 0.6667, apple: 0.3333 });
		});

		test("level 8 keeps berry and apple", () => {
			expect(getP(8)).toEqual({ berry: 0.6667, apple: 0.3333 });
		});

		test("level 9 adds cacao", () => {
			expect(getP(9)).toEqual({ berry: 0.6667, apple: 0.2222, cacao: 0.1111 });
		});

		test("level 18 keeps berry, apple and cacao", () => {
			expect(getP(18)).toEqual({
				berry: 0.6667,
				apple: 0.2222,
				cacao: 0.1111,
			});
		});

		test("level 19 adds honey", () => {
			expect(getP(19)).toEqual({
				berry: 0.5834,
				apple: 0.2222,
				cacao: 0.1111,
				honey: 0.0833,
			});
		});

		test.each(allLevels)("sum of p is 1 at level %i", (level) => {
			const profile = buildNightCapPikachuProfile(param, level);
			const sum = profile.normalBagUsage.reduce((acc, x) => acc + x.p, 0);
			expect(sum).toBe(1);
		});
	});
});
