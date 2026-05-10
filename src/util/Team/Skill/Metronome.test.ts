import { IngredientNames } from "../../../data/pokemons";
import {
	createConstRng,
	createRandomQueue,
	createTestProfile,
	createTestSim,
	testParam,
} from "../testHelpers";
import { MetronomeCandidates } from "./Metronome";
import { createSkill } from "./SkillFactory";

// MetronomeSkill is reached through SkillFactory (createSkill) so the Skill
// module graph — which has a circular dependency between SkillFactory and the
// delegating handlers — evaluates in the same order as production.

describe("MetronomeSkill", () => {
	/** rng value that makes `Math.floor(rng * len)` land on `index`. */
	const pick = (index: number) => index / MetronomeCandidates.length;

	test("delegates to the candidate selected by rng", () => {
		const togekiss = createTestProfile({ pokemonName: "Togekiss" });
		const profiles = [togekiss];

		const index = MetronomeCandidates.indexOf("Charge Strength S");
		const skill = createSkill("Metronome", createConstRng(pick(index)));
		skill.initialize(togekiss, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		// Charge Strength S value at level 1 is 400.
		expect(sim.members[0].progress.skillStrength).toBe(400);
	});

	test("field bonus flows through to the delegated skill", () => {
		const togekiss = createTestProfile({ pokemonName: "Togekiss" });
		const profiles = [togekiss];

		const index = MetronomeCandidates.indexOf("Charge Strength S");
		const skill = createSkill("Metronome", createConstRng(pick(index)));
		skill.initialize(togekiss, profiles, testParam({ fieldBonus: 50 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(Math.ceil(400 * 1.5));
	});

	test("forwards its rng to candidates resolved during initialize", () => {
		const togekiss = createTestProfile({ pokemonName: "Togekiss" });
		const profiles = [togekiss];

		const index = MetronomeCandidates.indexOf("Charge Strength S (Random)");
		const rngVal = [index / MetronomeCandidates.length, 0];
		const skill = createSkill("Metronome", createRandomQueue(rngVal));
		skill.initialize(togekiss, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(200);
	});

	test("plus should get extra ingredients", () => {
		const togekiss = createTestProfile({
			pokemonName: "Togekiss",
			skillLevel: 7,
		});
		const plusle = createTestProfile({
			pokemonName: "Plusle",
			skillLevel: 7,
		});
		const profiles = [togekiss, plusle];
		const sim = createTestSim(profiles);

		const ingCount = 18 / IngredientNames.length;

		// Togekiss gets eggs as extra ingredient
		const index = MetronomeCandidates.indexOf("Ingredient Magnet S (Plus)");
		const metronome = createSkill(
			"Metronome",
			createConstRng(index / MetronomeCandidates.length),
		);
		metronome.initialize(togekiss, profiles, testParam({}));
		metronome.apply(sim.members[0], 0, sim);
		expect(sim.members[0].progress.ingCounts.get("apple")).toBe(ingCount);
		expect(sim.members[0].progress.ingCounts.get("egg")).toBe(ingCount + 12);

		// Plusle doesn't get coffee as extra ingredient
		const plus = createSkill("Ingredient Magnet S (Plus)");
		plus.initialize(plusle, profiles, testParam({}));
		plus.apply(sim.members[1], 0, sim);
		expect(sim.members[1].progress.ingCounts.get("apple")).toBe(ingCount);
		expect(sim.members[1].progress.ingCounts.get("coffee")).toBe(ingCount);
	});
});
