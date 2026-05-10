import type { MainSkillName } from "../../MainSkill";
import type { TeamContext, TeamMember } from "../Types";

/**
 * Energizing Cheer S (Nuzzle) is the only skill whose activation-bonus resolution
 * can itself hand out a new {@link MemberProgress.hasMainSkillActivationBonus},
 * so it is resolved after every other bonus holder in each round.
 */
const NUZZLE_SKILL: MainSkillName = "Energizing Cheer S (Nuzzle)";

/**
 * Safety cap on resolution rounds. A Nuzzle bonus can grant another Nuzzle bonus,
 * which in a pathological team could chain forever; bail out rather than hang.
 */
const MAX_ROUNDS = 3;

/**
 * Resolve every member's queued main skill activation bonus (granted by
 * Energizing Cheer S (Nuzzle)) and clear the flag.
 *
 * Each round runs in two phases:
 *  1. Non-Nuzzle bonus holders fire their main skill. These never grant a new
 *     activation bonus, so the set is stable within the phase.
 *  2. Nuzzle bonus holders fire their main skill. This *may* set
 *     `hasMainSkillActivationBonus` on other members (including ones already
 *     resolved this round).
 *
 * If any member still carries the flag after phase 2, the whole pass repeats.
 *
 * @param sim Simulation state.
 * @param tapSec Absolute time (seconds) the triggering tap resolved at; forwarded
 *   to `skill.apply` so energy-aware skills read the right state.
 * @param rng When given, replaces each handler's RNG source before it fires
 *   (mirrors {@link createSkill}); omit to keep each handler's own source.
 */
export function applyPendingMainSkillActivation(
	sim: TeamContext,
	tapSec: number,
	rng?: () => number,
): void {
	for (let round = 0; round < MAX_ROUNDS; round++) {
		const nonNuzzle = sim.members.filter(
			(m) =>
				m.progress.hasMainSkillActivationBonus &&
				m.profile.skillName !== NUZZLE_SKILL,
		);
		for (const member of nonNuzzle) {
			fireActivationBonus(member, tapSec, sim, rng);
		}

		const nuzzle = sim.members.filter(
			(m) =>
				m.progress.hasMainSkillActivationBonus &&
				m.profile.skillName === NUZZLE_SKILL,
		);
		for (const member of nuzzle) {
			fireActivationBonus(member, tapSec, sim, rng);
		}

		if (nonNuzzle.length === 0 && nuzzle.length === 0) {
			return;
		}
	}
}

/**
 * Consume one member's activation bonus: clear the flag, count the trigger the
 * same way a normal tap trigger is counted in {@link applyHelp}, then run the
 * skill effect.
 */
function fireActivationBonus(
	member: TeamMember,
	tapSec: number,
	sim: TeamContext,
	rng: (() => number) | undefined,
): void {
	member.progress.hasMainSkillActivationBonus = false;
	member.progress.skillCount += 1;

	if (rng !== undefined) {
		member.profile.skill.setRng?.(rng);
	}
	member.profile.skill.apply(member, tapSec, sim);
}
