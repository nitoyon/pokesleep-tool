import { addEnergizingCheer, EnergizingCheerSkill } from "./EnergizingCheer";
import { EnergizingCheerHealPulseSkill } from "./EnergizingCheerHealPulse";
import { EnergizingCheerNuzzleSkill } from "./EnergizingCheerNuzzleSkill";
import {
	createConstRng,
	createRandomQueue,
	createTestMember,
	createTestSim,
	testParam,
} from "./testHelpers";

// addEnergizingCheer draws once: rand < 0.65 targets the lowest-energy member
// (ties broken by rand/0.65), otherwise it targets floor((rand - 0.65) * n).
describe("addEnergizingCheer", () => {
	test("rand < 0.65 with everyone level: ties resolve by rand/0.65", () => {
		const sim = createTestSim([
			createTestMember({ index: 0 }),
			createTestMember({ index: 1 }),
		]);
		expect(addEnergizingCheer(0, 20, sim, createConstRng(0))).toBe(0);
		expect(sim.members[0].progress.pendingEnergy).toBe(20);

		// floor((0.5 / 0.65) * 2) = 1
		expect(addEnergizingCheer(0, 20, sim, createConstRng(0.5))).toBe(1);
		expect(sim.members[1].progress.pendingEnergy).toBe(20);
	});

	test("rand < 0.65 always targets the single lowest-energy member", () => {
		const sim = createTestSim([
			createTestMember({ index: 0 }),
			createTestMember({ index: 1 }, { energy: 5 }),
		]);
		expect(addEnergizingCheer(0, 20, sim, createConstRng(0.6))).toBe(1);
		expect(sim.members[1].progress.pendingEnergy).toBe(20);
	});

	test("rand >= 0.65 selects from all members by floor((rand - 0.65) * n)", () => {
		const sim = createTestSim([
			createTestMember({ index: 0 }),
			createTestMember({ index: 1 }),
			createTestMember({ index: 2 }),
			createTestMember({ index: 3 }),
		]);
		// floor((0.99 - 0.65) * 4) = floor(1.36) = 1
		expect(addEnergizingCheer(0, 12, sim, createConstRng(0.99))).toBe(1);
		expect(sim.members[1].progress.pendingEnergy).toBe(12);
	});
});

describe("EnergizingCheerSkill", () => {
	test("hands its skillValue to addEnergizingCheer via the injected rng", () => {
		const member = createTestMember({
			skillName: "Energizing Cheer S",
			skillLevel: 1,
		});
		const other = createTestMember({ index: 1 });
		const sim = createTestSim([member, other]);
		const skill = new EnergizingCheerSkill(createConstRng(0)); // target member 0
		skill.initialize(
			member.profile,
			[member.profile, other.profile],
			testParam(),
		);

		skill.apply(member, 0, sim);

		// Energizing Cheer S value at level 1 is 12.
		expect(skill.skillValue).toBe(12);
		expect(member.progress.pendingEnergy).toBe(12);
	});
});

describe("EnergizingCheerNuzzleSkill", () => {
	function setup(rng: () => number) {
		const caster = createTestMember({
			index: 0,
			skillName: "Energizing Cheer S (Nuzzle)",
			skillLevel: 1,
		});
		const other = createTestMember({ index: 1 });
		const sim = createTestSim([caster, other]);
		const skill = new EnergizingCheerNuzzleSkill(rng);
		skill.initialize(
			caster.profile,
			[caster.profile, other.profile],
			testParam(),
		);
		return { skill, caster, other, sim };
	}

	test("second draw = 0 grants the activation bonus to the cheered member", () => {
		// cheer -> member 0, then activation-bonus draw = 0
		const { skill, caster, sim } = setup(createRandomQueue([0, 0]));
		skill.apply(caster, 0, sim);
		expect(caster.progress.hasMainSkillActivationBonus).toBe(true);
	});

	test("second draw near 1 leaves the activation bonus untouched", () => {
		const { skill, caster, sim } = setup(createRandomQueue([0, 0.9999]));
		skill.apply(caster, 0, sim);
		expect(caster.progress.hasMainSkillActivationBonus).toBe(false);
	});
});

describe("EnergizingCheerHealPulseSkill", () => {
	test("splits energy and pending help between two distinct members", () => {
		const a = createTestMember({
			index: 0,
			skillName: "Energizing Cheer S (Heal Pulse)",
			skillLevel: 1,
		});
		const b = createTestMember({ index: 1 });
		const c = createTestMember({ index: 2 });
		const sim = createTestSim([a, b, c]);
		// 1st draw 0.99 -> else-branch floor((0.99 - 0.65) * 3) = 1, so the
		// first target is member 1 (b). It is spliced out; the 2nd draw 0
		// targets the first of the remaining pair (a).
		const skill = new EnergizingCheerHealPulseSkill(
			createRandomQueue([0.99, 0]),
		);
		skill.initialize(a.profile, [a.profile, b.profile, c.profile], testParam());

		skill.apply(a, 0, sim);

		// Energizing Cheer S (Heal Pulse) value at level 1 is 6.
		expect(skill.skillValue).toBe(6);
		expect(a.progress.pendingEnergy).toBe(6);
		expect(b.progress.pendingEnergy).toBe(6);
		expect(a.progress.pendingExtraHelp).toBe(6);
		expect(b.progress.pendingExtraHelp).toBe(6);
		expect(c.progress.pendingEnergy).toBe(0);
		expect(c.progress.pendingExtraHelp).toBe(0);
	});
});
