import type { MainSkillName } from "../../MainSkill";
import type { Skill } from "../Types";
import { BaseSkill } from "./BaseSkill";
import { BerryBurstSkill } from "./BerryBurst";
import { BerryBurstDisguiseSkill } from "./BerryBurstDisguise";
import { BerryBurstDracoMeteorSkill } from "./BerryBurstDracoMeteor";
import { ChargeEnergySkill } from "./ChargeEnergy";
import { ChargeEnergySMoonlightSkill } from "./ChargeEnergySMoonlight";
import { ChargeStrengthMBadDreamSkill } from "./ChargeStrengthMBadDream";
import { ChargeStrengthSSkill } from "./ChargeStrengthS";
import { ChargeStrengthSRandomSkill } from "./ChargeStrengthSRandom";
import { ChargeStrengthSStockpileSkill } from "./ChargeStrengthSStockpile";
import { CookingAssistBulkUpSkill } from "./CookingAssistBulkUp";
import { CookingPowerUpSkill } from "./CookingPowerUp";
import { CookingPowerUpMinusSkill } from "./CookingPowerUpMinus";
import { DreamShardMagnetSkill } from "./DreamShardMagnet";
import { DreamShardMagnetAuraSphereSkill } from "./DreamShardMagnetAuraSphere";
import { DreamShardMagnetRandomSkill } from "./DreamShardMagnetRandom";
import { EnergizingCheerSkill } from "./EnergizingCheer";
import { EnergizingCheerHealPulseSkill } from "./EnergizingCheerHealPulse";
import { EnergizingCheerNuzzleSkill } from "./EnergizingCheerNuzzleSkill";
import { EnergyForEveryoneSkill } from "./EnergyForEveryone";
import { EnergyForEveryoneLunarBlessingSkill } from "./EnergyForEveryoneLunarBlessing";
import { ExtraHelpfulSkill } from "./ExtraHelpful";
import { HelperBoostSkill } from "./HelperBoost";
import { IngredientDrawSkill } from "./IngredientDraw";
import { IngredientDrawHyperCutterSkill } from "./IngredientDrawHyperCutter";
import { IngredientDrawSuperLuckSkill } from "./IngredientDrawSuperLuck";
import { IngredientMagnetSkill } from "./IngredientMagnet";
import { IngredientMagnetPlusSkill } from "./IngredientMagnetPlus";
import { IngredientMagnetPresentSkill } from "./IngredientMagnetPresent";
import { MetronomeSkill } from "./Metronome";
import { SkillCopySkill } from "./SkillCopy";
import { TastyChanceSkill } from "./TastyChance";
import { VersatileSkill } from "./Versatile";

/**
 * Returns a new Skill handler instance for the given skill name.
 *
 * `rng`, when given, replaces the handler's default Math.random source (used
 * by tests and by delegating handlers forwarding their own rng to the skills
 * they wrap).
 */
export function createSkill(
	skillName: MainSkillName,
	rng?: () => number,
): Skill {
	const skill = skillMap[skillName]();
	if (rng !== undefined) {
		skill.setRng(rng);
	}
	return skill;
}

/** Shared singleton for skills that need no per-trigger handling at all. */
const noopSkill: BaseSkill = new (class extends BaseSkill {})();

/**
 * Maps every MainSkillName to a factory that constructs its Skill handler.
 */
const skillMap: Record<MainSkillName, () => BaseSkill> = {
	"Ingredient Magnet S": () => new IngredientMagnetSkill(),
	"Ingredient Magnet S (Plus)": () => new IngredientMagnetPlusSkill(),
	"Ingredient Magnet S (Present)": () => new IngredientMagnetPresentSkill(),
	"Charge Energy S": () => new ChargeEnergySkill(),
	"Charge Energy S (Moonlight)": () => new ChargeEnergySMoonlightSkill(),
	"Charge Strength S": () => new ChargeStrengthSSkill(),
	"Charge Strength S (Random)": () => new ChargeStrengthSRandomSkill(),
	"Charge Strength S (Stockpile)": () => new ChargeStrengthSStockpileSkill(),
	"Charge Strength M": () => new ChargeStrengthSSkill(),
	"Charge Strength M (Bad Dreams)": () => new ChargeStrengthMBadDreamSkill(),
	"Dream Shard Magnet S": () => new DreamShardMagnetSkill(),
	"Dream Shard Magnet S (Random)": () => new DreamShardMagnetRandomSkill(),
	"Dream Shard Magnet S (Aura Sphere)": () =>
		new DreamShardMagnetAuraSphereSkill(),
	"Energizing Cheer S": () => new EnergizingCheerSkill(),
	"Energizing Cheer S (Nuzzle)": () => new EnergizingCheerNuzzleSkill(),
	"Energizing Cheer S (Heal Pulse)": () => new EnergizingCheerHealPulseSkill(),
	Metronome: () => new MetronomeSkill(),
	"Energy for Everyone S": () => new EnergyForEveryoneSkill(),
	"Energy for Everyone S (Lunar Blessing)": () =>
		new EnergyForEveryoneLunarBlessingSkill(),
	"Energy for Everyone S (Berry Juice)": () => new EnergyForEveryoneSkill(),
	"Extra Helpful S": () => new ExtraHelpfulSkill(),
	"Cooking Power-Up S": () => new CookingPowerUpSkill(),
	"Cooking Power-Up S (Minus)": () => new CookingPowerUpMinusSkill(),
	"Tasty Chance S": () => new TastyChanceSkill(),
	"Helper Boost": () => new HelperBoostSkill(),
	"Berry Burst": () => new BerryBurstSkill(),
	"Berry Burst (Disguise)": () => new BerryBurstDisguiseSkill(),
	"Berry Burst (Draco Meteor)": () => new BerryBurstDracoMeteorSkill(),
	"Skill Copy": () => new SkillCopySkill(),
	"Skill Copy (Transform)": () => new SkillCopySkill(),
	"Skill Copy (Mimic)": () => new SkillCopySkill(),
	"Ingredient Draw S": () => new IngredientDrawSkill(),
	"Ingredient Draw S (Super Luck)": () => new IngredientDrawSuperLuckSkill(),
	"Ingredient Draw S (Hyper Cutter)": () =>
		new IngredientDrawHyperCutterSkill(),
	"Cooking Assist S": () => noopSkill,
	"Cooking Assist S (Bulk Up)": () => new CookingAssistBulkUpSkill(),
	Versatile: () => new VersatileSkill(),
	"Berry Zone": () => noopSkill,
	"Berry Zone (Psystrike)": () => noopSkill,
	unknown: () => noopSkill,
};
