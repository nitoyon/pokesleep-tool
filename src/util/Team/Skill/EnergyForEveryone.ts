import { addEnergyToAll } from "../TeamEnergy";
import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";

/**
 * Energy for Everyone S / (Berry Juice).
 */
export class EnergyForEveryoneSkill extends BaseSkill {
	apply(member: TeamMember, _tapSec: number, sim: TeamContext): void {
		member.progress.skillEnergyForEveryone += this.skillValue;
		addEnergyToAll(this.skillValue, sim);
	}
}
