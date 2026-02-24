"use client";

import React, { createContext, useEffect, useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from "firebase/auth";
import { User } from "firebase/auth";
import { auth, getFirebaseReady } from "../firebase/firebase";
import { useAuthStore } from "../authStore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setAuthInStore = useAuthStore.getState().setAuth;
    let unsubscribe: () => void = () => {};
    getFirebaseReady().then(() => {
      unsubscribe = auth.onAuthStateChanged((user) => {
        console.log("[AuthContext] onAuthStateChanged", {
          hasUser: !!user,
          uid: user?.uid ?? null,
          email: user?.email ?? null,
        });
        setUser(user);
        setAuthInStore(user?.uid ?? null, user?.email ?? "");
        setLoading(false);
      });
    }).catch((err) => {
      console.warn("[AuthContext] getFirebaseReady failed", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
