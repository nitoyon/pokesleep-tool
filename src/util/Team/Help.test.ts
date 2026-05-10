import { NoTap } from "../Energy";
import type { BagUsagePerHelpDetailItem } from "../PokemonIv";
import PokemonIv from "../PokemonIv";
import PokemonStrength, {
	createStrengthParameter,
	type StrengthParameter,
} from "../PokemonStrength";
import { applyHelp } from "./Help";
import type {
	IterationState,
	MemberProfile,
	MemberProgress,
	TeamMember,
} from "./Types";

describe("applyHelp", () => {
	test("multiple helps within tapSec advance nextHelpSec and accumulate berries", () => {
		const member = createTeamMember({
			baseFreq: 2200,
			carryLimit: 21,
			berryStrengthWithBonus: 10,
		});
		const sim = createSim(member);

		// Helps at 990, 1980 (2 helps)
		// nextHelpSec becomes 2970.
		const rng = createRandomQueue([0, 0, 0]);
		applyHelp(2000, sim, rng);

		expect(member.progress.nextHelpSec).toBe(2970);
		expect(member.progress.berryTotalStrength).toBe(20);
	});

	test("bag usage detail: low rand selects berry branch", () => {
		const bagUsageDetail: BagUsagePerHelpDetailItem[] = [
			{ name: "berry", count: 2, p: 0.6, ingSlotIndex: -1, ingKindIndex: -1 },
			{ name: "apple", count: 1, p: 0.4, ingSlotIndex: 0, ingKindIndex: 0 },
		];
		const member = createTeamMember({
			bagUsageDetail,
			carryLimit: 21,
			berryStrengthWithBonus: 10,
		});

		// 1st help (t=990): 0.3 < 0.6 => berry branch.
		const sim = createSim(member);
		const rng = createRandomQueue([0.3, 0]);
		applyHelp(990, sim, rng);

		expect(member.progress.berryTotalStrength).toBe(20);
		expect(member.progress.ingCounts.size).toBe(0);
	});

	test("bag usage detail: high rand selects ingredient branch", () => {
		const bagUsageDetail: BagUsagePerHelpDetailItem[] = [
			{ name: "berry", count: 2, p: 0.6, ingSlotIndex: -1, ingKindIndex: -1 },
			{ name: "apple", count: 1, p: 0.2, ingSlotIndex: 0, ingKindIndex: 0 },
			{ name: "ginger", count: 2, p: 0.2, ingSlotIndex: 0, ingKindIndex: 0 },
		];
		const member = createTeamMember({
			bagUsageDetail,
			carryLimit: 21,
			berryStrengthWithBonus: 10,
		});

		// 1st help (t=990): 0.7 -> apple x1
		// 2nd help (t=1980): 0.9 -> ginger x2
		const sim = createSim(member);
		const rng = createRandomQueue([0.7, 0.9, 0]);
		applyHelp(990 * 2, sim, rng);

		expect(member.progress.berryTotalStrength).toBe(0);
		expect(member.progress.ingCounts.get("apple")).toBe(1);
		expect(member.progress.ingCounts.get("ginger")).toBe(2);
	});

	test("sneaky snacking once carry limit is exhausted consumes no rng", () => {
		const bagUsageDetail: BagUsagePerHelpDetailItem[] = [
			{ name: "berry", count: 2, p: 0.7, ingSlotIndex: -1, ingKindIndex: -1 },
			{ name: "apple", count: 1, p: 0.1, ingSlotIndex: 0, ingKindIndex: 0 },
			{ name: "apple", count: 2, p: 0.1, ingSlotIndex: 1, ingKindIndex: 0 },
			{ name: "apple", count: 4, p: 0.1, ingSlotIndex: 2, ingKindIndex: 0 },
		];

		// carryLimit: 21
		// 5 helps (apple x4) makes bag full
		// 6th help is sneaky snacking
		const member = createTeamMember({
			bagUsageDetail,
			carryLimit: 21,
			berryStrengthWithBonus: 10,
			baseFreq: 2200,
		});

		const sim = createSim(member);
		const rng = createRandomQueue([0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0]);
		applyHelp(990 * 7, sim, rng);

		expect(member.progress.berryTotalStrength).toBe(10 * 2);
		expect(member.progress.ingCounts.get("apple")).toBe(21);
	});

	test("NoTap forces sneaky snacking from the start regardless of carryLimit", () => {
		const member = createTeamMember({
			carryLimit: 21,
			berryStrengthWithBonus: 10,
			baseFreq: 2200,
		});

		const sim = createSim(member, { tapFrequencyAwake: NoTap });
		const rng = createRandomQueue([0]);
		applyHelp(990 * 3, sim, rng);

		expect(member.progress.berryTotalStrength).toBe(3 * (10 * 2));
	});

	test("drawSkillCount: rng below noneProb keeps skillCount at 0", () => {
		const member = createTeamMember({
			skillRate: 0.1,
			pityProcHelpCount: 100,
			carryLimit: 21,
		});

		const sim = createSim(member, { pityProc: false });
		const rng = createRandomQueue([0, 0.1]);
		applyHelp(990, sim, rng);
		expect(member.progress.skillCount).toBe(0);
		expect(member.progress.skillStrength).toBe(0);
	});

	test("drawSkillCount: rng over noneProb makes skillCount at 1", () => {
		const member = createTeamMember({
			skillRate: 0.1,
			pityProcHelpCount: 100,
			carryLimit: 21,
		});

		const sim = createSim(member, { pityProc: false });
		const rng = createRandomQueue([0, 0.95]);
		applyHelp(990, sim, rng);
		expect(member.progress.skillCount).toBe(1);
		expect(member.progress.skillStrength).toBe(10);
	});

	test("pityProc triggers a skill deterministically once helpsSinceSkill reaches pityProcHelpCount", () => {
		const member = createTeamMember(
			{
				skillRate: 0,
				pityProcHelpCount: 100,
				carryLimit: 21,
				skillValue: 10,
				skillValue2: 0,
				isSkillSpecialty: false,
				skillName: "Charge Strength S",
			},
			{
				helpsSinceSkill: 99,
			},
		);
		const sim = createSim(member, { pityProc: true });
		const rng = createRandomQueue([0]);
		applyHelp(990, sim, rng);

		expect(member.progress.skillCount).toBe(1);
		expect(member.progress.helpsSinceSkill).toBe(0);
		expect(member.progress.skillStrength).toBe(10);
	});
});

