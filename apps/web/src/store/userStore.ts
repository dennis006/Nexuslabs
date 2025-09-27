import { create } from "zustand";

type Role = "MEMBER" | "ADMIN";

export const SESSION_STORAGE_KEY = "nexuslabs-session";

const setSessionFlag = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, "1");
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};

export type User = {
  id: string;
  email: string;
  username: string;
  role: Role;
};

type State = {
  user: User | null;
  accessToken: string | null;
};

type Actions = {
  setSession: (user: User, token: string) => void;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  accessToken: null,
  setSession: (user, token) =>
    set(() => {
      setSessionFlag(true);
      return { user, accessToken: token };
    }),
  setAccessToken: (token) => set((state) => ({ ...state, accessToken: token })),
  clear: () =>
    set(() => {
      setSessionFlag(false);
      return { user: null, accessToken: null };
    })
}));
