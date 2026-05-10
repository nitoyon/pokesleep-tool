import { ExtraHelpfulSkill } from "./ExtraHelpful";
import {
	createConstRng,
	createTestMember,
	createTestSim,
	testParam,
} from "./testHelpers";

// Extra Helpful S queues `count` extra helps (level 1 -> 6) for one member,
// chosen uniformly as index = floor(rng() * memberCount).
describe("ExtraHelpfulSkill", () => {
	function setup(rng: () => number) {
		const members = [
			createTestMember({
				index: 0,
				skillName: "Extra Helpful S",
				skillLevel: 1,
			}),
			createTestMember({ index: 1 }),
			createTestMember({ index: 2 }),
		];
		const sim = createTestSim(members);
		const skill = new ExtraHelpfulSkill(rng);
		skill.initialize(
			members[0].profile,
			members.map((m) => m.profile),
			testParam(),
		);
		return { skill, sim };
	}

	test.each([
		[0, 0],
		[0.5, 1],
		[0.99, 2],
	])("rng() = %d queues the helps on member %d", (r, target) => {
		const { skill, sim } = setup(createConstRng(r));
		skill.apply(sim.members[0], 0, sim);

		sim.members.forEach((m, i) => {
			expect(m.progress.pendingExtraHelp).toBe(i === target ? 6 : 0);
		});
	});

	test("triggers stack on the same member", () => {
		const { skill, sim } = setup(createConstRng(0));
		skill.apply(sim.members[0], 0, sim);
		skill.apply(sim.members[0], 0, sim);
		expect(sim.members[0].progress.pendingExtraHelp).toBe(12);
	});
});
