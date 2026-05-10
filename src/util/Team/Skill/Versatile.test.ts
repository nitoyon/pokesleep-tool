import { createSkill } from "./SkillFactory";
import {
	createConstRng,
	createMewProfile,
	createTestProfile,
	createTestSim,
	testParam,
} from "./testHelpers";

// VersatileSkill is reached through SkillFactory (createSkill) so the Skill
// module graph — which has a circular dependency between SkillFactory and the
// delegating handlers — evaluates in the same order as production.

describe("VersatileSkill", () => {
	test("delegates to the skill named by versatileSkill", () => {
		const mew = createMewProfile("Charge Strength M");
		const profiles = [mew, createTestProfile({ index: 1 })];

		const skill = createSkill("Versatile");
		skill.initialize(mew, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		// Charge Strength M value at level 1 is 880.
		expect(sim.members[0].progress.skillStrength).toBe(880);
	});

	test("field bonus flows through to the delegated skill", () => {
		const mew = createMewProfile("Charge Strength M");
		const profiles = [mew];

		const skill = createSkill("Versatile");
		skill.initialize(mew, profiles, testParam({ fieldBonus: 50 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(Math.ceil(880 * 1.5));
	});

	test("caps the skill level at the resolved skill's max level", () => {
		// Versatile allows skill level up to 8, but Berry Burst maxes at 6.
		// Initializing it at level 8 would throw; the cap keeps it valid.
		const mew = createMewProfile("Berry Burst", { skillLevel: 8 });
		const profiles = [
			mew,
			createTestProfile({ index: 1 }),
			createTestProfile({ index: 2 }),
			createTestProfile({ index: 3 }),
			createTestProfile({ index: 4 }),
		];

		const skill = createSkill("Versatile");
		expect(() =>
			skill.initialize(mew, profiles, testParam({ fieldBonus: 0 })),
		).not.toThrow();

		const sim = createTestSim(profiles);
		expect(() => skill.apply(sim.members[0], 0, sim)).not.toThrow();
	});

	test("forwards its rng to the delegated randomized handler", () => {
		const mew = createMewProfile("Charge Strength S (Random)");
		const profiles = [mew];

		// rand = floor(0.99 * 151) = 149 of 150 -> near the top of the range.
		const skill = createSkill("Versatile", createConstRng(0.99));
		skill.initialize(mew, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		// Charge Strength S (Random) range at level 1 is [200, 800]; rand=149/150
		// of the way up -> 200 + 600 * 149/150 = 796.
		expect(sim.members[0].progress.skillStrength).toBe(
			Math.ceil(200 + ((800 - 200) * 149) / 150),
		);
	});
});
