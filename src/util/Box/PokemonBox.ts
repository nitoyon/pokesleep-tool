import type i18next from "i18next";
import PokemonIv from "../PokemonIv";

/**
 * Represents Indivisual Values (IV) of the Pokemon.
 */
class PokemonBox {
	private _entries: PokemonBoxItem[] = [];

	/**
	 * Get max entry count.
	 */
	static get maxEntryCount(): number {
		return 300;
	}

	/**
	 * Initialize new PokemonBox object.
	 * @param items Initial items.
	 */
	constructor(items?: PokemonBoxItem[]) {
		this._entries = items || [];
	}

	/**
	 * Get the box entries.
	 */
	get items(): PokemonBoxItem[] {
		return this._entries;
	}

	/**
	 * Returns whether we can add item to this box.
	 */
	get canAdd(): boolean {
		return this._entries.length < PokemonBox.maxEntryCount;
	}

	/**
	 * Add a new item.
	 * @param item Item to be added.
	 * @returns Added item ID.
	 */
	add(item: PokemonBoxItem): number {
		if (!this.canAdd) {
			throw new Error("max entry count exceeds");
		}
		this._entries = [...this._entries, item];
		return item.id;
	}

	/**
	 * Remove existing item by ID.
	 * @param id ID.
	 */
	remove(id: number) {
		this._entries = this._entries.filter((x) => x.id !== id);
	}

	/**
	 * Remove all items.
	 */
	removeAll() {
		this._entries = [];
	}

	/**
	 * Change the item by ID.
	 *
	 * Attributes of the existing item are kept.
	 * @param id ID.
	 * @param iv New pokemon IV.
	 * @param nickname Nickname of the pockemon.
	 */
	set(id: number, iv: PokemonIv, nickname?: string) {
		// Create a new array not to modify the array shared with other boxes
		this._entries = this._entries.map((x) =>
			x.id === id ? new PokemonBoxItem(iv, nickname, x.attributes, id) : x,
		);
	}

	/**
	 * Get box item by ID.
	 * @param id ID.
	 * @returns box item if found. undefined if not found.
	 */
	getById(id: number): PokemonBoxItem | null {
		return this._entries.find((x) => x.id === id) ?? null;
	}
}

/**
 * Deserialize box item data (`iv[.attributes][@nickname]`).
 * @param text   text data.
 * @returns      parsed item, or null if the text is invalid.
 */
export function deserializeBoxItem(text: string): PokemonBoxItem | null {
	// Split at the first "@"
	const index = text.indexOf("@");
	let head = text;
	let nickname = "";
	if (index !== -1) {
		head = text.substring(0, index);
		nickname = text.substring(index + 1);
	}

	// Split at the first "."
	const dotIndex = head.indexOf(".");
	let ivPart = head;
	let attributes = "";
	if (dotIndex !== -1) {
		ivPart = head.substring(0, dotIndex);
		attributes = head.substring(dotIndex + 1);
	}

	// Parse the IV
	try {
		const iv = PokemonIv.deserialize(ivPart);
		return new PokemonBoxItem(iv, nickname, attributes);
	} catch {
		return null;
	}
}

/**
 * Represents pokemon in the Pokemon box.
 */
export class PokemonBoxItem {
	private _iv: PokemonIv;
	private _nickname: string;
	private _attributes: string;
	private _id: number;
	private static nextId: number = 1;

	/**
	 * Initialize PokemonBoxItem.
	 * @param iv IV data of the pokemon.
	 * @param nickname Nickname of the pokemon.
	 * @param attributes Attributes of the item.
	 * @param id ID in the box.
	 */
	constructor(
		iv: PokemonIv,
		nickname?: string,
		attributes?: string,
		id?: number,
	) {
		this._iv = iv;
		this._nickname = nickname ?? "";
		this._attributes = attributes ?? "";
		this._id = id !== undefined ? id : PokemonBoxItem.nextId++;
	}

	/**
	 * Serialize the data to string (`iv[.attributes][@nickname]`).
	 * @returns Serilized string.
	 */
	serialize(): string {
		let ret = this._iv.serialize();
		if (this._attributes !== "") {
			ret += `.${this._attributes}`;
		}
		if (this._nickname !== "") {
			ret += `@${this._nickname}`;
		}
		return ret;
	}

	/**
	 * Create a copy of the item with a new ID.
	 * @returns Copied item.
	 */
	clone(): PokemonBoxItem {
		return new PokemonBoxItem(
			this._iv.clone(),
			this._nickname,
			this._attributes,
		);
	}

	/** Get the Pokemon IV. */
	get iv(): PokemonIv {
		return this._iv;
	}

	/** Get the nickname of the Pokemon. */
	get nickname(): string {
		return this._nickname;
	}

	/** Get the attributes of the item. */
	get attributes(): string {
		return this._attributes;
	}

	/** Get the ID. */
	get id(): number {
		return this._id;
	}

	/** Get the filled nickname */
	filledNickname(t: typeof i18next.t): string {
		if (this._nickname !== "") {
			return this._nickname;
		}
		return t(`pokemons.${this.iv.pokemonName}`);
	}
}

export default PokemonBox;
