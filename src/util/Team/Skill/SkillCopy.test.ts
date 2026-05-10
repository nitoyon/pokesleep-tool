import type { MainSkillName } from "../../MainSkill";
import { createSkill } from "./SkillFactory";
import {
	createConstRng,
	createTestProfile,
	createTestSim,
	testParam,
} from "./testHelpers";

describe("SkillCopySkill", () => {
	test("rng picks which copyable target is triggered", () => {
		// Two copyable targets: Charge Strength M (880 @ lv1) and
		// Charge Strength S (400 @ lv1). targets[] follows profile order.
		const caster = copyProfile(0, "Skill Copy (Transform)");
		const profiles = [
			caster,
			copyProfile(1, "Charge Strength M"),
			copyProfile(2, "Charge Strength S"),
		];

		let roll = 0;
		const skill = createSkill("Skill Copy (Transform)", () => roll);
		skill.initialize(caster, profiles, testParam({ fieldBonus: 0 }));
		const sim = createTestSim(profiles);

		roll = 0; // targets[0] -> Charge Strength M
		skill.apply(sim.members[0], 0, sim);
		expect(sim.members[0].progress.skillStrength).toBe(880);

		roll = 0.99; // targets[1] -> Charge Strength S
		sim.members[0].progress.skillStrength = 0;
		skill.apply(sim.members[0], 0, sim);
		expect(sim.members[0].progress.skillStrength).toBe(400);
	});

	test("non-copyable skills are never chosen as a copy target", () => {
		const caster = copyProfile(0, "Skill Copy (Transform)");
		const badDreams = copyProfile(1, "Charge Strength M (Bad Dreams)");
		const healPulse = copyProfile(2, "Energizing Cheer S (Heal Pulse)");
		const profiles = [caster, badDreams, healPulse];

		let roll = 0;
		const skill = createSkill("Skill Copy (Transform)", () => roll);
		skill.initialize(caster, profiles, testParam({ fieldBonus: 0 }));

		// Only unusable targets remain, so every trigger falls back to
		// Charge Strength S no matter what is rolled.
		const sim = createTestSim(profiles);
		for (const r of [0, 0.5, 0.99]) {
			roll = r;
			sim.members[0].progress.skillStrength = 0;
			skill.apply(sim.members[0], 0, sim);
			expect(sim.members[0].progress.skillStrength).toBe(400);
		}
	});

	test("copies the target's skill using the caster's own skill level", () => {
		const caster = copyProfile(0, "Skill Copy (Transform)", "Ditto");
		caster.skillLevel = 3;
		const target = copyProfile(1, "Ingredient Draw S", "Sandslash");
		target.skillLevel = 1;
		const profiles = [caster, target];

		// rng 0.99 -> Skill Copy's single target, then Ingredient Draw's last ing.
		const skill = createSkill("Skill Copy (Transform)", createConstRng(0.99));
		skill.initialize(caster, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		const gained = [...sim.members[0].progress.ingCounts.entries()];
		expect(gained).toHaveLength(1);
		const [name, count] = gained[0];
		expect(count).toBe(8); // Ingredient Draw S value at level 3

		// The ingredient must be one of Sandslash's, not Ditto's.
		const sandslashIngs = new Set(
			[target.iv.pokemon.ing1, target.iv.pokemon.ing2, target.iv.pokemon.ing3]
				.filter((x) => x !== undefined)
				.map((x) => x.name),
		);
		const dittoIngs = new Set(
			[caster.iv.pokemon.ing1, caster.iv.pokemon.ing2, caster.iv.pokemon.ing3]
				.filter((x) => x !== undefined)
				.map((x) => x.name),
		);
		expect(sandslashIngs.has(name)).toBe(true);
		expect(dittoIngs.has(name)).toBe(false);
	});

	test("caps the copied skill level at the copied skill's max level", () => {
		// Ditto's copy level is 7, but Energy for Everyone S maxes at level 6.
		// Initializing it at level 7 would throw; the cap keeps it valid.
		const caster = copyProfile(0, "Skill Copy (Transform)", "Ditto");
		caster.skillLevel = 7;
		const target = copyProfile(1, "Energy for Everyone S", "Jigglypuff");
		const profiles = [caster, target];

		const skill = createSkill("Skill Copy (Transform)");
		expect(() =>
			skill.initialize(caster, profiles, testParam({ fieldBonus: 0 })),
		).not.toThrow();

		const sim = createTestSim(profiles);
		expect(() => skill.apply(sim.members[0], 0, sim)).not.toThrow();
		expect(sim.members[0].progress.pendingEnergy).toBe(18);
	});

	test("copying a Berry Burst target does not throw", () => {
		// Berry Burst strength needs a full 5-member team.
		const caster = copyProfile(0, "Skill Copy (Transform)", "Ditto");
		const target = copyProfile(1, "Berry Burst", "Sceptile");
		const profiles = [
			caster,
			target,
			copyProfile(2, "Charge Strength S"),
			copyProfile(3, "Charge Strength S"),
			copyProfile(4, "Charge Strength S"),
		];

		const skill = createSkill("Skill Copy (Transform)");
		expect(() =>
			skill.initialize(caster, profiles, testParam({ fieldBonus: 0 })),
		).not.toThrow();

		const sim = createTestSim(profiles);
		expect(() => skill.apply(sim.members[0], 0, sim)).not.toThrow();
	});

	test("falls back to Charge Strength S when no other member is copyable", () => {
		const caster = copyProfile(0, "Skill Copy (Transform)");
		const other = copyProfile(1, "Berry Burst (Draco Meteor)");
		const profiles = [caster, other];

		const skill = createSkill("Skill Copy (Transform)");
		skill.initialize(caster, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		// Charge Strength S value at level 1 is 400.
		expect(sim.members[0].progress.skillStrength).toBe(400);
	});

	test("falls back to Charge Strength S when another Skill Copy is picked", () => {
		const caster = copyProfile(0, "Skill Copy (Transform)");
		const other = copyProfile(1, "Skill Copy (Mimic)");
		const profiles = [caster, other];

		const skill = createSkill("Skill Copy (Transform)");
		skill.initialize(caster, profiles, testParam({ fieldBonus: 0 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(400);
	});

	test("field bonus scales the Charge Strength S fallback", () => {
		const caster = copyProfile(0, "Skill Copy (Transform)");
		const profiles = [caster, copyProfile(1, "Berry Burst (Draco Meteor)")];

		const skill = createSkill("Skill Copy (Transform)");
		skill.initialize(caster, profiles, testParam({ fieldBonus: 50 }));

		const sim = createTestSim(profiles);
		skill.apply(sim.members[0], 0, sim);

		expect(sim.members[0].progress.skillStrength).toBe(Math.ceil(400 * 1.5));
	});
});

function copyProfile(
	index: number,
	skillName: MainSkillName,
	pokemonName = "Raichu",
) {
	return createTestProfile({ index, skillName, pokemonName });
}
