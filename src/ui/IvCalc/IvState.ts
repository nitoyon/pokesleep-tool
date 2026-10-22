import i18n from "../../i18n";
import PokemonBox, { PokemonBoxItem } from "../../util/Box/PokemonBox";
import PokemonIv from "../../util/PokemonIv";
import {
	loadStrengthParameter,
	normalizeStrengthParameter,
	type StrengthParameter,
	saveStrengthParameter,
} from "../../util/PokemonStrength";

export type IvAction =
	| {
			type:
				| "export"
				| "exportClose"
				| "import"
				| "importClose"
				| "deleteAll"
				| "deleteAllClose"
				| "removeAllItems"
				| "boxLoading"
				| "boxLoadFailed"
				| "reloadBox"
				| "saveItem"
				| "restoreItem"
				| "closeAlert"
				| "openEnergyDialog"
				| "closeEnergyDialog";
	  }
	| {
			type: "select" | "dup" | "remove";
			payload: { id: number };
	  }
	| {
			type: "addOrEditDone";
			payload: { item: PokemonBoxItem };
	  }
	| {
			type: "updateIv";
			payload: { iv: PokemonIv };
	  }
	| {
			type: "addThis";
			payload: { iv: PokemonIv; nickname?: string };
	  }
	| {
			type: "changeUpperTab" | "changeLowerTab";
			payload: { index: number };
	  }
	| {
			type: "changeBoxDrawerPosition";
			payload: { position: BoxDrawerPosition };
	  }
	| {
			type: "changeParameter";
			payload: { parameter: StrengthParameter };
	  }
	| {
			type: "boxLoaded";
			payload: { items: PokemonBoxItem[] };
	  }
	| {
			type: "importItems";
			payload: { entries: PokemonBoxItem[] };
	  }
	| {
			type: "showAlert";
			payload: { message: string };
	  }
	| {
			type: "setTeamIndex";
			payload: { teamIndex: number };
	  }
	| {
			type: "setTeamMember";
			payload: {
				teamIndex: number;
				index: number;
				item: PokemonBoxItem | undefined;
			};
	  }
	| {
			type: "setTeamMemberEnabled";
			payload: { teamIndex: number; index: number; enabled: boolean };
	  }
	| {
			type: "setTeamMemberSneakySnacking";
			payload: { teamIndex: number; index: number; sneakySnacking: boolean };
	  };

/**
 * A single team slot: the box item assigned to it plus whether it is
 * currently included in the team strength calculation.
 */
export type TeamMemberSlot = {
	item: PokemonBoxItem;
	enabled: boolean;
	/** Whether this member is set to sneaky snacking. */
	sneakySnacking: boolean;
};

/**
 * A team consisting of 5 member slots.
 */
export type Team = {
	members: (TeamMemberSlot | undefined)[];
};

/** Number of teams the user can switch between. */
export const TEAM_COUNT = 4;

/** Number of member slots in a team. */
export const TEAM_MEMBER_COUNT = 5;

/**
 * Create the initial list of empty teams.
 * @returns Array of {@link TEAM_COUNT} empty teams.
 */
export function createInitialTeams(): Team[] {
	return Array.from({ length: TEAM_COUNT }, () => ({
		members: Array.from({ length: TEAM_MEMBER_COUNT }, () => undefined),
	}));
}

/**
 * Return a new state with a single team member slot updated.
 * @param state Current state.
 * @param teamIndex Index of the target team.
 * @param index Index of the target slot in the team.
 * @param update Function that returns the new slot from the current one.
 * @returns New state.
 */
function updateTeamMember(
	state: IvState,
	teamIndex: number,
	index: number,
	update: (slot: TeamMemberSlot | undefined) => TeamMemberSlot | undefined,
): IvState {
	if (state.teams[teamIndex] === undefined) {
		return state;
	}
	const teams = state.teams.map((team, ti) =>
		ti !== teamIndex
			? team
			: {
					...team,
					members: team.members.map((x, i) => (i === index ? update(x) : x)),
				},
	);
	return { ...state, teams };
}

/**
 * Status of the box.
 * - `loading`: The box is being loaded from the storage.
 * - `ready`: The box has been loaded.
 * - `error`: Failed to load the box.
 */
export type BoxStatus = "loading" | "ready" | "error";

/**
 * Position where the box item drawer stopped.
 */
export type BoxDrawerPosition = {
	/** Whether the drawer is expanded to full screen. */
	full: boolean;
	/**
	 * Height of the drawer when not expanded (in pixels).
	 * null means the default half height.
	 */
	height: number | null;
};

export const defaultBoxDrawerPosition: BoxDrawerPosition = {
	full: false,
	height: null,
};

