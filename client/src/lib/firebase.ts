import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let auth: ReturnType<typeof getAuth> | null = null;
let firebaseInitError: string | null = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed", error);
  firebaseInitError = "Firebase initialization failed. Check your Firebase web app credentials.";
}

export { auth, firebaseInitError };
export const googleProvider = new GoogleAuthProvider();

const ensureAuth = () => {
  if (!auth) {
    throw new Error(firebaseInitError ?? "Firebase Auth is unavailable.");
  }
  return auth;
};

export const signInWithGoogle = async () => {
  const activeAuth = ensureAuth();
  let result;
  try {
    result = await signInWithPopup(activeAuth, googleProvider);
  } catch (error) {
    const authError = error as { code?: string };
    const shouldFallbackToRedirect =
      authError.code === "auth/popup-blocked" ||
      authError.code === "auth/popup-closed-by-user" ||
      authError.code === "auth/cancelled-popup-request";

    if (shouldFallbackToRedirect) {
      await signInWithRedirect(activeAuth, googleProvider);
      return null;
    }

    throw error;
  }

  return result.user;
};

export const logout = () => {
  const activeAuth = ensureAuth();
  return signOut(activeAuth);
};

export const onAuthStateChanged = (
  callback: Parameters<typeof firebaseOnAuthStateChanged>[1],
) => {
  if (!auth) {
    if (typeof callback === "function") callback(null);
    return () => {};
  }

  return firebaseOnAuthStateChanged(auth, callback);
};

export type { User };
