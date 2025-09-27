# NexusLabs – Gaming Forum & API

Ein modernes Gaming-Forum als Single-Page-Application auf Basis von **Vite**, **React 18**, **TypeScript** und **Tailwind CSS**. Ergänzt wird das Frontend jetzt um einen eigenständigen **Fastify + Prisma API-Server** mit PostgreSQL-gestützter Benutzerregistrierung und Login. Das Projekt kombiniert klassische Forum-UX mit Echtzeit-Demo-Features, Animationslayern, einem Dock-Chat sowie einer echten Authentifizierungskette.

## Monorepo Struktur

```
nexuslabs/
  apps/
    api/   # Fastify + Prisma Server (JWT + Cookies)
    web/   # Vite + React Frontend
  pnpm-workspace.yaml
  package.json          # Workspace-Skripte
```

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
# Abhängigkeiten für alle Pakete installieren
pnpm install

# API-Server (Fastify) starten
pnpm dev:api

# Frontend (Vite) starten
pnpm dev:web
```

### API (.env)

1. `apps/api/.env.example` kopieren → `apps/api/.env`
2. `DATABASE_URL`, `JWT_ACCESS_SECRET` setzen (optional auch `JWT_REFRESH_SECRET`, gleicher Wert).
3. Migration anlegen (optional lokal): `pnpm --filter nexuslabs-api prisma:migrate`

### Frontend (.env)

1. `apps/web/.env.local` erstellen (siehe unten)
2. Inhalt: `VITE_API_URL="http://localhost:5001"`

Weitere Frontend-Skripte (`pnpm --filter nexuslabs-gaming-forum <script>`):

- `build` – Production Build
- `preview` – Vorschau des Builds
- `lint` – ESLint Check
- `format` – Prettier Formatierung

## Projektstruktur

```
apps/
  api/
    src/
      routes/              # Auth- und User-Endpunkte
      plugins/             # Prisma-Anbindung
      middlewares/         # Auth Guards
    prisma/                # Prisma Schema & Migration
  web/
    src/
      routes/              # Seiten & Router-Logik
      components/          # UI-Bausteine (Layout, Forum, Chat, Common, UI)
      store/               # Zustand Stores (UI, Forum, Chat, Presence, User)
      lib/                 # API-Client, Mock-Services, Utils
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
