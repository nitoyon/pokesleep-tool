import type { User } from "firebase/auth";
import type { BoxOp, BoxRepository } from "../Box/BoxRepository";
import PokemonBox, {
	deserializeBoxItem,
	PokemonBoxItem,
} from "../Box/PokemonBox";
import { type BoxApi, FakeBoxApi, type RemoteBoxEntry } from "./BoxApi";

// Load this module with dynamic import() so that the Firebase SDK used by
// the API is not included in the initial bundle.

/**
 * Box repository that saves each item to the cloud.
 *
 * PokemonBoxItem.id is renumbered on every load, so this class keeps
 * the mapping from the item ID to the key in the cloud.
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
		const entries = await this.api.getBox();
		this.keys.clear();
		const items: PokemonBoxItem[] = [];
		for (const entry of entries) {
			const data = deserializeBoxItem(entry.data);
			if (data === null) {
				continue;
			}
			const item = new PokemonBoxItem(data.iv, data.nickname);
			this.keys.set(item.id, entry.key);
			items.push(item);

			if (items.length >= PokemonBox.maxEntryCount) {
				break;
			}
		}
		return items;
	}

	apply(ops: BoxOp[], _items: PokemonBoxItem[]): Promise<void> {
		// Resolve keys synchronously so that following ops see them
		// even before the request completes.
		const puts: RemoteBoxEntry[] = [];
		const deletes: string[] = [];
		for (const op of ops) {
			if (op.type === "remove") {
				const key = this.keys.get(op.id);
				if (key !== undefined) {
					deletes.push(key);
					this.keys.delete(op.id);
				}
				continue;
			}
			let key = this.keys.get(op.item.id);
			if (key === undefined) {
				key = crypto.randomUUID();
				this.keys.set(op.item.id, key);
			}
			puts.push({ key, data: op.item.serialize() });
		}

		// Send requests one by one to keep the order of changes
		const ret = this.queue.then(async () => {
			if (deletes.length > 0) {
				await this.api.deleteBoxItems(deletes);
			}
			if (puts.length > 0) {
				await this.api.putBoxItems(puts);
			}
		});
		this.queue = ret.catch(() => {});
		return ret;
	}
}

/**
 * Create a box repository for the signed-in user.
 * @param user Signed-in user.
 * @returns Created repository.
 */
export function createFirebaseBoxRepository(user: User): BoxRepository {
	// TODO: Replace with the Firebase Functions API
	return new FirebaseBoxRepository(new FakeBoxApi(user.uid));
}
