import type { BoxOp, BoxRepository } from "./BoxRepository";
import PokemonBox, { deserializeBoxItem, PokemonBoxItem } from "./PokemonBox";

const storageKey = "PstPokeBox";

/**
 * Box repository backed by localStorage.
 *
 * The whole box is saved as an array of serialized items.
 */
export class LocalBoxRepository implements BoxRepository {
	readonly isRemote = false;

	load(): Promise<PokemonBoxItem[]> {
		try {
			return Promise.resolve(loadItems());
		} catch (e) {
			return Promise.reject(e);
		}
	}

	apply(_ops: BoxOp[], items: PokemonBoxItem[]): Promise<void> {
		try {
			localStorage.setItem(
				storageKey,
				JSON.stringify(items.map((x) => x.serialize())),
			);
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
}

function loadItems(): PokemonBoxItem[] {
	const data = localStorage.getItem(storageKey);
	if (data === null) {
		return [];
	}
	const json = JSON.parse(data);
	if (!Array.isArray(json)) {
		return [];
	}

	const items: PokemonBoxItem[] = [];
	for (const item of json) {
		if (typeof item !== "string") {
			continue;
		}
		const data = deserializeBoxItem(item);
		if (data === null) {
			continue;
		}
		items.push(new PokemonBoxItem(data.iv, data.nickname));

		if (items.length >= PokemonBox.maxEntryCount) {
			break;
		}
	}
	return items;
}
