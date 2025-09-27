import { create } from "zustand";
import type { ChatMessage } from "@/lib/api/types";
import { mockApi } from "@/lib/api/mockApi";
import { socketMock } from "@/lib/realtime/socketMock";

interface ChatState {
  messages: ChatMessage[];
  connected: boolean;
  typing: boolean;
  init: () => Promise<void>;
  sendMessage: (text: string) => void;
  receiveMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  connected: false,
  typing: false,
  async init() {
    if (get().connected) return;
    const seed = await mockApi.getSystemMessages();
    set({ messages: seed, connected: true });
    socketMock.on("chat:message", (payload) => {
      get().receiveMessage(payload);
    });
    socketMock.connect();
  },
  sendMessage(text) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      text,
      createdAt: new Date().toISOString(),
      author: {
        id: "user-self",
        name: "Du",
        avatarUrl: "https://i.pravatar.cc/150?img=5"
      }
    };
    set(({ messages }) => ({ messages: [...messages, message] }));
    // Echo to mock socket for demo layering
    setTimeout(() => {
      socketMock.emit("chat:message", {
        id: crypto.randomUUID(),
        text: "Echo: Danke fürs Teilen!",
        createdAt: new Date().toISOString(),
        system: false
      });
    }, 1200);
  },
  receiveMessage(message) {
    set(({ messages }) => ({ messages: [...messages, message] }));
  }
}));
