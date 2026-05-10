import type { MainSkillName } from "../../MainSkill";
import type { BerryBurstTeam, StrengthParameter } from "../../PokemonStrength";
import { calculateBerryBurstStrength } from "../../PokemonStrength";
import type { MemberProfile } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { calculateSpecies } from "./SkillInitializer";

/**
 * Berry Burst / (Disguise) / (Draco Meteor).
 *
 * NOTE: initialize() computes skillValue, but this class has no
 * corresponding apply() case for these three skill names, so the computed
 * value is currently unused. This is a known-suspicious asymmetry preserved
 * as-is (bug-for-bug) per the approved plan, not fixed here.
 */
export class BerryBurstSkill extends BaseSkill {
	skillValue = 0;

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		this.skillValue = calculateBerryBurstSkillValue(
			profile,
			profiles,
			param,
			profile.skillName,
		);
	}
}

/**
 * Computes the Berry Burst team-strength value for a member.
 *
 * Exported because it's also used by LunarBlessingSkill, whose skillValue2
 * (despite the "Energy for Everyone S" name) is computed the same way.
 */
export function calculateBerryBurstSkillValue(
	profile: MemberProfile,
	profiles: MemberProfile[],
	param: StrengthParameter,
	skillName: MainSkillName,
): number {
	const skillLevel = profile.skillLevel;
	const iv = profile.iv;
	const others = profiles.filter((_, i) => i !== profile.index);
	const members = others.map((other) => {
		return other
			? { type: other.iv.pokemon.type, level: other.iv.level }
			: { type: iv.pokemon.type, level: 0 };
	});
	const berryBurstTeam: BerryBurstTeam = {
		members,
		species: calculateSpecies(profile, profiles),
	};
	return calculateBerryBurstStrength(
		iv,
		berryBurstTeam,
		param,
		profile.bonus.berryBurst,
		skillLevel,
		skillName,
	).total;
}
