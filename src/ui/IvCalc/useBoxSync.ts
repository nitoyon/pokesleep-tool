import type { User } from "firebase/auth";
import React from "react";
import { type BoxRepository, diffBoxItems } from "../../util/Box/BoxRepository";
import { LocalBoxRepository } from "../../util/Box/LocalBoxRepository";
import type PokemonBox from "../../util/Box/PokemonBox";
import type { PokemonBoxItem } from "../../util/Box/PokemonBox";
import { SaveTracker } from "../../util/Box/SaveTracker";
import type { BoxStatus, IvAction } from "./IvState";

const loadFirebaseBoxRepository = () =>
	import("../../util/Firebase/BoxRepository.js");

/**
 * Custom React hook to load and save the box.
 *
 * The box is loaded from localStorage when signed out, and from the cloud
 * when signed in. Changes of `box` are saved to the same storage.
 * When the cloud box is empty, items in localStorage are imported.
 * While saving to the cloud and when it completes, an alert is shown.
 *
 * @param box Current box.
 * @param boxStatus Current box status.
 * @param reloadCount Reload the box when this value changes.
 * @param user Signed-in user, null when signed out, or undefined while
 *             the sign-in state is not yet known.
 * @param dispatch Dispatch function of IvState.
 */
export function useBoxSync(
	box: PokemonBox,
	boxStatus: BoxStatus,
	reloadCount: number,
	user: User | null | undefined,
	dispatch: (action: IvAction) => void,
): void {
	// Repository of the current user.
	// Reused on reload so that it can wait for pending saves.
	const repoRef = React.useRef<{
		uid: string | null;
		repo: BoxRepository;
	} | null>(null);
	// Repository and the items last loaded from or saved to it
	const syncRef = React.useRef<{
		repo: BoxRepository;
		items: PokemonBoxItem[];
	} | null>(null);
	const [isSaving, setIsSaving] = React.useState(false);
	const [tracker] = React.useState(
		() =>
			new SaveTracker((status) => {
				setIsSaving(status === "saving");
				// "error" is alerted by each failed save
				if (status === "saving") {
					dispatch({ type: "showAlert", payload: { message: "box saving" } });
				} else if (status === "saved") {
					dispatch({ type: "showAlert", payload: { message: "box saved" } });
				}
			}),
	);

	// Load the box when the user changes or reload is requested.
	// The user object may change without changing uid (e.g. token refresh),
	// so keep it in a ref and depend only on uid.
	const userRef = React.useRef(user);
	userRef.current = user;
	const uid = user === undefined ? undefined : (user?.uid ?? null);
	// biome-ignore lint/correctness/useExhaustiveDependencies: reload when reloadCount changes
	React.useEffect(() => {
		if (uid === undefined) {
			return;
		}
		let cancelled = false;
		syncRef.current = null;
		dispatch({ type: "boxLoading" });

		const cached = repoRef.current;
		const repoPromise =
			cached !== null && cached.uid === uid
				? Promise.resolve(cached.repo)
				: createRepository(userRef.current ?? null).then((repo) => {
						repoRef.current = { uid, repo };
						return repo;
					});
		repoPromise
			.then(async (repo) => {
				const items = await repo.load();
				if (cancelled) {
					return;
				}
				syncRef.current = { repo, items };
				dispatch({ type: "boxLoaded", payload: { items } });

				// Import the local box into the empty cloud box.
				// Imported items are saved in the background like other changes.
				if (repo.isRemote && items.length === 0) {
					const localItems = await loadLocalItems();
					if (!cancelled && localItems.length > 0) {
						dispatch({
							type: "importItems",
							payload: {
								entries: localItems.map((x) => ({
									iv: x.iv,
									nickname: x.nickname,
								})),
							},
						});
					}
				}
			})
			.catch((e: unknown) => {
				console.error(e);
				if (!cancelled) {
					dispatch({ type: "boxLoadFailed" });
				}
			});
		return () => {
			cancelled = true;
		};
	}, [uid, reloadCount, dispatch]);

	// Save the changes of the box
	React.useEffect(() => {
		const sync = syncRef.current;
		if (sync === null || boxStatus !== "ready" || sync.items === box.items) {
			return;
		}
		const ops = diffBoxItems(sync.items, box.items);
		sync.items = box.items;
		if (ops.length === 0) {
			return;
		}

		let promise = sync.repo.apply(ops, box.items);
		if (sync.repo.isRemote) {
			promise = tracker.track(promise);
		}
		promise.catch((e: unknown) => {
			console.error(e);
			dispatch({
				type: "showAlert",
				payload: { message: "failed to save box" },
			});
		});
	}, [box, boxStatus, dispatch, tracker]);

	// Warn before leaving the page while saving
	React.useEffect(() => {
		if (!isSaving) {
			return;
		}
		const handler = (e: BeforeUnloadEvent) => {
			if (tracker.isSaving) {
				e.preventDefault();
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isSaving, tracker]);
}

/**
 * Load items saved in localStorage.
 * @returns Loaded items, or an empty array if loading fails.
 */
async function loadLocalItems(): Promise<PokemonBoxItem[]> {
	try {
		return await new LocalBoxRepository().load();
	} catch (e) {
		console.error(e);
		return [];
	}
}

/**
 * Create a box repository for the user.
 * @param user Signed-in user, or null when signed out.
 * @returns Created repository.
 */
async function createRepository(user: User | null): Promise<BoxRepository> {
	if (user === null) {
		return new LocalBoxRepository();
	}
	const mod = await loadFirebaseBoxRepository();
	return mod.createFirebaseBoxRepository();
}
