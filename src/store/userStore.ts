import { create } from "zustand";

type Role = "guest" | "member" | "admin";
type User = {
  id: string;
  name: string;
  role: Role;
};

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUser = create<UserState>((set) => ({
  user: { id: "u1", name: "Guest", role: "guest" },
  setUser: (user) => set({ user })
}));
