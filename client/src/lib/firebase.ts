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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const normalizeStorageBucket = (bucket?: string) => {
  if (!bucket) return bucket;
  return bucket
    .replace(/^gs:\/\//, "")
    .replace(/\/.*/, "")
    .trim();
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ||
    `${import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: normalizeStorageBucket(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ||
      `${import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()}.firebasestorage.app`,
  ),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

let auth: ReturnType<typeof getAuth> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;
let firebaseInitError: string | null = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
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

const ensureStorage = () => {
  if (!storage) {
    throw new Error(firebaseInitError ?? "Firebase Storage is unavailable.");
  }
  return storage;
};

export const uploadArticleImage = async (file: File, slug: string) => {
  const activeStorage = ensureStorage();
  const cleanSlug = slug.trim() || "untitled";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `articles/${cleanSlug}/${Date.now()}-${safeName}`;
  const fileRef = ref(activeStorage, path);
  try {
    await uploadBytes(fileRef, file, {
      contentType: file.type || "application/octet-stream",
    });
  } catch (error) {
    const storageError = error as { code?: string; message?: string };
    const code = storageError.code ? ` (${storageError.code})` : "";
    throw new Error(
      `Image upload failed${code}. Check Firebase Storage bucket name, rules, and CORS settings.`,
    );
  }
  return getDownloadURL(fileRef);
};

export const uploadMediaAsset = async (file: File) => {
  const activeStorage = ensureStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `media/${Date.now()}-${safeName}`;
  const fileRef = ref(activeStorage, path);
  try {
    await uploadBytes(fileRef, file, {
      contentType: file.type || "application/octet-stream",
    });
  } catch (error) {
    const storageError = error as { code?: string; message?: string };
    const code = storageError.code ? ` (${storageError.code})` : "";
    throw new Error(
      `Media upload failed${code}. Check Firebase Storage bucket name, rules, and CORS settings.`,
    );
  }
  return getDownloadURL(fileRef);
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
