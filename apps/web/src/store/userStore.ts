import { create } from "zustand";

type Role = "MEMBER" | "ADMIN";

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
  setSession: (user, token) => set({ user, accessToken: token }),
  setAccessToken: (token) => set((state) => ({ ...state, accessToken: token })),
  clear: () => set({ user: null, accessToken: null })
}));
