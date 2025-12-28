import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Configuration
const USER_FIREBASE_CONFIG = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use environment config if available
const firebaseConfig = typeof __firebase_config !== 'undefined'
    ? JSON.parse(__firebase_config)
    : USER_FIREBASE_CONFIG;

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize authentication with custom token if available
export const initAuth = async () => {
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
    } else {
        // Fallback for environment if needed
        await signInAnonymously(auth);
    }
};
