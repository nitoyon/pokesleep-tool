import { describe, expect, it } from "vitest";
import { getBerryStrength } from "./Berry";

describe("getBerryStrength", () => {
	it("returns base strength at level 1", () => {
		expect(getBerryStrength("normal", 1)).toBe(28);
		expect(getBerryStrength("fire", 1)).toBe(27);
		expect(getBerryStrength("dragon", 1)).toBe(35);
		expect(getBerryStrength("flying", 1)).toBe(24);
	});

	it("uses linear growth at low levels", () => {
		expect(getBerryStrength("normal", 2)).toBe(29);
		expect(getBerryStrength("dragon", 2)).toBe(36);
	});

	it("uses exponential growth at high levels", () => {
		expect(getBerryStrength("normal", 60)).toBe(120);
		expect(getBerryStrength("dragon", 30)).toBe(72);
	});

	it("applies fieldBonus correctly", () => {
		expect(getBerryStrength("normal", 1, 25)).toBe(35);
		expect(getBerryStrength("dragon", 30, 10)).toBe(80);
	});

	it("applies berryStrengthMultiplier correctly", () => {
		expect(getBerryStrength("normal", 1, 0, 2)).toBe(56);
		expect(getBerryStrength("dragon", 30, 0, 2.4)).toBe(173);
	});

	it("applies both fieldBonus and berryStrengthMultiplier together", () => {
		expect(getBerryStrength("normal", 1, 25, 2)).toBe(70);
	});

	it("defaults fieldBonus to 0 and multiplier to 1", () => {
		expect(getBerryStrength("water", 1, 0, 1)).toBe(
			getBerryStrength("water", 1),
		);
	});
});
