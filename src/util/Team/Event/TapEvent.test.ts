import { describe, expect, test } from "vitest";
import { AlwaysTap, NoTap } from "../../Energy";
import { createTestMember, createTestSim } from "../testHelpers";
import { PhaseAwareTapEvent } from "./TapEvent";

describe("PhaseAwareTapEvent", () => {
	test("caps a numeric awake tap at the upcoming sleep boundary", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(90, NoTap, 72000, 86400, 86400);
		event.apply(70000, sim);

		expect(event.next(70000, sim)).toBe(72000);
	});

	test("returns the periodic candidate when it lands before the boundary", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(60, NoTap, 72000, 86400, 86400);
		event.apply(1000, sim);

		expect(event.next(1000, sim)).toBe(4600);
	});

	test("switches to the asleep frequency once the team is sleeping", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: true })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(NoTap, 30, 72000, 86400, 200000);
		event.apply(72000, sim);

		expect(event.next(72000, sim)).toBe(73800);
	});

	test("NoTap during sleep only taps at the wake boundary", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: true })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(NoTap, NoTap, 72000, 86400, 200000);

		expect(event.next(75000, sim)).toBe(86400);
	});

	test("AlwaysTap while asleep rounds up to the next whole minute, capped at wake", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: true, nextHelpSec: 86390 })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(
			NoTap,
			AlwaysTap,
			72000,
			86400,
			200000,
		);

		expect(event.next(80000, sim)).toBe(86400);
	});

	test("clamps to the simulation period end once the candidate would pass it", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(60, NoTap, 72000, 86400, 5000);
		event.apply(4999, sim);

		expect(event.next(4999, sim)).toBe(5000);
	});

	test("keeps the periodic cadence anchored to the last tap, not to an unrelated event's currentSec", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(60, NoTap, 72000, 86400, 86400);
		event.apply(1000, sim);

		expect(event.next(2000, sim)).toBe(4600);
	});

	test("treats a tap as having happened at the period end when the periodic cadence would exceed it", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(3, NoTap, 72000, 86400, 1);

		expect(event.next(0, sim)).toBe(1);
	});

	test("stops returning candidates once a tap has already landed on the period end", () => {
		const sim = createTestSim(
			[createTestMember({}, { sleeping: false })],
			{},
			{ sleepTimeSec: 72000, dayLengthSec: 86400 },
		);
		const event = new PhaseAwareTapEvent(3, NoTap, 72000, 86400, 1);
		event.apply(1, sim);

		expect(event.next(1, sim)).toBeNull();
	});
});
