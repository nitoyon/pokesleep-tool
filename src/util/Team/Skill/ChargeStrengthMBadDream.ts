import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import { addPendingEnergy } from "../TeamEnergy";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Charge Strength M (Bad Dreams).
 */
export class ChargeStrengthMBadDreamSkill extends BaseSkill {
	skillValue = 0;

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.skillValue = Math.ceil(
			getSkillValue(skillName, skillLevel) * (1 + param.fieldBonus / 100),
		);
	}

	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		member.progress.skillStrength += this.skillValue;

		for (const member of sim.members) {
			if (member.profile.iv.pokemon.type === "dark") {
				continue;
			}
			addPendingEnergy(sim, member.profile.index, -12);
		}
	}
}
