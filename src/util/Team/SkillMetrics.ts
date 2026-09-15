/**
 * Per-skill accumulator fields
 */
export interface SkillMetrics {
	skillCount: number;
	skillStrength: number;
	skillExtraHelp: number;
	skillHelperBoost: number;
	skillEnergizingCheer: number;
	skillEnergyForEveryone: number;
	skillDreamShards: number;
	skillPotExtended: number;
	skillExtraTastyRate: number;
	skillCandy: number;
	skillBerryZone: number;
}

const SKILL_METRIC_KEYS = [
	"skillCount",
	"skillStrength",
	"skillExtraHelp",
	"skillHelperBoost",
	"skillEnergizingCheer",
	"skillEnergyForEveryone",
	"skillDreamShards",
	"skillPotExtended",
	"skillExtraTastyRate",
	"skillCandy",
	"skillBerryZone",
] as const satisfies readonly (keyof SkillMetrics)[];

/** Set every field to 0. */
export function zeroSkillMetrics(): SkillMetrics {
	const result = {} as SkillMetrics;
	for (const key of SKILL_METRIC_KEYS) {
		result[key] = 0;
	}
	return result;
}

/** Copy every field. */
export function pickSkillMetrics(src: SkillMetrics): SkillMetrics {
	const result = {} as SkillMetrics;
	for (const key of SKILL_METRIC_KEYS) {
		result[key] = src[key];
	}
	return result;
}

/** Add `delta`'s fields into every field. */
export function addSkillMetrics(acc: SkillMetrics, delta: SkillMetrics): void {
	for (const key of SKILL_METRIC_KEYS) {
		acc[key] += delta[key];
	}
}

/** Divide every field by `iterations`. */
export function avgSkillMetrics(
	acc: SkillMetrics,
	iterations: number,
): SkillMetrics {
	const result = {} as SkillMetrics;
	for (const key of SKILL_METRIC_KEYS) {
		result[key] = acc[key] / iterations;
	}
	return result;
}
