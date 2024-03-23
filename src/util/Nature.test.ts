import Nature from './Nature';

describe('Nature', () => {
    test('works fine when Bold is given', () => {
        const n = new Nature("Bold");
        expect(n.isEnergyRecoveryUp).toBe(true);
        expect(n.isExpGainsUp).toBe(false);
        expect(n.isSpeedOfHelpDown).toBe(true);
        expect(n.isExpGainsDown).toBe(false);
        expect(n.energyRecoveryFactor).toBe(1);
        expect(n.speedOfHelpFactor).toBe(1.1);
        expect(n.expGainsFactor).toBe(0);
        expect(n.upTarget).toBe("Energy recovery");
        expect(n.downTarget).toBe("Speed of help");
    });

    test('works fine when Bashful is given', () => {
        const n = new Nature("Bashful");
        expect(n.isEnergyRecoveryUp).toBe(false);
        expect(n.isExpGainsUp).toBe(false);
        expect(n.isSpeedOfHelpDown).toBe(false);
        expect(n.isExpGainsDown).toBe(false);
        expect(n.energyRecoveryFactor).toBe(0);
        expect(n.speedOfHelpFactor).toBe(1);
        expect(n.expGainsFactor).toBe(0);
        expect(n.upTarget).toBe(null);
        expect(n.downTarget).toBe(null);
    });

    test('throws error when invalid nature is given', () => {
        expect(() => {new Nature("a")}).toThrow();
    });
});
