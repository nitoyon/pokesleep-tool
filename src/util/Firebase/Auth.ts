import { FirebaseError } from "firebase/app";
import {
	type Auth,
	GoogleAuthProvider,
	getAuth,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
	type User,
} from "firebase/auth";
import { getFirebaseApp } from "./App";

let auth: Auth | null = null;

function getFirebaseAuth(): Auth {
	if (auth === null) {
		auth = getAuth(getFirebaseApp());
	}
	return auth;
}

/**
 * Subscribes to sign-in state changes.
 * @param callback Called with the signed-in user, or null when signed out.
 * @returns Function to unsubscribe.
 */
export function subscribeAuthUser(
	callback: (user: User | null) => void,
): () => void {
	return onAuthStateChanged(getFirebaseAuth(), callback);
}

/**
 * Signs in with a Google account using a popup.
 * @returns true if signed in, false if the user cancelled.
 */
export async function signInWithGoogle(): Promise<boolean> {
	try {
		await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
		return true;
	} catch (e) {
		if (
			e instanceof FirebaseError &&
			(e.code === "auth/popup-closed-by-user" ||
				e.code === "auth/cancelled-popup-request")
		) {
			return false;
		}
		throw e;
	}
}

/** Signs out the current user. */
export async function signOutUser(): Promise<void> {
	await signOut(getFirebaseAuth());
}
