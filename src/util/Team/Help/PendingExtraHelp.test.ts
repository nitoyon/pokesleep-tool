import type { BagUsagePerHelpDetailItem } from "../../PokemonIv";
import type { MemberProfile, MemberProgress, TeamMember } from "../Types";
import { applyPendingExtraHelpForMember } from "./PendingExtraHelp";

describe("applyPendingExtraHelpForMember", () => {
	test("does nothing and consumes no rng when pendingExtraHelp is 0", () => {
		const member = createTeamMember({}, { pendingExtraHelp: 0 });
		const rng = createRandomQueue([]);

		applyPendingExtraHelpForMember(member, rng);

		expect(member.progress.berryTotalStrength).toBe(0);
		expect(member.progress.ingCounts.size).toBe(0);
		expect(member.progress.pendingExtraHelp).toBe(0);
	});

	test("low rand selects the berry branch and accumulates strength", () => {
		const extraBagUsage: BagUsagePerHelpDetailItem[] = [
			{ name: "berry", count: 2, p: 0.6, ingSlotIndex: -1, ingKindIndex: -1 },
			{ name: "apple", count: 1, p: 0.4, ingSlotIndex: 0, ingKindIndex: 0 },
		];
		const member = createTeamMember(
			{ extraBagUsage, berryStrengthWithBonus: 10 },
			{ pendingExtraHelp: 1 },
		);
		const rng = createRandomQueue([0.3]);

		applyPendingExtraHelpForMember(member, rng);

		expect(member.progress.berryTotalStrength).toBe(20);
		expect(member.progress.ingCounts.size).toBe(0);
		expect(member.progress.pendingExtraHelp).toBe(0);
	});

	test("high rand selects the ingredient branch and accumulates counts", () => {
		const extraBagUsage: BagUsagePerHelpDetailItem[] = [
			{ name: "berry", count: 2, p: 0.6, ingSlotIndex: -1, ingKindIndex: -1 },
			{ name: "apple", count: 1, p: 0.2, ingSlotIndex: 0, ingKindIndex: 0 },
			{ name: "ginger", count: 2, p: 0.2, ingSlotIndex: 0, ingKindIndex: 0 },
		];
		const member = createTeamMember(
			{ extraBagUsage, berryStrengthWithBonus: 10 },
			{ pendingExtraHelp: 2 },
		);
		const rng = createRandomQueue([0.7, 0.9]);

		applyPendingExtraHelpForMember(member, rng);

		expect(member.progress.berryTotalStrength).toBe(0);
		expect(member.progress.ingCounts.get("apple")).toBe(1);
		expect(member.progress.ingCounts.get("ginger")).toBe(2);
		expect(member.progress.pendingExtraHelp).toBe(0);
	});

	test("runs exactly pendingExtraHelp times without a carry limit", () => {
		const extraBagUsage: BagUsagePerHelpDetailItem[] = [
			{ name: "apple", count: 2, p: 1, ingSlotIndex: 0, ingKindIndex: 0 },
		];
		const member = createTeamMember({ extraBagUsage }, { pendingExtraHelp: 3 });
		const rng = createRandomQueue([0.5, 0.5, 0.5]);

		applyPendingExtraHelpForMember(member, rng);

		expect(member.progress.ingCounts.get("apple")).toBe(6);
		expect(member.progress.berryTotalStrength).toBe(0);
		expect(member.progress.pendingExtraHelp).toBe(0);
	});
});

/**
 * Build a minimal TeamMember carrying only the fields
 * applyPendingExtraHelpForMember touches.
 */
function createTeamMember(
	profile: Partial<MemberProfile> = {},
	progress: Partial<MemberProgress> = {},
): TeamMember {
	return {
		profile: {
			extraBagUsage: [
				{ name: "berry", count: 1, p: 1, ingSlotIndex: -1, ingKindIndex: -1 },
			],
			berryStrengthWithBonus: 10,
			...profile,
		} as MemberProfile,
		progress: {
			berryTotalStrength: 0,
			ingCounts: new Map(),
			pendingExtraHelp: 0,
			...progress,
		} as MemberProgress,
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
