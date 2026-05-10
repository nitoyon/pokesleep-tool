import { MetronomeCandidates } from "./Metronome";
import { createSkill } from "./SkillFactory";
import {
	createConstRng,
	createMewProfile,
	createTestProfile,
	createTestSim,
	testParam,
} from "./testHelpers";

// MetronomeSkill is reached through SkillFactory (createSkill) so the Skill
// module graph — which has a circular dependency between SkillFactory and the
// delegating handlers — evaluates in the same order as production.

describe("MetronomeSkill", () => {
	/** rng value that makes `Math.floor(rng * len)` land on `index`. */
	const pick = (index: number) => index / MetronomeCandidates.length;

	test("delegates to the candidate selected by rng", () => {
		const index = MetronomeCandidates.indexOf("Charge Strength S");
		const mew = createMewProfile("Metronome");
		const profiles = [mew];

		const skill = createSkill("Metronome", createConstRng(pick(index)));
		skill.initialize(mew, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		// Charge Strength S value at level 1 is 400.
		expect(sim.members[0].progress.skillStrength).toBe(400);
	});

	test("field bonus flows through to the delegated skill", () => {
		const index = MetronomeCandidates.indexOf("Charge Strength S");
		const mew = createMewProfile("Metronome");
		const profiles = [mew];

		const skill = createSkill("Metronome", createConstRng(pick(index)));
		skill.initialize(mew, profiles, testParam({ fieldBonus: 50 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(Math.ceil(400 * 1.5));
	});

	test("unresolvable candidates fall back to a no-op instead of throwing", () => {
		// Ingredient Draw S on Mew throws (no ingredient list); Berry Burst on a
		// one-member team throws. initialize() must swallow both, and apply()
		// must be safe for every candidate index.
		const mew = createMewProfile("Metronome");
		mew.skillLevel = 7; // Metronome max; Berry Burst maxes at 6 -> level cap.
		const profiles = [mew];

		let roll = 0;
		const skill = createSkill("Metronome", () => roll);
		expect(() =>
			skill.initialize(mew, profiles, testParam({ fieldBonus: 0 })),
		).not.toThrow();

		const sim = createTestSim(profiles);
		for (let i = 0; i < MetronomeCandidates.length; i++) {
			roll = pick(i);
			expect(() => skill.apply(sim.members[0], 0, sim)).not.toThrow();
		}
	});

	test("forwards its rng to candidates resolved during initialize", () => {
		const index = MetronomeCandidates.indexOf("Charge Strength S (Random)");
		const mew = createMewProfile("Metronome");
		const profiles = [mew];

		// The same const rng picks the candidate and drives its internal draw.
		const skill = createSkill("Metronome", createConstRng(pick(index)));
		skill.initialize(mew, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBeGreaterThan(0);
		expect(Number.isInteger(sim.members[0].progress.skillStrength)).toBe(true);
	});

	test("via Versatile: Mew's default skill delegates through Metronome", () => {
		const index = MetronomeCandidates.indexOf("Charge Strength S");
		const mew = createMewProfile("Metronome");
		const profiles = [mew, createTestProfile({ index: 1 })];

		const skill = createSkill("Versatile", createConstRng(pick(index)));
		skill.initialize(mew, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(400);
	});
});
