import type { PokemonType } from "../../../data/pokemons";
import {
	getSkillSubValue,
	getSkillValue,
	maxBerryZoneRate,
} from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import { updateBerryStrength } from "../MemberProgress";
import type { MemberProfile, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

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

		const { berryZoneRate } = sim.teamProgress;
		const currentZoneRate = berryZoneRate[this.berryType] ?? 0;
		if (currentZoneRate < maxBerryZoneRate) {
			const newZoneRate = Math.min(
				currentZoneRate + this.zoneRate,
				maxBerryZoneRate,
			);
			berryZoneRate[this.berryType] = newZoneRate;
			member.progress.skillBerryZone += newZoneRate - currentZoneRate;
		}

		// The zone rate is shared by the whole team, so refresh every member.
		for (const m of sim.members) {
			updateBerryStrength(m, sim.teamProfile.param, berryZoneRate);
		}
	}
}
