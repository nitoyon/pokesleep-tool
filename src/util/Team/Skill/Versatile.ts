import { getMaxSkillLevel, type MainSkillName } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, Skill, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { createSkill } from "./SkillFactory";

/**
 * Versatile (Mew).
 *
 * Mew has no effect of its own; every activation triggers the skill chosen in
 * `iv.versatileSkill` (one of VersatileCandidates, or Metronome by default).
 * This handler resolves that skill once and forwards both phases to its
 * handler, mirroring how {@link SkillCopySkill} delegates to a copied target.
 */
export class VersatileSkill extends BaseSkill {
	/** Handler for the resolved skill; a no-op until initialize() runs. */
	private target: Skill = new (class extends BaseSkill {})();

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		// Find versatile skill
		const skillName: MainSkillName = profile.iv.versatileSkill;
		if (skillName === "Versatile") {
			return;
		}

		const skillLevel = Math.min(
			profile.skillLevel,
			getMaxSkillLevel(skillName),
		);
		const resolved: MemberProfile = { ...profile, skillName, skillLevel };

		this.target = createSkill(skillName, this.rng);
		this.target.initialize(resolved, profiles, param);
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		this.target.apply(member, tapSec, sim);
	}
}
