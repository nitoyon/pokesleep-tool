import { addEnergyTo } from "../TeamEnergy";
import type { TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { addEnergizingCheer } from "./EnergizingCheer";

/**
 * Charge Energy S (Moonlight).
 */
export class ChargeEnergySMoonlightSkill extends BaseSkill {
	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		addEnergyTo(member.profile.index, this.skillValue, sim);
		if (this.rng() < 0.5) {
			addEnergizingCheer(tapSec, this.skillValue, sim, this.rng);
		}
	}
}
