import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web app configuration.
 *
 * These values are not secrets. They identify the Firebase project and are
 * exposed to the browser anyway. Copy them from
 * Firebase Console > Project settings > General > Your apps.
 */
const firebaseConfig: FirebaseOptions = {
	apiKey: "AIzaSyCJPmn8LHWh-0oZV4ksrHquvmMkIkSMrts",
	authDomain: "pksl-nitoyon.firebaseapp.com",
	projectId: "pksl-nitoyon",
	storageBucket: "pksl-nitoyon.firebasestorage.app",
	messagingSenderId: "198302104644",
	appId: "1:198302104644:web:0f86d99794fc72d7c15011",
	measurementId: "G-VY6PD8PVTB",
};

export default firebaseConfig;
