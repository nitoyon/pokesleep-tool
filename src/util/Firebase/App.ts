import { type FirebaseApp, initializeApp } from "firebase/app";
import firebaseConfig from "./Config";

// This module pulls in the Firebase SDK. Load it with dynamic import()
// so that the SDK is not included in the initial bundle.

let app: FirebaseApp | null = null;

/**
 * Get the Firebase app, initializing it on the first call.
 * @returns Firebase app.
 */
export function getFirebaseApp(): FirebaseApp {
	if (app === null) {
		app = initializeApp(firebaseConfig);
	}
	return app;
}
