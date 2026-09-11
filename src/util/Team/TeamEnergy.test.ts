import {
	addEnergy,
	addPendingEnergy,
	getEnergy,
	getEnergyByState,
	setEnergy,
} from "./TeamEnergy";
import { createTestProfile, createTestSim } from "./testHelpers";

describe("TeamEnergy isEnergyAlwaysFull", () => {
	test("getEnergyByState reports 100 and skips decay when profile.isEnergyAlwaysFull", () => {
		const profile = createTestProfile({ isEnergyAlwaysFull: true });
		const sim = createTestSim([profile]);
		const progress = sim.members[0].progress;
		progress.energy = 10;
		progress.lastRecoverySec = 0;

		// Would normally decay well below 100 over this much time.
		expect(getEnergyByState(profile, progress, 100000)).toBe(100);
		expect(getEnergy(sim, 0, 100000)).toBe(100);
	});

	test("setEnergy/addEnergy are no-ops when profile.isEnergyAlwaysFull", () => {
		const profile = createTestProfile({ isEnergyAlwaysFull: true });
		const sim = createTestSim([profile]);
		const progress = sim.members[0].progress;
		progress.energy = 42;
		progress.lastRecoverySec = 0;

		setEnergy(sim, 0, 100, 5);
		expect(progress.energy).toBe(42);
		expect(progress.lastRecoverySec).toBe(0);

		addEnergy(sim, 0, 200, -30);
		expect(progress.energy).toBe(42);
		expect(progress.lastRecoverySec).toBe(0);
		expect(getEnergy(sim, 0, 200)).toBe(100);
	});

	test("addPendingEnergy is a no-op when profile.isEnergyAlwaysFull", () => {
		const profile = createTestProfile({ isEnergyAlwaysFull: true });
		const sim = createTestSim([profile]);

		addPendingEnergy(sim, 0, 25);
		expect(sim.members[0].progress.pendingEnergy).toBe(0);
	});

	test("energy behaves normally when profile.isEnergyAlwaysFull is false", () => {
		const profile = createTestProfile({ isEnergyAlwaysFull: false });
		const sim = createTestSim([profile]);
		const progress = sim.members[0].progress;
		progress.energy = 100;
		progress.lastRecoverySec = 0;

		// Energy decays by 1 every 600 seconds.
		expect(getEnergyByState(profile, progress, 600)).toBe(99);

		setEnergy(sim, 0, 600, 80);
		expect(progress.energy).toBe(80);
		expect(progress.lastRecoverySec).toBe(600);

		addPendingEnergy(sim, 0, 10);
		expect(sim.members[0].progress.pendingEnergy).toBe(10);
	});
});
