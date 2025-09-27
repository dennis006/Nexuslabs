# NexusLabs – Gaming Forum

Ein modernes Gaming-Forum als Single-Page-Application auf Basis von **Vite**, **React 18**, **TypeScript** und **Tailwind CSS**. Das Projekt kombiniert klassische Forum-UX mit Echtzeit-Demo-Features, Animationslayern und einem Dock-Chat.

## Features

- 🎮 Landing Page mit tsParticles-Hintergrund, GSAP Scroll-Reveals und Framer-Motion Page-Transition.
- 🧭 React Router v6 mit `AnimatePresence` und maßgeschneiderten Transition-Varianten.
- 🧩 Modularer Komponentenbau mit Tailwind, shadcn-ui (Radix) und Lucide Icons.
- 💬 Simulierter Realtime-Chat (WebSocket Mock) inkl. Presence-Updates via Zustand Stores.
- 📊 Statistik-Sidebar mit Echtzeit-Online-Zahl und animierten Count-Ups.
- 🧵 Forum-Ansichten: Übersicht, Kategorien, Threads, Composer zum Erstellen neuer Beiträge.
- 🌗 Dark Mode standardmäßig aktiv, Light Mode Toggle mit Persistenz.
- 🧹 ESLint + Prettier Konfiguration für sauberen TypeScript-Code.

## Getting Started

```bash
pnpm install
pnpm dev
```

Weitere Skripte:

- `pnpm build` – Production Build
- `pnpm preview` – Vorschau des Builds
- `pnpm lint` – ESLint Check
- `pnpm format` – Prettier Formatierung

## Projektstruktur

```
nexuslabs/
  ├── src/
  │   ├── routes/                 # Seiten & Router-Logik
  │   ├── components/             # UI-Bausteine (layout, forum, chat, common, ui)
  │   ├── store/                  # Zustand Stores (UI, Forum, Chat, Presence)
  │   ├── lib/                    # Mock-API, Animation Helpers, Utils
  │   ├── styles/                 # globale Styles & Tailwind
  │   └── assets/                 # Logos & statische Assets
  ├── tailwind.config.ts
  ├── vite.config.ts
  ├── tsconfig.json
  ├── eslint.config.js
  └── ...
```

## Mock Services & Realtime

- `src/lib/api/mockApi.ts` liefert Fake-Daten (Kategorien, Threads, Posts, Stats) mit simulierten Latenzen.
- `src/lib/realtime/socketMock.ts` simuliert Presence & Chat-Nachrichten.
- Zustand Stores verbinden UI mit den Mock-Services (`useForumStore`, `useChatStore`, `usePresenceStore`, `useUiStore`).

## Styling & Animation

- Tailwind mit glasigen Karten, Neon-Akzenten und animierten Skeletons.
- shadcn-ui Basiskomponenten (Button, Card, Tabs, Dialog, Sheet, Dropdown, Badge ...).
- Framer Motion PageTransitions + Motion-Underline Tabs.
- GSAP ScrollTrigger Hooks für Landing-Feature-Cards.

## Lizenz

Dieses Projekt dient als Demo/Showcase für NexusLabs und ist frei anpassbar.
