import type { BoxLoadResult, BoxOp, BoxRepository } from "./BoxRepository";
import PokemonBox, {
	deserializeBoxItem,
	type PokemonBoxItem,
} from "./PokemonBox";

const storageKey = "PstPokeBox";

/**
 * Box repository backed by localStorage.
 *
 * The whole box is saved as an array of serialized items.
 */
export class LocalBoxRepository implements BoxRepository {
	readonly isRemote = false;

	load(): Promise<BoxLoadResult> {
		try {
			return Promise.resolve({ items: loadItems(), needsInit: false });
		} catch (e) {
			return Promise.reject(e);
		}
	}

	apply(_ops: BoxOp[], items: PokemonBoxItem[]): Promise<void> {
		try {
			// Keep entries written by a newer version so that they are not lost
			const unknownEntries = loadUnknownEntries();
			localStorage.setItem(
				storageKey,
				JSON.stringify([...items.map((x) => x.serialize()), ...unknownEntries]),
			);
			return Promise.resolve();
		} catch (e) {
			return Promise.reject(e);
		}
	}
}

/**
 * Load saved strings from localStorage.
 * @returns Saved strings.
 */
function loadRawEntries(): string[] {
	const data = localStorage.getItem(storageKey);
	if (data === null) {
		return [];
	}
	const json: unknown = JSON.parse(data);
	if (!Array.isArray(json)) {
		return [];
	}
	return json.filter((x): x is string => typeof x === "string");
}

function loadItems(): PokemonBoxItem[] {
	const items: PokemonBoxItem[] = [];
	for (const item of loadRawEntries()) {
		const boxItem = deserializeBoxItem(item);
		if (boxItem === null) {
			continue;
		}
		items.push(boxItem);

		if (items.length >= PokemonBox.maxEntryCount) {
			break;
		}
	}
	return items;
}

/**
 * Load saved strings that cannot be parsed (possibly written by a newer version).
 * @returns Strings that cannot be parsed.
 */
function loadUnknownEntries(): string[] {
	try {
		return loadRawEntries().filter((x) => deserializeBoxItem(x) === null);
	} catch {
		return [];
	}
}
