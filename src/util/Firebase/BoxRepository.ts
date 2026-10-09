import type { BoxOp, BoxRepository } from "../Box/BoxRepository";
import PokemonBox, {
	deserializeBoxItem,
	PokemonBoxItem,
} from "../Box/PokemonBox";
import type { BoxApi, RemoteBoxEntry } from "./BoxApi";
import { FunctionsBoxApi } from "./FunctionsBoxApi";

// Load this module with dynamic import() so that the Firebase SDK used by
// the API is not included in the initial bundle.

/**
 * Box repository that saves each item to the cloud.
 *
 * PokemonBoxItem.id is renumbered on every load, so this class keeps
 * the mapping from the item ID to the ID in the cloud.
 */
export class FirebaseBoxRepository implements BoxRepository {
	readonly isRemote = true;
	private readonly api: BoxApi;
	private readonly keys = new Map<number, string>();
	private queue: Promise<void> = Promise.resolve();

	/**
	 * Initialize FirebaseBoxRepository.
	 * @param api Cloud API.
	 */
	constructor(api: BoxApi) {
		this.api = api;
	}

	async load(): Promise<PokemonBoxItem[]> {
		// Wait for pending saves so that the loaded items include them
		await this.queue;
		const entries = await this.api.getBoxItems();
		this.keys.clear();
		const items: PokemonBoxItem[] = [];
		for (const entry of entries) {
			const data = deserializeBoxItem(entry.data);
			if (data === null) {
				continue;
			}
			const item = new PokemonBoxItem(data.iv, data.nickname);
			this.keys.set(item.id, entry.id);
			items.push(item);

			if (items.length >= PokemonBox.maxEntryCount) {
				break;
			}
		}
		return items;
	}

	apply(ops: BoxOp[], _items: PokemonBoxItem[]): Promise<void> {
		// Send requests one by one to keep the order of changes.
		// IDs of added items are known only after the add request completes,
		// so resolve IDs when the previous requests have completed.
		const ret = this.queue.then(() => this.send(ops));
		this.queue = ret.catch(() => {});
		return ret;
	}

	private async send(ops: BoxOp[]): Promise<void> {
		const deletes: string[] = [];
		const updates: RemoteBoxEntry[] = [];
		const adds: PokemonBoxItem[] = [];
		for (const op of ops) {
			if (op.type === "remove") {
				const id = this.keys.get(op.id);
				if (id !== undefined) {
					deletes.push(id);
					this.keys.delete(op.id);
				}
				continue;
			}
			const id = this.keys.get(op.item.id);
			if (id === undefined) {
				// Also add an updated item whose add request failed
				adds.push(op.item);
			} else {
				updates.push({ id, data: op.item.serialize() });
			}
		}

		// Delete first so that adding does not exceed the max item count
		if (deletes.length > 0) {
			await this.api.deleteBoxItems(deletes);
		}
		if (updates.length > 0) {
			await this.api.updateBoxItems(updates);
		}
		if (adds.length > 0) {
			const ids = await this.api.addBoxItems(adds.map((x) => x.serialize()));
			adds.forEach((item, index) => {
				this.keys.set(item.id, ids[index]);
			});
		}
	}
}

/**
 * Create a box repository for the signed-in user.
 *
 * The API identifies the user by the ID token of the signed-in user.
 * @returns Created repository.
 */
export function createFirebaseBoxRepository(): BoxRepository {
	return new FirebaseBoxRepository(new FunctionsBoxApi());
}
