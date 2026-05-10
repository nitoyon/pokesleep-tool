import { CookingPowerUpMinusSkill } from "./CookingPowerUpMinus";
import {
	createConstRng,
	createRandomQueue,
	createTestMember,
	createTestSim,
} from "./testHelpers";

// Cooking Power-Up S (Minus) always extends the pot (level 1 -> 5). When two or
// more team-mates have a Plus/Minus skill it additionally fires an Energizing
// Cheer for its sub-value (level 1 -> 8).
describe("CookingPowerUpMinusSkill", () => {
	function build(rng: () => number, otherSkillNames: string[]) {
		const caster = createTestMember({
			index: 0,
			skillName: "Cooking Power-Up S (Minus)",
			skillLevel: 1,
		});
		const others = otherSkillNames.map((skillName, i) =>
			createTestMember({ index: i + 1, skillName: skillName as never }),
		);
		const members = [caster, ...others];
		const sim = createTestSim(members);
		const skill = new CookingPowerUpMinusSkill(rng);
		skill.initialize(
			caster.profile,
			members.map((m) => m.profile),
		);
		return { skill, caster, sim };
	}

	test("fewer than two Plus/Minus members: pot only, rng untouched", () => {
		// empty queue -> throws if the skill draws at all
		const { skill, caster, sim } = build(createRandomQueue([]), [
			"Charge Strength S",
		]);
		skill.apply(caster, 0, sim);
		expect(sim.teamProgress.potExtended).toBe(5);
		expect(caster.progress.pendingEnergy).toBe(0);
	});

	test("two Plus/Minus members: also cheers via the injected rng", () => {
		// rng 0 -> cheer targets member 0 (the caster)
		const { skill, caster, sim } = build(createConstRng(0), [
			"Cooking Power-Up S (Minus)",
			"Cooking Power-Up S (Plus)",
		]);
		skill.apply(caster, 0, sim);
		expect(sim.teamProgress.potExtended).toBe(5);
		expect(caster.progress.pendingEnergy).toBe(8);
	});
});
