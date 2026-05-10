import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { addEnergizingCheer } from "./EnergizingCheer";

/**
 * Energizing Cheer S (Heal Pulse).
 */
export class EnergizingCheerHealPulseSkill extends BaseSkill {
	skillValue2 = 0;

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		super.initialize(profile, profiles, param);

		const skillName = profile.skillName;
		const skillLevel = profile.skillLevel;
		this.skillValue2 = getSkillValue(skillName, skillLevel);
		if (
			profiles.some((x) => x.iv.pokemon.skill === "Berry Burst (Draco Meteor)")
		) {
			const bonus = skillLevel <= 2 ? 1 : skillLevel <= 5 ? 2 : 3;
			this.skillValue2 += bonus;
		}
	}

	apply(_member: TeamMember, tapSec: number, sim: TeamContext): void {
		addHealPulse(tapSec, this.skillValue, this.skillValue2, sim, this.rng);
	}
}

function addHealPulse(
	tapSec: number,
	skillValue: number,
	skillValue2: number,
	sim: TeamContext,
	rng: () => number,
): void {
	// find first target
	const index1 = addEnergizingCheer(tapSec, skillValue, sim, rng);

	//create temporary sim object excluding index member
	const sim2 = { ...sim };
	sim2.members = [...sim.members];
	sim2.members.splice(index1, 1);

	// find second target
	const index2 = addEnergizingCheer(tapSec, skillValue, sim2, rng);

	// add help count
	const helpCount = skillValue2;
	sim.members[index1].progress.pendingExtraHelp += helpCount;
	sim.members[index2].progress.pendingExtraHelp += helpCount;
}
