import type { StrengthParameter } from "../../PokemonStrength";
import { addEnergyToAll } from "../TeamEnergy";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { calculateBerryBurstSkillValue } from "./BerryBurst";

/**
 * Energy for Everyone S (Lunar Blessing).
 *
 * Despite its "Energy for Everyone S" name, its skillValue2 is computed via
 * the same Berry Burst team-strength calculation used by
 * Berry Burst / (Disguise) / (Draco Meteor).
 */
export class EnergyForEveryoneLunarBlessingSkill extends BaseSkill {
	skillValue2 = 0;

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		super.initialize(profile, profiles, param);
		this.skillValue2 = calculateBerryBurstSkillValue(
			profile,
			profiles,
			param,
			profile.skillName,
		);
	}

	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		const { progress } = member;
		addEnergyToAll(this.skillValue, sim);
		progress.skillStrength += this.skillValue2;
	}
}
