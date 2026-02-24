import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

let initPromise: Promise<void> | null = null;

function getConfigFromEnv() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") return null;
  return {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function initFromConfig(config: {
  apiKey: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}) {
  if (app) return;
  app = getApps().length ? getApp() : initializeApp(config);
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
  storageInstance = getStorage(app);
}

function initFirebase(): void {
  if (typeof window === "undefined") return;
  if (app) return;

  const config = getConfigFromEnv();
  if (config) {
    initFromConfig(config);
    return;
  }

  // Client bundle may not have env inlined; fetch from API
  if (!initPromise) {
    initPromise = fetch("/api/firebase-config")
      .then((r) => {
        if (!r.ok) throw new Error("Firebase config unavailable");
        return r.json();
      })
      .then((config) => {
        initFromConfig(config);
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Firebase] Could not load config:", err?.message ?? err);
        }
        initPromise = null; // allow retry
      });
  }
}

/** Resolves when Firebase is ready (after env or API config load). Use in AuthContext etc. */
export function getFirebaseReady(): Promise<void> {
  initFirebase();
  return initPromise ?? Promise.resolve();
}

function getAuthInstance(): Auth | null {
  initFirebase();
  return authInstance;
}

function getDbInstance(): Firestore | null {
  initFirebase();
  return dbInstance;
}

function getStorageInstance(): FirebaseStorage | null {
  initFirebase();
  return storageInstance;
}

// Auth proxy: delegates to real Auth on client; on server or when config missing, no-ops so SSR doesn't throw
const auth = new Proxy({} as Auth, {
  get(_, prop: string) {
    const a = getAuthInstance();
    if (!a) {
      if (prop === "onAuthStateChanged")
        return (callback: (u: unknown) => void) => {
          callback(null);
          return () => {};
        };
      if (prop === "currentUser") return null;
      return undefined;
    }
    return (a as unknown as Record<string, unknown>)[prop];
  },
});

const db = new Proxy({} as Firestore, {
  get(_, prop: string) {
    const d = getDbInstance();
    if (!d) return undefined;
    return (d as unknown as Record<string, unknown>)[prop];
  },
});

const storage = new Proxy({} as FirebaseStorage, {
  get(_, prop: string) {
    const s = getStorageInstance();
    if (!s) return undefined;
    return (s as unknown as Record<string, unknown>)[prop];
  },
});

export { auth, db, storage };
