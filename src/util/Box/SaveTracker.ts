/**
 * Status of saving the box.
 * - `idle`: Nothing to show.
 * - `saving`: One or more saves are in progress.
 * - `saved`: All saves have completed successfully.
 * - `error`: All saves have completed, but at least one failed.
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Tracks pending save operations and reports a single status for them.
 *
 * The status stays `saving` while any save is pending, and becomes
 * `saved` or `error` only after all of them have completed.
 */
export class SaveTracker {
	private pending = 0;
	private failed = false;
	private readonly onChange: (status: SaveStatus) => void;

	/**
	 * Initialize SaveTracker.
	 * @param onChange Called when the status changes.
	 */
	constructor(onChange: (status: SaveStatus) => void) {
		this.onChange = onChange;
	}

	/** Whether any save is in progress. */
	get isSaving(): boolean {
		return this.pending > 0;
	}

	/**
	 * Track a save operation.
	 * @param promise Promise of the save operation.
	 * @returns The same promise.
	 */
	track(promise: Promise<void>): Promise<void> {
		if (this.pending === 0) {
			this.failed = false;
			this.onChange("saving");
		}
		this.pending++;
		promise.then(
			() => this.done(),
			() => {
				this.failed = true;
				this.done();
			},
		);
		return promise;
	}

	private done() {
		this.pending--;
		if (this.pending === 0) {
			this.onChange(this.failed ? "error" : "saved");
		}
	}
}
