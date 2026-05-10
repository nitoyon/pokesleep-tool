import { ChargeStrengthSRandomSkill } from "./ChargeStrengthSRandom";
import {
	applySkill,
	createConstRng,
	createTestMember,
	createTestSim,
	testParam,
} from "./testHelpers";

// Charge Strength S (Random) level 1 rolls a strength in [200, 800] scaled by
// rand/150, where rand = floor(rng() * 151).
describe("ChargeStrengthSRandomSkill", () => {
	function setup(fieldBonus: number, rng: () => number) {
		const member = createTestMember({
			skillName: "Charge Strength S (Random)",
			skillLevel: 1,
		});
		const sim = createTestSim([member], { fieldBonus });
		const skill = new ChargeStrengthSRandomSkill(rng);
		skill.initialize(
			member.profile,
			[member.profile],
			testParam({ fieldBonus }),
		);
		return { skill, member, sim };
	}

	test("rng() = 0 yields the low end of the range", () => {
		const { skill, member, sim } = setup(0, createConstRng(0));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(200);
	});

	test("rng() near 1 yields (almost) the high end of the range", () => {
		// rand = floor(0.999 * 151) = 150
		const { skill, member, sim } = setup(0, createConstRng(0.999));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(800);
	});

	test("a mid roll interpolates linearly", () => {
		// rand = floor(0.5 * 151) = 75
		const { skill, member, sim } = setup(0, createConstRng(0.5));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(
			Math.ceil(200 + ((800 - 200) * 75) / 150),
		);
	});

	test("field bonus scales the rolled strength", () => {
		const { skill, member, sim } = setup(50, createConstRng(0));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(Math.ceil(200 * 1.5));
	});

	test("each trigger draws once and accumulates", () => {
		const { skill, member, sim } = setup(0, createConstRng(0));
		applySkill(skill, member, 0, sim);
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillStrength).toBe(400);
	});
});