type IvState = {
	tabIndex: number;
	lowerTabIndex: number;
	boxDrawerPosition: BoxDrawerPosition;
	pokemonIv: PokemonIv;
	parameter: StrengthParameter;
	box: PokemonBox;
	boxStatus: BoxStatus;
	/** Incremented to request reloading the box from the storage. */
	boxReloadCount: number;
	selectedItemId: number;
	energyDialogOpen: boolean;
	boxExportDialogOpen: boolean;
	boxImportDialogOpen: boolean;
	boxDeleteAllDialogOpen: boolean;
	alertMessage: string;
	/** Teams shown in the Team tab. */
	teams: Team[];
	/** Index of the currently selected team in {@link teams}. */
	teamIndex: number;
};

/**
 * IvState saved to localStorage.
 */
type IvStateCache = {
	tabIndex: number;
	lowerTabIndex: number;
	boxDrawerFull: boolean;
	boxDrawerHeight: number | null;
	iv: string;
	selectedIv: string;
};

/**
 * Get initial IvState object.
 * @returns Initial IvState.
 */
export function getInitialIvState(): IvState {
	const cache = loadInitialIvStateCache();
	let iv = new PokemonIv({ pokemonName: "Venusaur" });
	if (cache.iv !== "") {
		try {
			iv = PokemonIv.deserialize(cache.iv);
		} catch {
			// ignore deserialization error (e.g. corrupted cache)
		}
	}
	const ret: IvState = {
		tabIndex: cache.tabIndex,
		lowerTabIndex: cache.lowerTabIndex,
		boxDrawerPosition: {
			full: cache.boxDrawerFull,
			height: cache.boxDrawerHeight,
		},
		pokemonIv: iv,
		parameter: loadStrengthParameter(),
		box: new PokemonBox(),
		boxStatus: "loading",
		boxReloadCount: 0,
		selectedItemId: -1,
		energyDialogOpen: false,
		boxExportDialogOpen: false,
		boxImportDialogOpen: false,
		boxDeleteAllDialogOpen: false,
		alertMessage: "",
		teams: createInitialTeams(),
		teamIndex: 0,
	};

	// Update initial pokemonIv
	const m = document.location.hash.match(/#p=(.*)/);
	if (m !== null) {
		try {
			ret.pokemonIv = PokemonIv.deserialize(m[1]);
		} catch {
			// ignore deserialization error (e.g. corrupted cache)
		}
	}

	return ret;
}

/**
 * Load IvStateCache from localStorage.
 * @returns Loaded IvStateCache.
 */
function loadInitialIvStateCache(): IvStateCache {
	const ret: IvStateCache = {
		tabIndex: 0,
		lowerTabIndex: 0,
		boxDrawerFull: defaultBoxDrawerPosition.full,
		boxDrawerHeight: defaultBoxDrawerPosition.height,
		iv: "",
		selectedIv: "",
	};

	const settings = localStorage.getItem("PstIvState");
	if (settings === null) {
		return ret;
	}
	const json = JSON.parse(settings);
	if (typeof json !== "object" || json === null) {
		return ret;
	}
	if (
		typeof json.tabIndex === "number" &&
		json.tabIndex >= 0 &&
		json.tabIndex <= 3
	) {
		ret.tabIndex = json.tabIndex;
	}
	if (
		typeof json.lowerTabIndex === "number" &&
		json.lowerTabIndex >= 0 &&
		json.lowerTabIndex <= 2
	) {
		ret.lowerTabIndex = json.lowerTabIndex;
	}
	if (typeof json.boxDrawerFull === "boolean") {
		ret.boxDrawerFull = json.boxDrawerFull;
	}
	if (
		typeof json.boxDrawerHeight === "number" &&
		Number.isFinite(json.boxDrawerHeight) &&
		json.boxDrawerHeight > 0
	) {
		ret.boxDrawerHeight = json.boxDrawerHeight;
	}
	if (typeof json.iv === "string") {
		ret.iv = json.iv;
	}
	if (typeof json.selectedIv === "string") {
		ret.selectedIv = json.selectedIv;
	}
	return ret;
}

/**
 * Find the box item selected last time.
 * @param items Box items.
 * @returns ID of the item, or -1 if not found.
 */
function findCachedSelectedItemId(items: PokemonBoxItem[]): number {
	const cache = loadInitialIvStateCache();
	if (cache.selectedIv === "") {
		return -1;
	}
	try {
		const selectedIv = PokemonIv.deserialize(cache.selectedIv);
		return items.find((x) => x.iv.isEqual(selectedIv))?.id ?? -1;
	} catch {
		// ignore deserialization error (e.g. corrupted cache)
		return -1;
	}
}

/**
 * Save IvState to localStorage.
 * @param state IvState.
 */
function saveIvStateCache(state: IvState) {
	let selectedIv = "";
	if (state.boxStatus !== "ready") {
		// Keep the selection until the box is loaded
		selectedIv = loadInitialIvStateCache().selectedIv;
	} else {
		selectedIv = state.box.getById(state.selectedItemId)?.iv.serialize() ?? "";
	}
	const cache: IvStateCache = {
		tabIndex: state.tabIndex,
		lowerTabIndex: state.lowerTabIndex,
		boxDrawerFull: state.boxDrawerPosition.full,
		boxDrawerHeight: state.boxDrawerPosition.height,
		iv: state.pokemonIv.serialize(),
		selectedIv,
	};
	localStorage.setItem("PstIvState", JSON.stringify(cache));
}

/** Actions that change the box items. */
const boxChangingActions: ReadonlySet<IvAction["type"]> = new Set([
	"addThis",
	"import",
	"importItems",
	"deleteAll",
	"removeAllItems",
	"saveItem",
	"addOrEditDone",
	"dup",
	"remove",
]);

export function ivStateReducer(state: IvState, action: IvAction): IvState {
	const type = action.type;
	const selectedItem = state.box.getById(state.selectedItemId);
	if (state.boxStatus !== "ready" && boxChangingActions.has(type)) {
		// Changes made while loading would be overwritten by the loaded box,
		// and changes made after a load failure would not be saved.
		return state;
	}
	if (type === "boxLoading") {
		return {
			...state,
			box: new PokemonBox(),
			boxStatus: "loading",
			selectedItemId: -1,
		};
	}
	if (type === "boxLoadFailed") {
		return {
			...state,
			boxStatus: "error",
			alertMessage: "failed to load box",
		};
	}
	if (type === "reloadBox") {
		return { ...state, boxReloadCount: state.boxReloadCount + 1 };
	}
	if (type === "boxLoaded") {
		const { items } = action.payload;
		return normalizeState({
			...state,
			box: new PokemonBox(items),
			boxStatus: "ready",
			selectedItemId: findCachedSelectedItemId(items),
		});
	}
	if (type === "changeUpperTab") {
		const value = action.payload.index;
		let lowerTabIndex = state.lowerTabIndex;
		if (value !== 1 && lowerTabIndex === 2) {
			lowerTabIndex = 0;
		}
		const newState = { ...state, tabIndex: value, lowerTabIndex };
		saveIvStateCache(newState);
		return newState;
	}
	if (type === "changeLowerTab") {
		const newState = { ...state, lowerTabIndex: action.payload.index };
		saveIvStateCache(newState);
		return newState;
	}
	if (type === "changeBoxDrawerPosition") {
		const newState = {
			...state,
			boxDrawerPosition: action.payload.position,
		};
		saveIvStateCache(newState);
		return newState;
	}
	if (type === "changeParameter") {
		const value = action.payload.parameter;
		const newState = normalizeState({ ...state, parameter: value });
		saveStrengthParameter(newState.parameter);
		return newState;
	}
	if (type === "openEnergyDialog") {
		return { ...state, energyDialogOpen: true };
	}
	if (type === "closeEnergyDialog") {
		return { ...state, energyDialogOpen: false };
	}
	if (type === "updateIv") {
		const newState = normalizeState({ ...state, pokemonIv: action.payload.iv });
		saveIvStateCache(newState);
		return newState;
	}
	if (type === "addThis") {
		if (!state.box.canAdd) {
			return { ...state, alertMessage: "box is full" };
		}

		const box = new PokemonBox(state.box.items);
		const selectedItemId: number = box.add(
			new PokemonBoxItem(action.payload.iv, action.payload.nickname),
		);
		return { ...state, box, selectedItemId };
	}
	if (type === "export") {
		return { ...state, boxExportDialogOpen: true };
	}
	if (type === "exportClose") {
		return { ...state, boxExportDialogOpen: false };
	}
	if (type === "import") {
		if (!state.box.canAdd) {
			return { ...state, alertMessage: "box is full" };
		}

		return { ...state, boxImportDialogOpen: true };
	}
	if (type === "importClose") {
		return { ...state, boxImportDialogOpen: false };
	}
	if (type === "importItems") {
		const box = new PokemonBox(state.box.items);
		for (const entry of action.payload.entries) {
			if (!box.canAdd) {
				break;
			}
			box.add(entry);
		}
		return { ...state, box };
	}
	if (type === "deleteAll") {
		return { ...state, boxDeleteAllDialogOpen: true };
	}
	if (type === "deleteAllClose") {
		return { ...state, boxDeleteAllDialogOpen: false };
	}
	if (type === "removeAllItems") {
		return { ...state, box: new PokemonBox(), selectedItemId: -1 };
	}
	if (type === "restoreItem") {
		if (selectedItem !== null) {
			const newValue = normalizeState({ ...state, pokemonIv: selectedItem.iv });
			saveIvStateCache(newValue);
			return newValue;
		}
		return state;
	}
	if (type === "saveItem") {
		const boxItem = state.box.getById(state.selectedItemId);

		// Set nickname
		let nickName = "";
		if (boxItem !== null) {
			nickName = boxItem.nickname;
			const translatedName = i18n.t(`pokemons.${boxItem.iv.pokemon.name}`);
			if (nickName === translatedName) {
				nickName = "";
			}
		}

		const box = new PokemonBox(state.box.items);
		box.set(state.selectedItemId, state.pokemonIv, nickName);
		const newState = { ...state, box };
		saveIvStateCache(newState);
		return newState;
	}

	if (type === "addOrEditDone") {
		const value = action.payload.item;
		const box = new PokemonBox(state.box.items);
		let selectedItemId = state.selectedItemId;
		if (value.id === -1) {
			selectedItemId = box.add(new PokemonBoxItem(value.iv, value.nickname));
		} else {
			box.set(value.id, value.iv, value.nickname);
		}
		const newState = normalizeState({ ...state, pokemonIv: value.iv, box });
		newState.selectedItemId = selectedItemId;
		saveIvStateCache(newState);
		return newState;
	}

	if (type === "showAlert") {
		return { ...state, alertMessage: action.payload.message };
	}
	if (type === "closeAlert") {
		return { ...state, alertMessage: "" };
	}

	if (type === "setTeamIndex") {
		const { teamIndex } = action.payload;
		if (teamIndex < 0 || teamIndex >= state.teams.length) {
			return state;
		}
		return { ...state, teamIndex };
	}

	if (type === "setTeamMember") {
		const { teamIndex, index, item } = action.payload;
		return updateTeamMember(state, teamIndex, index, (x) => {
			if (item === undefined) {
				return undefined;
			}
			// Keep the current enabled/sneakySnacking state when replacing
			// the pokemon (e.g. editing IV) so a disabled slot stays disabled.
			return {
				item,
				enabled: x?.enabled ?? true,
				sneakySnacking: x?.sneakySnacking ?? false,
			};
		});
	}

	if (type === "setTeamMemberEnabled") {
		const { teamIndex, index, enabled } = action.payload;
		return updateTeamMember(state, teamIndex, index, (x) =>
			x !== undefined ? { ...x, enabled } : x,
		);
	}

	if (type === "setTeamMemberSneakySnacking") {
		const { teamIndex, index, sneakySnacking } = action.payload;
		return updateTeamMember(state, teamIndex, index, (x) =>
			x !== undefined ? { ...x, sneakySnacking } : x,
		);
	}

	// following action requires item
	if (type !== "select" && type !== "dup" && type !== "remove") {
		return state;
	}
	const id = action.payload.id;
	const item = state.box.getById(id);
	if (item === null) {
		return state;
	}
	if (type === "select") {
		const newState = normalizeState({ ...state, pokemonIv: item.iv });
		newState.selectedItemId = id;
		saveIvStateCache(newState);
		return newState;
	} else if (type === "dup") {
		const box = new PokemonBox(state.box.items);
		const selectedItemId: number = box.add(item.clone());
		return { ...state, box, selectedItemId };
	} else if (type === "remove") {
		const box = new PokemonBox(state.box.items);
		box.remove(id);
		return { ...state, box };
	}
	return state;
}

export function normalizeState(state: IvState): IvState {
	const selectedItem = state.box.getById(state.selectedItemId);

	// apply event fixedBerries type
	state.parameter = normalizeStrengthParameter(state.parameter);

	// fix species count
	if (
		!state.parameter.berryBurstTeam.auto &&
		state.pokemonIv.pokemon.skill === "Energy for Everyone S (Lunar Blessing)"
	) {
		const species =
			state.parameter.berryBurstTeam.members.filter(
				(x) => x.type === state.pokemonIv.pokemon.type,
			).length + 1;
		if (species <= 2) {
			state.parameter.berryBurstTeam.species = species;
		} else {
			state.parameter.berryBurstTeam.species = Math.min(
				species,
				state.parameter.berryBurstTeam.species,
			);
		}
	}

	// if form pokemon differs from the selected pokemon in the box,
	// unselect the pokemon in the box
	let selectedItemId = state.selectedItemId;
	if (selectedItem !== null) {
		// Ancestor of Evolving pokemon has changed
		if (selectedItem.iv.pokemon.ancestor !== state.pokemonIv.pokemon.ancestor) {
			selectedItemId = -1;
		}
		// Non-evolving pokemon has changed
		if (
			selectedItem.iv.pokemon.ancestor === null &&
			selectedItem.iv.pokemon.id !== state.pokemonIv.pokemon.id
		) {
			selectedItemId = -1;
		}
	}

	return { ...state, selectedItemId };
}

export default IvState;
