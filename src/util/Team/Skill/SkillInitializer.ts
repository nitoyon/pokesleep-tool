import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile } from "../Types";
import { createSkill } from "./SkillFactory";

/**
 * Pre-compute per-trigger skill strength values for each member profile.
 * Called once before the iteration loop.
 */
export function initializeSkillValue(
	profiles: MemberProfile[],
	param: StrengthParameter,
): void {
	for (let memberIdx = 0; memberIdx < profiles.length; memberIdx++) {
		const profile = profiles[memberIdx];
		profile.skill = createSkill(profile.skillName);
		profile.skill.initialize(profile, profiles, param);
	}
}

/** Number of distinct species (by idForm) of the same type on the team. */
export function calculateSpecies(
	profile: MemberProfile,
	profiles: MemberProfile[],
): number {
	const type = profile.iv.pokemon.type;
	return new Set(
		profiles.filter((c) => c.iv.pokemon.type === type).map((c) => c.iv.idForm),
	).size;
}
