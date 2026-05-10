import { getSkillValue } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, Skill, TeamContext, TeamMember } from "../Types";

/**
 * Base class supplying no-op defaults for both phases, so a family class
 * only needs to override the phase(s) it actually implements.
 */
export abstract class BaseSkill implements Skill {
	skillValue = 0;

	/**
	 * RNG source for this handler's random effects. Defaults to Math.random;
	 * pass a deterministic sequence to the constructor in tests (see
	 * {@link createRandomQueue} in Skill/testHelpers.ts).
	 */
	protected rng: () => number;

	constructor(rng: () => number = Math.random) {
		this.rng = rng;
	}

	initialize(
		profile: MemberProfile,
		_profiles: MemberProfile[],
		_param: StrengthParameter,
	): void {
		this.skillValue = getSkillValue(profile.skillName, profile.skillLevel);
	}

	apply(_member: TeamMember, _tapSec: number, _sim: TeamContext): void {}

	/**
	 * Swap the RNG source after construction. Exists so {@link createSkill} can
	 * thread a caller-supplied rng into a handler without every entry of its
	 * factory map having to take one; prefer the constructor argument directly.
	 */
	setRng(rng: () => number): void {
		this.rng = rng;
	}
}
