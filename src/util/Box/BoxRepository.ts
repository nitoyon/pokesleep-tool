import type { PokemonBoxItem } from "./PokemonBox";

/**
 * A single change to the box items.
 */
export type BoxOp =
	| { type: "add"; item: PokemonBoxItem }
	| { type: "update"; item: PokemonBoxItem }
	| { type: "remove"; id: number };

/**
 * Storage of the Pokemon box.
 */
export interface BoxRepository {
	/** Whether the storage is remote (saving takes noticeable time). */
	readonly isRemote: boolean;

	/**
	 * Load all items.
	 * @returns Loaded items.
	 */
	load(): Promise<PokemonBoxItem[]>;

	/**
	 * Persist changes.
	 * @param ops Changes since the last load or apply.
	 * @param items Full snapshot after applying `ops`.
	 */
	apply(ops: BoxOp[], items: PokemonBoxItem[]): Promise<void>;
}

/**
 * Compute changes between two box snapshots.
 *
 * Items are compared by ID and reference. PokemonBox creates a new
 * PokemonBoxItem instance whenever an item is changed.
 * @param prev Previous items.
 * @param next Next items.
 * @returns Changes to turn `prev` into `next`.
 */
export function diffBoxItems(
	prev: PokemonBoxItem[],
	next: PokemonBoxItem[],
): BoxOp[] {
	const prevMap = new Map(prev.map((x) => [x.id, x]));
	const nextIds = new Set(next.map((x) => x.id));

	const ops: BoxOp[] = [];
	for (const item of prev) {
		if (!nextIds.has(item.id)) {
			ops.push({ type: "remove", id: item.id });
		}
	}
	for (const item of next) {
		const prevItem = prevMap.get(item.id);
		if (prevItem === undefined) {
			ops.push({ type: "add", item });
		} else if (prevItem !== item) {
			ops.push({ type: "update", item });
		}
	}
	return ops;
}
