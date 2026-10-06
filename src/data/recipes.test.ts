import type { RecipeType } from "./recipes";
import { maxLevel, Recipe } from "./recipes";

const fancyAppleCurry = {
	type: "curries" as RecipeType,
	name: "fancy",
	ings: [{ ing: "apple" as const, count: 7 }],
	total: 7,
	bonus: 19,
	strength: 748,
};

describe("Recipe", () => {
	it("constructor should initialize fancy apple curry", () => {
		const recipe = new Recipe(fancyAppleCurry);
		expect(recipe.type).toBe("curries");
		expect(recipe.name).toBe("fancy");
		expect(recipe.ings).toEqual([{ ing: "apple", count: 7 }]);
		expect(recipe.total).toBe(7);
		expect(recipe.baseStrength).toBe(748);
		expect(recipe.bonus).toBe(19);
	});

	describe("calculateStrength", () => {
		it("should calculate strength at various levels correctly", () => {
			const recipe = new Recipe(fancyAppleCurry);

			expect(recipe.calculateStrength(1)).toBe(748);
			expect(recipe.calculateStrength(2)).toBe(763);
			expect(recipe.calculateStrength(30)).toBe(1204);
			expect(recipe.calculateStrength(65)).toBe(2498);
		});

		it("should throw error for invalid level", () => {
			const recipe = new Recipe(fancyAppleCurry);

			expect(() => recipe.calculateStrength(0)).toThrow("Invalid level value");
			expect(() => recipe.calculateStrength(-1)).toThrow("Invalid level value");
			expect(() => recipe.calculateStrength(maxLevel + 1)).toThrow(
				"Invalid level value",
			);
			expect(() => recipe.calculateStrength(30.5)).toThrow(
				"Invalid level value",
			);
		});
	});
});
