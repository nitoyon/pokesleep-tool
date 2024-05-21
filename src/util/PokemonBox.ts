import PokemonIv from './PokemonIv';
import i18next from 'i18next'

/**
 * Represents Indivisual Values (IV) of the Pokemon.
 */
class PokemonBox {
    private _entries: PokemonBoxItem[] = [];

    /**
     * Get max entry count.
     */
    static get maxEntryCount(): number {
        return 100;
    }

    /**
     * Get the box entries.
     */
    get items(): PokemonBoxItem[] {
        return [...this._entries];
    }

    /**
     * Returns whether we can add item to this box.
     */
    get canAdd(): boolean {
        return this._entries.length < PokemonBox.maxEntryCount;
    }

    /**
     * Add a new Pokmeon IV.
     * @param iv Pokemon IV to be added.
     * @returns Added item ID.
     */
    add(iv: PokemonIv, nickname?: string): number {
        if (!this.canAdd) {
            throw new Error('max entry count exceeds');
        }
        const item = new PokemonBoxItem(iv, nickname);
        this._entries.push(item);
        return item.id;
    }

    /**
     * Remove existing item by ID.
     * @param id ID.
     */
    remove(id: number) {
        this._entries = this._entries.filter(x => x.id !== id);
    }

    /**
     * Change the item by ID.
     * @param id ID.
     * @param nickname Nickname of the pockemon.
     * @param iv New pokemon IV.
     */
    set(id: number, iv: PokemonIv, nickname?: string) {
        for (let i = 0; i < this._entries.length; i++) {
            if (this._entries[i].id === id) {
                this._entries[i] = new PokemonBoxItem(iv, nickname, id);
                break;
            }
        }
    }
    
    /**
     * Get box item by ID.
     * @param id ID.
     * @returns box item if found. undefined if not found.
     */
    getById(id: number): PokemonBoxItem|null {
        return this._entries.find(x => x.id === id) ?? null;
    }

    /**
     * Load box data from local storage.
     */
    load() {
        const data = localStorage.getItem("PstPokeBox");
        if (data === null) {
            return [];
        }
        const json = JSON.parse(data);
        if (!Array.isArray(json)) {
            return [];
        }

        const newItems: PokemonBoxItem[] = [];
        for (const item of json) {
            if (typeof(item) !== "string") {
                continue;
            }
            const data = this.deserializeItem(item);
            if (data === null) {
                continue;
            }
            newItems.push(new PokemonBoxItem(data.iv, data.nickname));

            if (newItems.length >= PokemonBox.maxEntryCount) {
                break;
            }
        }
        this._entries = newItems;
    }

    /**
     * Deserialize box item data (xxxxxxx@nickname)
     * @param text   text data.
     * @returns      parsed data.
     */
    deserializeItem(text: string): {iv: PokemonIv, nickname: string}|null {
        const index = text.indexOf("@");
        let ivPart = text;
        let nickname = "";
        if (index !== -1) {
            ivPart = text.substring(0, index);
            nickname = text.substring(index + 1);
        }
        try {
            const iv = PokemonIv.deserialize(ivPart);
            return {iv, nickname};
        }
        catch {
            return null;
        }
    }

    /**
     * Save box data to local storage.
     */
    save() {
        localStorage.setItem("PstPokeBox", JSON.stringify(this._entries
            .map(x => x.serialize())));
    }
}

/**
 * Represents pokemon in the Pokemon box.
 */
export class PokemonBoxItem {
    private _iv: PokemonIv;
    private _nickname: string;
    private _id: number;
    private static nextId: number = 1;

    /**
     * Initialize PokemonBoxItem.
     * @param iv IV data of the pokemon.
     * @param id ID in the box.
     */
    constructor(iv: PokemonIv, nickname?: string, id?: number) {
        this._iv = iv;
        this._nickname = nickname ?? "";
        this._id = (id !== undefined ? id : PokemonBoxItem.nextId++);
    }

    /**
     * Serialize the data to string.
     * @returns Serilized string.
     */
    serialize(): string {
        const serializedIv = this._iv.serialize();
        if (this._nickname === "") {
            return serializedIv;
        }
        return serializedIv + "@" + this._nickname;
    }

    /** Get the Pokemon IV. */
    get iv(): PokemonIv { return this._iv; }

    /** Get the nickname of the Pokemon. */
    get nickname(): string { return this._nickname; }

    /** Get the ID. */
    get id(): number { return this._id; }

    /** Get the filled nickname */
    filledNickname(t: typeof i18next.t): string {
        if (this._nickname !== "") {
            return this._nickname;
        }
        return t(`pokemons.${this.iv.pokemonName}`);
    }
}

export default PokemonBox;
