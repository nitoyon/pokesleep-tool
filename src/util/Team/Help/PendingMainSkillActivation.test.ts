import { createTestMember, createTestSim } from "../Skill/testHelpers";
import type { Skill, TeamContext, TeamMember } from "../Types";
import { applyPendingMainSkillActivation } from "./PendingMainSkillActivation";

describe("applyPendingMainSkillActivation", () => {
	test("does nothing when no member carries the bonus", () => {
		const skill = recordingSkill();
		const member = createTestMember({ skill }, { skillCount: 0 });
		const sim = createTestSim([member]);

		applyPendingMainSkillActivation(sim, 0);

		expect(skill.calls).toBe(0);
		expect(member.progress.skillCount).toBe(0);
	});

	test("fires a non-Nuzzle bonus holder once, clears the flag and counts it", () => {
		const skill = recordingSkill();
		const member = createTestMember(
			{ skill, skillName: "Charge Strength S" },
			{ hasMainSkillActivationBonus: true, skillCount: 3 },
		);
		const sim = createTestSim([member]);

		applyPendingMainSkillActivation(sim, 42);

		expect(skill.calls).toBe(1);
		expect(member.progress.hasMainSkillActivationBonus).toBe(false);
		expect(member.progress.skillCount).toBe(4);
	});

	test("forwards tapSec to the fired skill", () => {
		let seenTapSec = -1;
		const skill = recordingSkill((_m, tapSec) => {
			seenTapSec = tapSec;
		});
		const member = createTestMember(
			{ skill },
			{ hasMainSkillActivationBonus: true },
		);
		const sim = createTestSim([member]);

		applyPendingMainSkillActivation(sim, 123);

		expect(seenTapSec).toBe(123);
	});

	test("resolves a Nuzzle bonus that grants a new bonus in a later round", () => {
		const nuzzleSkill = recordingSkill((_member, _tapSec, sim) => {
			// First activation cheers member 1 into the activation bonus.
			sim.members[1].progress.hasMainSkillActivationBonus = true;
		});
		const targetSkill = recordingSkill();

		const nuzzle = createTestMember(
			{
				index: 0,
				skill: nuzzleSkill,
				skillName: "Energizing Cheer S (Nuzzle)",
			},
			{ hasMainSkillActivationBonus: true },
		);
		const target = createTestMember(
			{ index: 1, skill: targetSkill, skillName: "Charge Strength S" },
			{ hasMainSkillActivationBonus: false },
		);
		const sim = createTestSim([nuzzle, target]);

		applyPendingMainSkillActivation(sim, 0);

		expect(nuzzleSkill.calls).toBe(1);
		expect(targetSkill.calls).toBe(1);
		expect(nuzzle.progress.hasMainSkillActivationBonus).toBe(false);
		expect(target.progress.hasMainSkillActivationBonus).toBe(false);
		expect(nuzzle.progress.skillCount).toBe(1);
		expect(target.progress.skillCount).toBe(1);
	});

	test("resolves non-Nuzzle holders before Nuzzle holders within a round", () => {
		const order: string[] = [];
		const nonNuzzleSkill = recordingSkill(() => order.push("plain"));
		const nuzzleSkill = recordingSkill(() => order.push("nuzzle"));

		// Nuzzle listed first so array order alone would resolve it first.
		const nuzzle = createTestMember(
			{
				index: 0,
				skill: nuzzleSkill,
				skillName: "Energizing Cheer S (Nuzzle)",
			},
			{ hasMainSkillActivationBonus: true },
		);
		const plain = createTestMember(
			{ index: 1, skill: nonNuzzleSkill, skillName: "Charge Strength S" },
			{ hasMainSkillActivationBonus: true },
		);
		const sim = createTestSim([nuzzle, plain]);

		applyPendingMainSkillActivation(sim, 0);

		expect(order).toEqual(["plain", "nuzzle"]);
	});

	test("passes an explicit rng down to handlers that accept one", () => {
		const rng = () => 0.5;
		let injected: (() => number) | undefined;
		const skill: Skill & { calls: number } = {
			calls: 0,
			initialize() {},
			apply() {
				this.calls++;
			},
			setRng(r) {
				injected = r;
			},
		};
		const member = createTestMember(
			{ skill },
			{ hasMainSkillActivationBonus: true },
		);
		const sim = createTestSim([member]);

		applyPendingMainSkillActivation(sim, 0, rng);

		expect(injected).toBe(rng);
		expect(skill.calls).toBe(1);
	});
});

/** A skill stub that records every apply() call. */
function recordingSkill(
	onApply?: (member: TeamMember, tapSec: number, sim: TeamContext) => void,
): Skill & { calls: number } {
	return {
		calls: 0,
		initialize() {},
		apply(member, tapSec, sim) {
			this.calls++;
			onApply?.(member, tapSec, sim);
		},
	};
}
