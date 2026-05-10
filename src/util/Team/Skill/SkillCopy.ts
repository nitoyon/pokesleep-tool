import { getMaxSkillLevel, type MainSkillName } from "../../MainSkill";
import type { StrengthParameter } from "../../PokemonStrength";
import type { MemberProfile, Skill, TeamContext, TeamMember } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { createSkill } from "./SkillFactory";

/**
 * Skills that Skill Copy cannot copy. A member whose skill is one of these is
 * never chosen as the copy target.
 */
const nonCopyableSkills: ReadonlySet<MainSkillName> = new Set<MainSkillName>([
	"Charge Strength M (Bad Dreams)",
	"Energizing Cheer S (Heal Pulse)",
	"Berry Burst (Draco Meteor)",
	"Berry Zone (Psystrike)",
]);

/** A copyable team member paired with a handler for their skill. */
interface CopyTarget {
	/** Profile the copied skill handler was initialized from */
	profile: MemberProfile;
	/** Handler for the copied skill, initialized from {@link profile}. */
	skill: Skill;
}

/**
 * Skill Copy
 */
export class SkillCopySkill extends BaseSkill {
	/** Precomputed copyable targets (always holds at least one entry). */
	private targets: CopyTarget[] = [];

	initialize(
		profile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): void {
		super.initialize(profile, profiles, param);

		this.targets = profiles
			.filter((p) => p !== profile)
			.filter((p) => !nonCopyableSkills.has(p.skillName))
			.map((targetProfile) => {
				// Copying Skill Copy triggers Charge Strength S instead.
				const skillName: MainSkillName = targetProfile.skillName.startsWith(
					"Skill Copy",
				)
					? "Charge Strength S"
					: targetProfile.skillName;
				return this.buildTarget(
					skillName,
					targetProfile,
					profile,
					profiles,
					param,
				);
			});

		// No copyable member: fall back to Charge Strength S.
		if (this.targets.length === 0) {
			this.targets.push(
				this.buildTarget(
					"Charge Strength S",
					profile,
					profile,
					profiles,
					param,
				),
			);
		}
	}

	private buildTarget(
		skillName: MainSkillName,
		targetProfile: MemberProfile,
		casterProfile: MemberProfile,
		profiles: MemberProfile[],
		param: StrengthParameter,
	): CopyTarget {
		const skillLevel = Math.min(
			casterProfile.skillLevel,
			getMaxSkillLevel(skillName),
		);

		// Base the copied skill on the Skill Copy user, overriding only the
		// skill identity and level.
		const copiedProfile: MemberProfile = {
			...casterProfile,
			skillName,
			skillLevel,
		};

		// Ingredient-Draw: skills pick ingredients
		// from the target's Pokémon
		if (isIngredientDrawSkill(skillName)) {
			copiedProfile.iv = targetProfile.iv;
		}

		const skill = createSkill(skillName, this.rng);
		skill.initialize(copiedProfile, profiles, param);
		return { profile: copiedProfile, skill };
	}

	apply(member: TeamMember, tapSec: number, sim: TeamContext): void {
		const target = this.targets[Math.floor(this.rng() * this.targets.length)];
		target.skill.apply(member, tapSec, sim);
	}
}

/**
 * Skills whose ingredient list comes from the Pokémon that owns the skill.
 */
function isIngredientDrawSkill(skillName: MainSkillName): boolean {
	return skillName.startsWith("Ingredient Draw S");
}
