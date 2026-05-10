import { IngredientDrawSkill } from "./IngredientDraw";
import { IngredientDrawHyperCutterSkill } from "./IngredientDrawHyperCutter";
import { IngredientDrawSuperLuckSkill } from "./IngredientDrawSuperLuck";
import {
	applySkill,
	createConstRng,
	createRandomQueue,
	createTestMember,
	createTestSim,
	initSkill,
	testParam,
} from "./testHelpers";

// Sandslash's Ingredient Draw list is ["potato", "corn", "pumpkin"], picked by
// index = floor(rng() * 3). Value at level 1 is 5.
const INGS = ["potato", "corn", "pumpkin"] as const;

describe("IngredientDrawSkill", () => {
	function setup(rng: () => number) {
		const member = createTestMember({
			pokemonName: "Sandslash",
			skillName: "Ingredient Draw S",
			skillLevel: 1,
		});
		const sim = createTestSim([member]);
		const skill = new IngredientDrawSkill(rng);
		initSkill(skill, member.profile, [member.profile], testParam());
		return { skill, member, sim };
	}

	test.each([
		[0, INGS[0]],
		[0.5, INGS[1]],
		[0.99, INGS[2]],
	])("rng() = %d picks %s", (r, ing) => {
		const { skill, member, sim } = setup(createConstRng(r));
		applySkill(skill, member, 0, sim);
		expect(skill.skillValue).toBe(5);
		expect([...member.progress.ingCounts]).toEqual([[ing, 5]]);
	});

	test("repeated draws of the same ingredient accumulate", () => {
		const { skill, member, sim } = setup(createConstRng(0));
		applySkill(skill, member, 0, sim);
		applySkill(skill, member, 0, sim);
		expect(member.progress.ingCounts.get("potato")).toBe(10);
	});
});

describe("IngredientDrawHyperCutterSkill", () => {
	function setup(rng: () => number) {
		const member = createTestMember({
			pokemonName: "Sandslash",
			skillName: "Ingredient Draw S (Hyper Cutter)",
			skillLevel: 1,
		});
		const sim = createTestSim([member]);
		const skill = new IngredientDrawHyperCutterSkill(rng);
		initSkill(skill, member.profile, [member.profile], testParam());
		return { skill, member, sim };
	}

	test("second draw >= hyperCutterSuccess: normal amount", () => {
		const { skill, member, sim } = setup(createRandomQueue([0, 0.5]));
		applySkill(skill, member, 0, sim);
		expect(member.progress.ingCounts.get("potato")).toBe(5);
	});

	test("second draw < hyperCutterSuccess (0.1668): amount is doubled", () => {
		const { skill, member, sim } = setup(createRandomQueue([0, 0.1]));
		applySkill(skill, member, 0, sim);
		expect(member.progress.ingCounts.get("potato")).toBe(10);
	});
});

describe("IngredientDrawSuperLuckSkill", () => {
	function setup(rng: () => number) {
		const member = createTestMember({
			pokemonName: "Sandslash",
			skillName: "Ingredient Draw S (Super Luck)",
			skillLevel: 1,
		});
		const sim = createTestSim([member]);
		const skill = new IngredientDrawSuperLuckSkill(rng);
		initSkill(skill, member.profile, [member.profile], testParam());
		return { skill, member, sim };
	}

	test("rng() < 0.112: a single dream-shard payout, no ingredients", () => {
		const { skill, member, sim } = setup(createConstRng(0.05));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(500); // baseShards * bonus(1)
		expect(member.progress.ingCounts.size).toBe(0);
	});

	test("0.112 <= rng() < 0.14: the 5x dream-shard payout", () => {
		const { skill, member, sim } = setup(createConstRng(0.13));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(2500);
	});

	test("rng() >= 0.14: an ingredient, chosen from the remapped remainder", () => {
		// rand2 = (0.5 - 0.14) / 0.86 = 0.4186 -> floor(0.4186 * 3) = 1 -> corn
		const { skill, member, sim } = setup(createConstRng(0.5));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(0);
		expect([...member.progress.ingCounts]).toEqual([["corn", 5]]);
	});
});
