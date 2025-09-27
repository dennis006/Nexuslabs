import type { ChatMessage } from "@/lib/api/types";
import { newId } from "@/lib/utils/id";

type Handler = (payload: any) => void;

const handlers: Record<string, Set<Handler>> = {
  "chat:message": new Set(),
  "presence:update": new Set(),
};

let started = false;
let chatInterval: number | undefined;
let presenceInterval: number | undefined;

export function on(event: keyof typeof handlers, cb: Handler) {
  handlers[event].add(cb);
  return () => handlers[event].delete(cb);
}

function emit(event: keyof typeof handlers, payload: any) {
  handlers[event].forEach((cb) => cb(payload));
}

export function startMock() {
  if (started) return;
  started = true;

  chatInterval = window.setInterval(() => {
    const msg: ChatMessage = {
      id: newId("msg"),
      text: sampleText(),
      createdAt: new Date().toISOString(),
      system: Math.random() < 0.2,
      author: { id: "sys", name: "System" },
    };
    emit("chat:message", msg);
  }, 4500 + Math.random() * 2500) as unknown as number;

  presenceInterval = window.setInterval(() => {
    emit("presence:update", { online: 100 + Math.floor(Math.random() * 30) });
  }, 3000) as unknown as number;
}

export function stopMock() {
  if (chatInterval) clearInterval(chatInterval);
  if (presenceInterval) clearInterval(presenceInterval);
  chatInterval = undefined;
  presenceInterval = undefined;
  started = false;
}

function sampleText() {
  const pool = [
    "Welcome to NexusLabs!",
    "New thread just dropped 👀",
    "Ping spike on EU servers.",
    "Patch notes live.",
    "Party up for M+?",
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
