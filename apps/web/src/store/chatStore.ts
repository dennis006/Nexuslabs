import { create } from "zustand";
import type { ChatMessage } from "@/lib/api/types";
import { dedupeById } from "@/lib/utils/dedupe";

type State = {
  messagesMap: Map<string, ChatMessage>;
  ordered: () => ChatMessage[];
  connected: boolean;
};
type Actions = {
  connect: () => void;
  disconnect: () => void;
  addMessage: (msg: ChatMessage) => void;
  addMessages: (msgs: ChatMessage[]) => void;
  clear: () => void;
};

export const useChatStore = create<State & Actions>((set, get) => ({
  messagesMap: new Map(),
  connected: false,
  ordered: () => {
    const values = Array.from(get().messagesMap.values());
    values.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return values;
  },
  connect: () => set({ connected: true }),
  disconnect: () => set({ connected: false }),
  addMessage: (msg) =>
    set((s) => {
      const map = new Map(s.messagesMap);
      map.set(msg.id, msg);
      return { messagesMap: map };
    }),
  addMessages: (msgs) =>
    set((s) => {
      const map = new Map(s.messagesMap);
      for (const m of dedupeById(msgs)) map.set(m.id, m);
      return { messagesMap: map };
    }),
  clear: () => set({ messagesMap: new Map() }),
}));
