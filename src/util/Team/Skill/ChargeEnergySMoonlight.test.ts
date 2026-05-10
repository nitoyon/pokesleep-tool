import { ChargeEnergySMoonlightSkill } from "./ChargeEnergySMoonlight";
import {
	createRandomQueue,
	createTestMember,
	createTestSim,
	testParam,
} from "./testHelpers";

// Charge Energy S (Moonlight) always recovers the caster's own energy, then
// with 50% chance (first rng draw < 0.5) also fires an Energizing Cheer.
describe("ChargeEnergySMoonlightSkill", () => {
	function setup(rng: () => number) {
		const caster = createTestMember({
			index: 0,
			skillName: "Charge Energy S (Moonlight)",
			skillLevel: 1,
		});
		const other = createTestMember({ index: 1 });
		const sim = createTestSim([caster, other]);
		const skill = new ChargeEnergySMoonlightSkill(rng);
		skill.initialize(
			caster.profile,
			[caster.profile, other.profile],
			testParam(),
		);
		return { skill, caster, other, sim, value: skill.skillValue };
	}

	test("roll >= 0.5: only the caster's energy is recovered", () => {
		const { skill, caster, other, sim, value } = setup(
			createRandomQueue([0.7]),
		);
		skill.apply(caster, 0, sim);
		expect(caster.progress.pendingEnergy).toBe(value);
		expect(other.progress.pendingEnergy).toBe(0);
	});

	test("roll < 0.5: an extra Energizing Cheer also fires", () => {
		// 1st draw picks the cheer branch; 2nd draw (0.1 < 0.65) targets the
		// lowest-energy member — both sit at 100, so the caster (index 0) wins.
		const { skill, caster, other, sim, value } = setup(
			createRandomQueue([0.2, 0.1]),
		);
		skill.apply(caster, 0, sim);
		expect(caster.progress.pendingEnergy).toBe(2 * value);
		expect(other.progress.pendingEnergy).toBe(0);
	});

	test("roll < 0.5 with a low-energy team-mate sends the cheer to them", () => {
		const { skill, caster, other, sim, value } = setup(
			createRandomQueue([0.2, 0.1]),
		);
		other.progress.energy = 10;
		skill.apply(caster, 0, sim);
		expect(caster.progress.pendingEnergy).toBe(value);
		expect(other.progress.pendingEnergy).toBe(value);
	});
});
