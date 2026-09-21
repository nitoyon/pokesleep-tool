import type { PokemonType } from "../../../data/pokemons";
import { getSkillSubValue, getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/** Upper limit of the berry zone rate (in percent) per berry type. */
const MAX_BERRY_ZONE_RATE = 24;

/**
 * Berry Zone
 */
export class BerryZonePsystrike extends BaseSkill {
	private zoneRate: number = 0;
	/** Berry type whose zone rate this skill raises (the user's own type). */
	private berryType: PokemonType = "psychic";

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
		this.zoneRate = getSkillSubValue(skillName, skillLevel);
		this.berryType = profile.iv.pokemon.type;
	}

	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		member.progress.skillStrength += this.skillValue;
		member.progress.skillBerryZone += this.zoneRate;

		const { berryZoneRate } = sim.teamProgress;
		berryZoneRate[this.berryType] = Math.min(
			(berryZoneRate[this.berryType] ?? 0) + this.zoneRate,
			MAX_BERRY_ZONE_RATE,
		);
	}
}
