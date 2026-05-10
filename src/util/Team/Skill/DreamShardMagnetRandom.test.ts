import { DreamShardMagnetRandomSkill } from "./DreamShardMagnetRandom";
import {
	applySkill,
	createConstRng,
	createTestMember,
	createTestSim,
	initSkill,
	testParam,
} from "./testHelpers";

// Dream Shard Magnet S (Random) level 1 rolls shards in [120, 480] scaled by
// rand/150 (rand = floor(rng() * 151)), then multiplied by the dream-shard bonus.
describe("DreamShardMagnetRandomSkill", () => {
	function setup(rng: () => number) {
		const member = createTestMember({
			skillName: "Dream Shard Magnet S (Random)",
			skillLevel: 1,
		});
		const sim = createTestSim([member]);
		const skill = new DreamShardMagnetRandomSkill(rng);
		initSkill(skill, member.profile, [member.profile], testParam());
		const bonus = member.profile.bonus.dreamShard;
		return { skill, member, sim, bonus };
	}

	test("rng() = 0 yields the low end of the range", () => {
		const { skill, member, sim, bonus } = setup(createConstRng(0));
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(Math.ceil(120 * bonus));
	});

	test("rng() near 1 yields (almost) the high end of the range", () => {
		const { skill, member, sim, bonus } = setup(createConstRng(0.999)); // rand=150
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(Math.ceil(480 * bonus));
	});

	test("a mid roll interpolates linearly", () => {
		const { skill, member, sim, bonus } = setup(createConstRng(0.5)); // rand=75
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(
			Math.ceil((120 + ((480 - 120) * 75) / 150) * bonus),
		);
	});

	test("shards accumulate across triggers and never touch skillStrength", () => {
		const { skill, member, sim, bonus } = setup(createConstRng(0));
		applySkill(skill, member, 0, sim);
		applySkill(skill, member, 0, sim);
		expect(member.progress.skillDreamShards).toBe(2 * Math.ceil(120 * bonus));
		expect(member.progress.skillStrength).toBe(0);
	});
});
