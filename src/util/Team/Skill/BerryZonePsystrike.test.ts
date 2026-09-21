import { getSkillSubValue } from "../../MainSkill";
import {
	createTestMember,
	createTestSim,
	initSkill,
	testParam,
} from "../testHelpers";
import { BerryZonePsystrike } from "./BerryZonePsystrike";

// Berry Zone (Psystrike) raises the team's zone rate for the user's berry type
// by its sub-value (level 1 -> 0.6) every time it triggers.
describe("BerryZonePsystrike", () => {
	function build() {
		const caster = createTestMember({
			pokemonName: "Mewtwo",
			skillName: "Berry Zone (Psystrike)",
			skillLevel: 1,
		});
		const sim = createTestSim([caster]);
		const skill = new BerryZonePsystrike();
		initSkill(skill, caster.profile, [caster.profile], testParam());
		return { skill, caster, sim };
	}

	test("raises the berryZoneRate of the user's type", () => {
		const { skill, caster, sim } = build();
		const rate = getSkillSubValue("Berry Zone (Psystrike)", 1);

		skill.apply(caster, 0, sim);

		expect(sim.teamProgress.berryZoneRate).toEqual({ psychic: rate });
		expect(caster.progress.skillBerryZone).toBe(rate);
	});

	test("accumulates over repeated triggers", () => {
		const { skill, caster, sim } = build();
		const rate = getSkillSubValue("Berry Zone (Psystrike)", 1);

		skill.apply(caster, 0, sim);
		skill.apply(caster, 0, sim);

		expect(sim.teamProgress.berryZoneRate.psychic).toBeCloseTo(rate * 2);
	});

	test("caps the berryZoneRate at 24", () => {
		const { skill, caster, sim } = build();
		sim.teamProgress.berryZoneRate.psychic = 23.8;

		skill.apply(caster, 0, sim);
		expect(sim.teamProgress.berryZoneRate.psychic).toBe(24);

		skill.apply(caster, 0, sim);
		expect(sim.teamProgress.berryZoneRate.psychic).toBe(24);
	});
});
