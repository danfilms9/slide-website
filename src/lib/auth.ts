import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "./firebase/firebase";

/**
 * Sign in with Google via popup.
 * @returns The user object on success, or null if the user closed the popup or an error occurred.
 */
export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    // User closed popup, cancelled, or other auth error
    const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    console.error("Error signing in with Google", err);
    return null;
  }
}

/** Sign the current user out. */
export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
}

/**
 * Subscribe to auth state changes.
 * @returns Unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/** Return the currently signed-in user, or null. */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
