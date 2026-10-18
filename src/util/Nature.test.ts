import Nature from "./Nature";

describe("Nature", () => {
	test("works fine when Bold is given", () => {
		const n = new Nature("Bold");
		expect(n.isNeautral).toBe(false);
		expect(n.isEnergyRecoveryUp).toBe(true);
		expect(n.isExpGainsUp).toBe(false);
		expect(n.isSpeedOfHelpDown).toBe(true);
		expect(n.isExpGainsDown).toBe(false);
		expect(n.energyRecoveryFactor).toBe(1.2);
		expect(n.speedOfHelpFactor).toBe(1.075);
		expect(n.expGainsFactor).toBe(0);
		expect(n.upEffect).toBe("Energy recovery");
		expect(n.downEffect).toBe("Speed of help");
	});

	test("works fine when Bashful is given", () => {
		const n = new Nature("Bashful");
		expect(n.isNeautral).toBe(true);
		expect(n.isEnergyRecoveryUp).toBe(false);
		expect(n.isExpGainsUp).toBe(false);
		expect(n.isSpeedOfHelpDown).toBe(false);
		expect(n.isExpGainsDown).toBe(false);
		expect(n.energyRecoveryFactor).toBe(1);
		expect(n.speedOfHelpFactor).toBe(1);
		expect(n.expGainsFactor).toBe(0);
		expect(n.upEffect).toBe("No effect");
		expect(n.downEffect).toBe("No effect");
	});

	test("disables effects when a mint is used", () => {
		const n = new Nature("Bold", true);
		expect(n.name).toBe("Bold");
		expect(n.mint).toBe(true);
		expect(n.isNeautral).toBe(false);
		expect(n.canUseMint).toBe(true);
		expect(n.isEnergyRecoveryUp).toBe(false);
		expect(n.isSpeedOfHelpDown).toBe(false);
		expect(n.energyRecoveryFactor).toBe(1);
		expect(n.speedOfHelpFactor).toBe(1);
		expect(n.upEffect).toBe("No effect");
		expect(n.downEffect).toBe("No effect");
		expect(n.original.mint).toBe(false);
		expect(n.original.upEffect).toBe("Energy recovery");
		expect(n.isLowKey).toBe(true);
	});

	test("ignores mint for neutral natures", () => {
		const n = new Nature("Bashful", true);
		expect(n.mint).toBe(false);
		expect(n.canUseMint).toBe(false);
		expect(n.withMint(true).mint).toBe(false);
	});

	test("withMint and isEqual", () => {
		const n = new Nature("Adamant");
		const m = n.withMint(true);
		expect(m.mint).toBe(true);
		expect(n.withMint(false)).toBe(n);
		expect(n.isEqual(m)).toBe(false);
		expect(m.isEqual(new Nature("Adamant", true))).toBe(true);
	});

	test("throws error when invalid nature is given", () => {
		expect(() => {
			new Nature("a");
		}).toThrow();
	});
});
