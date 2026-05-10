import { getSkillRandomRange } from "../../MainSkill";
import type { MemberProfile, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Dream Shard Magnet S (Random).
 */
export class DreamShardMagnetRandomSkill extends BaseSkill {
	min = 0;
	max = 0;

	initialize(profile: MemberProfile): void {
		const [min, max] = getSkillRandomRange(
			profile.skillName,
			profile.skillLevel,
		);
		this.min = min;
		this.max = max;
	}

	apply(member: TeamMember): void {
		member.progress.skillDreamShards += calcDreamShardMagnetRandom(
			member.profile,
			this.rng,
		);
	}
}

function calcDreamShardMagnetRandom(
	profile: MemberProfile,
	rng: () => number,
): number {
	const [min, max] = getSkillRandomRange(profile.skillName, profile.skillLevel);
	const rand = Math.floor(rng() * 151);
	const value = min + ((max - min) * rand) / 150;
	return Math.ceil(value * profile.bonus.dreamShard);
}
