import { getMaxSkillLevel, type MainSkillName } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, Skill, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { createSkill } from "./SkillFactory";

/**
 * Skills that Metronome can trigger.
 *
 * Every activation of Metronome fires one of these, chosen uniformly at
 * random. The list intentionally excludes Metronome itself as well as the
 * skills that have no team-strength effect (Skill Copy, Versatile, Berry
 * Zone, ...).
 */
export const MetronomeCandidates: Readonly<MainSkillName[]> = [
	"Berry Burst",
	"Charge Energy S",
	"Charge Energy S (Moonlight)",
	"Charge Strength S",
	"Charge Strength S (Random)",
	"Charge Strength S (Stockpile)",
	"Cooking Assist S (Bulk Up)",
	"Cooking Power-Up S",
	"Cooking Power-Up S (Minus)",
	"Dream Shard Magnet S",
	"Dream Shard Magnet S (Aura Sphere)",
	"Dream Shard Magnet S (Random)",
	"Energizing Cheer S",
	"Energizing Cheer S (Nuzzle)",
	"Energy for Everyone S",
	"Energy for Everyone S (Lunar Blessing)",
	"Extra Helpful S",
	"Helper Boost",
	"Ingredient Draw S (Hyper Cutter)",
	"Ingredient Draw S (Super Luck)",
	"Ingredient Magnet S",
	"Ingredient Magnet S (Plus)",
	"Ingredient Magnet S (Present)",
	"Tasty Chance S",
];

/**
 * Metronome.
 */
export class MetronomeSkill extends BaseSkill {
	/** Shared fallback for candidates that cannot be resolved for this member. */
	private static readonly noop: Skill = new (class extends BaseSkill {})();

	/** Handlers for every candidate, in the same order as MetronomeCandidates. */
	private candidates: Skill[] = [];

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		this.candidates = MetronomeCandidates.map((skillName) => {
			const skillLevel = Math.min(
				profile.skillLevel,
				getMaxSkillLevel(skillName),
			);
			const resolved: MemberProfile = { ...profile, skillName, skillLevel };
			try {
				const skill = createSkill(skillName, this.rng);
				skill.initialize(resolved, profiles, param);
				return skill;
			} catch {
				// Some handlers assume the member actually owns the skill (e.g.
				// Ingredient Draw needs the species' ingredient list, Berry Burst
				// needs a full team). Metronome can still roll those, so treat
				// them as a no-op contribution rather than aborting the sim.
				return MetronomeSkill.noop;
			}
		});
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		if (this.candidates.length === 0) {
			return;
		}
		const index = Math.floor(this.rng() * this.candidates.length);
		this.candidates[index].apply(member, tapSec, sim);
	}
}
