import { create } from "zustand";

/**
 * Auth state in a Zustand store so components inside R3F Canvas
 * (which don't receive React Context from outside) can read auth.
 * AuthContext syncs Firebase user into this store.
 */
export interface AuthStoreState {
  userId: string | null;
  email: string;
  setAuth: (userId: string | null, email: string) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  userId: null,
  email: "",
  setAuth: (userId, email) => set({ userId, email: email ?? "" }),
}));
