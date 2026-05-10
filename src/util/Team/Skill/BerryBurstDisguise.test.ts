// Import through SkillFactory first so the circular Skill module graph
// (SkillFactory <-> BerryBurst family) evaluates in production order.
import type { BerryBurstDisguiseSkill } from "./BerryBurstDisguise";
import { createSkill } from "./SkillFactory";
import {
	applySkill,
	createConstRng,
	createTestMember,
	createTestSim,
} from "./testHelpers";

// Berry Burst (Disguise) adds its precomputed skillValue every trigger, and a
// Great Success (roll < disguiseSuccessRate = 0.185) adds it a second time —
// but only for the Disguise owner, and at most once per day.
describe("BerryBurstDisguiseSkill", () => {
	function setup(roll: number, pokemonName = "Mimikyu") {
		const member = createTestMember({ pokemonName });
		const sim = createTestSim([member]);
		const skill = createSkill(
			"Berry Burst (Disguise)",
			createConstRng(roll),
		) as BerryBurstDisguiseSkill;
		skill.skillValue = 100; // stub; initialize() needs a full Berry Burst team
		return { skill, member, sim };
	}

	test("no Great Success: adds skillValue once", () => {
		const { skill, member, sim } = setup(0.5);
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(100);
		expect(member.progress.disguiseGreatSuccess).toBe(false);
	});

	test("Great Success: doubles the contribution and latches the flag", () => {
		const { skill, member, sim } = setup(0.1);
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(200);
		expect(member.progress.disguiseGreatSuccess).toBe(true);
	});

	test("Great Success fires at most once per day", () => {
		const { skill, member, sim } = setup(0.1);
		applySkill(skill, member, 0, sim); // 200
		applySkill(skill, member, 0, sim); // +100 only, flag already set
		expect(member.progress.skillStrength).toBe(300);
	});

	test("a non-Disguise owner (Skill Copy trigger) never Great Successes", () => {
		const { skill, member, sim } = setup(0.1, "Raichu");
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(100);
		expect(member.progress.disguiseGreatSuccess).toBe(false);
	});
});
