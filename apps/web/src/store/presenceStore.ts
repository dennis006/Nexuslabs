import { create } from "zustand";

interface PresenceState {
  onlineCount: number;
  setOnlineCount: (count: number) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineCount: 148,
  setOnlineCount: (count) => set({ onlineCount: Math.max(0, count) })
}));
