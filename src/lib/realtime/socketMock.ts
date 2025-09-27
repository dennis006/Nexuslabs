let msgCounter = 0;

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  msgCounter += 1;
  return `msg_${Date.now()}_${msgCounter}`;
};

type Listener<T> = (payload: T) => void;

type EventMap = {
  "presence:update": number;
  "chat:message": {
    id: string;
    text: string;
    author?: { id: string; name: string; avatarUrl?: string };
    system?: boolean;
    createdAt: string;
  };
};

class SocketMock {
  private listeners: { [K in keyof EventMap]?: Listener<EventMap[K]>[] } = {};
  private presenceInterval?: ReturnType<typeof setInterval>;
  private chatInterval?: ReturnType<typeof setInterval>;
  private connections = 0;
  private started = false;

  connect() {
    this.connections += 1;
    if (this.started) return;
    this.started = true;
    this.startPresence();
    this.startChat();
  }

  disconnect() {
    this.connections = Math.max(0, this.connections - 1);
    if (this.connections === 0 && this.started) {
      if (this.presenceInterval) clearInterval(this.presenceInterval);
      if (this.chatInterval) clearInterval(this.chatInterval);
      this.presenceInterval = undefined;
      this.chatInterval = undefined;
      this.started = false;
    }
  }

  on<K extends keyof EventMap>(event: K, cb: Listener<EventMap[K]>) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(cb);
  }

  off<K extends keyof EventMap>(event: K, cb: Listener<EventMap[K]>) {
    const listeners = this.listeners[event];
    if (!listeners) return;
    const filtered = listeners.filter((listener) => listener !== cb);
    this.listeners[event] = (filtered.length > 0 ? filtered : undefined) as typeof this.listeners[K];
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    (this.listeners[event] || []).forEach((listener) => listener(payload));
  }

  private startPresence() {
    this.presenceInterval = setInterval(() => {
      const base = 140;
      const variance = Math.round(Math.random() * 24 - 12);
      this.emit("presence:update", base + variance);
    }, 3200);
  }

  private startChat() {
    const sampleMessages = [
      "Wer ist heute Abend beim Raid dabei?",
      "Checkt den neuen Speedrun-Guide im RPG-Bereich!",
      "Scrim Lobby öffnet in 10 Minuten.",
      "Neues Highlight-Video ist im Media-Thread live.",
      "Wir testen morgen die Crossplay-Beta."
    ];
    this.chatInterval = setInterval(() => {
      const message = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      this.emit("chat:message", {
        id: generateId(),
        text: message,
        system: Math.random() > 0.75,
        createdAt: new Date().toISOString()
      });
    }, 4200 + Math.random() * 2600);
  }
}

export const socketMock = new SocketMock();