/** Create an IterationState with a single member, allowing param overrides. */
function createSim(
	member: TeamMember,
	paramOverrides: Partial<StrengthParameter> = {},
): IterationState {
	return {
		members: [member],
		sleepTimeSec: 86400,
		dayLengthSec: 86400,
		// Default to no pity-proc
		// so drawSkillCount only consumes a single rng
		param: createStrengthParameter({ pityProc: false, ...paramOverrides }),
	};
}

/** Create a TeamMember bundling a profile and progress, allowing overrides for each. */
function createTeamMember(
	profileOverrides: Partial<MemberProfile> = {},
	progressOverrides: Partial<MemberProgress> = {},
): TeamMember {
	return {
		profile: createProfile(profileOverrides),
		progress: createProgress(progressOverrides),
	};
}

/** Create a MemberProfile with sensible defaults, allowing overrides. */
function createProfile(overrides: Partial<MemberProfile> = {}): MemberProfile {
	// Raichu (Lv 1): specialty "Berries" (berryCount = 2), frequency 2200,
	// carryLimit 21, ing1 "apple" (count 1 at Lv 1) - real game data, used so
	// fixture values below match an actual Pokémon rather than arbitrary numbers.
	const defaultIv = new PokemonIv({ pokemonName: "Raichu", level: 1 });
	const defaultParam: StrengthParameter = createStrengthParameter({});
	const defaultBonus = new PokemonStrength(defaultIv, defaultParam)
		.bonusEffects;

	const defaultBagUsageDetail: BagUsagePerHelpDetailItem[] = [
		{ name: "berry", count: 1, p: 1, ingSlotIndex: -1, ingKindIndex: -1 },
	];

	return {
		index: 0,
		iv: defaultIv,
		bonus: defaultBonus,
		baseFreq: 2200,
		wakeMax: 100,
		sleepRecovery: 0,
		skillRate: 0,
		pityProcHelpCount: 100,
		bagUsageDetail: defaultBagUsageDetail,
		carryLimit: 21,
		berryRawStrength: 10,
		berryStrength: 10,
		berryStrengthWithBonus: 10,
		ingStrengthRate: 1,
		skillName: "Charge Strength S",
		skillLevel: 1,
		energyRecoveryFactor: 1,
		isSkillSpecialty: false,
		skillValue: 10,
		skillValue2: 0,
		...overrides,
	};
}

/** Create a MemberProgress with sensible defaults, allowing overrides. */
function createProgress(
	overrides: Partial<MemberProgress> = {},
): MemberProgress {
	return {
		energy: 100,
		lastRecoverySec: 0,
		sleeping: false,
		nextHelpSec: -1,
		helpsSinceSkill: 0,
		berryTotalStrength: 0,
		ingCounts: new Map(),
		skillCount: 0,
		skillStrength: 0,
		skillStrength2: 0,
		pendingEnergy: 0,
		...overrides,
	};
}

/** Build a deterministic rng function that returns queued values in order. */
function createRandomQueue(values: number[]): () => number {
	let i = 0;
	return () => {
		if (i >= values.length) {
			throw new Error("random queue exhausted");
		}
		return values[i++];
	};
}
