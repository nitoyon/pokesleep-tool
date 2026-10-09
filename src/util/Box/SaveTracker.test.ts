import { describe, expect, test } from "vitest";
import { type SaveStatus, SaveTracker } from "./SaveTracker";

function deferred() {
	let resolve: () => void = () => {};
	let reject: (e: Error) => void = () => {};
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

/** Wait until pending promise callbacks run */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("SaveTracker", () => {
	test("reports saved only after all saves complete", async () => {
		const history: SaveStatus[] = [];
		const tracker = new SaveTracker((status) => history.push(status));
		const saves = [deferred(), deferred(), deferred()];
		for (const save of saves) {
			tracker.track(save.promise);
		}
		expect(history).toEqual(["saving"]);
		expect(tracker.isSaving).toBe(true);

		saves[0].resolve();
		saves[1].resolve();
		await flush();
		expect(history).toEqual(["saving"]);
		expect(tracker.isSaving).toBe(true);

		saves[2].resolve();
		await flush();
		expect(history).toEqual(["saving", "saved"]);
		expect(tracker.isSaving).toBe(false);
	});

	test("reports error when any save fails", async () => {
		const history: SaveStatus[] = [];
		const tracker = new SaveTracker((status) => history.push(status));
		const saves = [deferred(), deferred()];
		for (const save of saves) {
			tracker.track(save.promise).catch(() => {});
		}

		saves[0].reject(new Error("failed"));
		saves[1].resolve();
		await flush();
		expect(history).toEqual(["saving", "error"]);
	});

	test("resets the error state on the next save", async () => {
		const history: SaveStatus[] = [];
		const tracker = new SaveTracker((status) => history.push(status));
		await tracker.track(Promise.reject(new Error("failed"))).catch(() => {});
		await flush();
		await tracker.track(Promise.resolve());
		await flush();
		expect(history).toEqual(["saving", "error", "saving", "saved"]);
	});
});
