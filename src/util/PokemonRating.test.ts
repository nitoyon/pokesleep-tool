import { describe, expect, test } from "vitest";
import { AlwaysTap, NoTap } from "./Energy";
import Nature from "./Nature";
import PokemonIv from "./PokemonIv";
import PokemonRating, {
	enumerateNatureGroups,
	enumerateSubSkillGroups,
	getActiveSubSkillSlotCount,
} from "./PokemonRating";
import PokemonStrength, {
	createStrengthParameter,
	type StrengthParameter,
} from "./PokemonStrength";
import SubSkill from "./SubSkill";
import SubSkillList from "./SubSkillList";

/**
 * Calculate top percent of the given individuals by enumerating all
 * combinations of k active sub-skills and natures without grouping.
 */
function bruteForce(
	ivs: PokemonIv[],
	param: StrengthParameter,
): { berry: number; ingredient: number; skill: number }[] {
	const amount = (iv: PokemonIv) => {
		const result = new PokemonStrength(iv, param).calculate();
		return {
			berry: result.berryCount + result.bigBerryCount,
			ingredient: result.ingredients.reduce((p, c) => p + c.count, 0),
			skill: result.skillCount,
		};
	};

	const base = ivs[0];
	const k = getActiveSubSkillSlotCount(base.level);
	const all = SubSkill.allSubSkills;
	const amounts: ReturnType<typeof amount>[] = [];
	const visit = (start: number, chosen: SubSkill[]) => {
		if (chosen.length === k) {
			const [lv10, lv25, lv50, lv70, lv80] = chosen;
			const subSkills = new SubSkillList({ lv10, lv25, lv50, lv70, lv80 });
			for (const nature of Nature.allNatures) {
				amounts.push(amount(base.clone({ subSkills, nature })));
			}
			return;
		}
		for (let i = start; i < all.length; i++) {
			visit(i + 1, [...chosen, all[i]]);
		}
	};
	visit(0, []);

	const top = (key: "berry" | "ingredient" | "skill", value: number) =>
		(amounts.filter((x) => x[key] >= value - 1e-9 * Math.max(1, value)).length /
			amounts.length) *
		100;
	return ivs.map((iv) => {
		const a = amount(iv);
		return {
			berry: top("berry", a.berry),
			ingredient: top("ingredient", a.ingredient),
			skill: top("skill", a.skill),
		};
	});
}

function rate(iv: PokemonIv, param: StrengthParameter) {
	const result = new PokemonRating(iv, param).calculate();
	return {
		berry: result.berry.topPercent,
		ingredient: result.ingredient.topPercent,
		skill: result.skill.topPercent,
	};
}

describe("enumerateSubSkillGroups", () => {
	test.each([1, 10, 25, 50, 70, 80, 100])("weights sum to 1 (Lv%i)", (lv) => {
		const sum = enumerateSubSkillGroups(lv).reduce((p, c) => p + c.weight, 0);
		expect(sum).toBeCloseTo(1, 12);
	});

	test("Lv1 has only one group", () => {
		expect(enumerateSubSkillGroups(1)).toHaveLength(1);
	});

	test("Inventory Up S + M is grouped with Inventory Up L", () => {
		// Lv25: 2 slots
		const groups = enumerateSubSkillGroups(25);
		const inv3 = groups.filter(
			(g) => g.inventory === 3 && g.helpingSpeed + g.skillTrigger === 0,
		);
		const onlyInv3 = inv3.filter(
			(g) =>
				g.helpingBonus +
					g.berryFinding +
					g.ingredientFinder +
					g.energyRecovery ===
				0,
		);
		expect(onlyInv3).toHaveLength(1);
		// {Inventory Up L, one of 5 irrelevant} + {Inventory Up S, M}
		expect(onlyInv3[0].weight).toBeCloseTo(6 / 136, 12);
	});
});

describe("enumerateNatureGroups", () => {
	test("weights sum to 1", () => {
		const groups = enumerateNatureGroups();
		const sum = groups.reduce((p, c) => p + c.weight, 0);
		expect(sum).toBeCloseTo(1, 12);
		// 5 neutral natures and 4 EXP gains up/down natures are grouped
		expect(groups.length).toBe(1 + 4 * 3 + 4 + 4);
	});
});

describe("PokemonRating", () => {
	const subSkills = new SubSkillList({
		lv10: new SubSkill("Inventory Up M"),
		lv25: new SubSkill("Helping Speed S"),
		lv50: new SubSkill("Ingredient Finder S"),
	});

	test.each([
		["Raichu", 25, NoTap],
		["Raichu", 25, AlwaysTap],
		["Charizard", 50, NoTap],
		["Wigglytuff", 50, 120],
	])("matches brute force (%s Lv%i tap=%i)", (pokemonName, level, tap) => {
		const param = createStrengthParameter({
			tapFrequencyAsleep: tap,
		});
		const base = new PokemonIv({ pokemonName, level, subSkills });
		const ivs = [
			base,
			base.clone({ nature: new Nature("Brave") }),
			base.clone({ nature: new Nature("Quiet") }),
			base.clone({ subSkills: new SubSkillList() }),
		];
		const expected = bruteForce(ivs, param);
		ivs.forEach((iv, i) => {
			const actual = rate(iv, param);
			expect(actual.berry).toBeCloseTo(expected[i].berry, 9);
			expect(actual.ingredient).toBeCloseTo(expected[i].ingredient, 9);
			expect(actual.skill).toBeCloseTo(expected[i].skill, 9);
		});
	});

	test("value matches PokemonStrength", () => {
		const param = createStrengthParameter({});
		const iv = new PokemonIv({ pokemonName: "Raichu", level: 60, subSkills });
		const result = new PokemonRating(iv, param).calculate();
		const strength = new PokemonStrength(iv, param).calculate();
		expect(result.berry.value).toBeCloseTo(
			strength.berryCount + strength.bigBerryCount,
			9,
		);
		expect(result.skill.value).toBeCloseTo(strength.skillCount, 9);
	});

	test("best individual is near the top", () => {
		const param = createStrengthParameter({ tapFrequencyAsleep: AlwaysTap });
		const iv = new PokemonIv({
			pokemonName: "Raichu",
			level: 80,
			nature: new Nature("Sassy"),
			subSkills: new SubSkillList({
				lv10: new SubSkill("Skill Trigger M"),
				lv25: new SubSkill("Skill Trigger S"),
				lv50: new SubSkill("Helping Speed M"),
				lv70: new SubSkill("Helping Speed S"),
				lv80: new SubSkill("Helping Bonus"),
			}),
		});
		const result = new PokemonRating(iv, param).calculate();
		expect(result.skill.topPercent).toBeGreaterThan(0);
		expect(result.skill.topPercent).toBeLessThan(0.1);
	});

	test("frequency 0 returns zero", () => {
		const iv = new PokemonIv({ pokemonName: "Darkrai" });
		if (iv.pokemon.frequency !== 0) {
			return;
		}
		const result = new PokemonRating(
			iv,
			createStrengthParameter({}),
		).calculate();
		expect(result.berry.value).toBe(0);
	});
});
