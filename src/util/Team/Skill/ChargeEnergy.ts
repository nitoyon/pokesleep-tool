import { addEnergyTo } from "../TeamEnergy";
import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Charge Energy S.
 */
export class ChargeEnergySkill extends BaseSkill {
	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		addEnergyTo(member.profile.index, this.skillValue, sim);
	}
}
