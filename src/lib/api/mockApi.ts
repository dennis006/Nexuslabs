import { nanoid } from "nanoid";
import { newId } from "../utils/id";
import type {
  Category,
  CategoryFilter,
  ChatMessage,
  PaginatedResponse,
  Post,
  Stats,
  ThreadFilter,
  ThreadWithMeta,
  User
} from "./types";
import { sortThreads } from "./filters";

const LATENCY = { min: 240, max: 640 };
const FAILURE_RATE = 0.05;

const wait = () =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, Math.random() * (LATENCY.max - LATENCY.min) + LATENCY.min)
  );

const maybeFail = () => {
  if (Math.random() < FAILURE_RATE) {
    throw new Error("Mock API Fehler – bitte erneut versuchen");
  }
};

const nowIso = () => new Date().toISOString();

const users: User[] = Array.from({ length: 12 }).map((_, idx) => ({
  id: `user-${idx + 1}`,
  name: [
    "Nova",
    "Spectre",
    "Lumen",
    "Astra",
    "Echo",
    "Vanta",
    "Quill",
    "Kyra",
    "Onyx",
    "Flux",
    "Zeph",
    "Rune"
  ][idx % 12],
  avatarUrl: `https://i.pravatar.cc/150?img=${idx + 12}`,
  createdAt: new Date(Date.now() - idx * 3600 * 24 * 1000).toISOString()
}));

const categories: Category[] = [
  {
    id: "cat-1",
    slug: "fps",
    name: "Shooter Ops",
    description: "Taktische Shooter, Loadouts & Aim-Training",
    icon: "crosshair",
    threadCount: 128,
    postCount: 982,
    subcategories: [
      { id: "sub-1", name: "Aim-Labs", threadCount: 32 },
      { id: "sub-2", name: "Loadouts", threadCount: 44 },
      { id: "sub-3", name: "Scrims", threadCount: 21 },
      { id: "sub-4", name: "Ranked", threadCount: 18 },
      { id: "sub-5", name: "Controller", threadCount: 9 },
      { id: "sub-6", name: "LAN-Events", threadCount: 4 },
      { id: "sub-7", name: "Coaching", threadCount: 12 }
    ]
  },
  {
    id: "cat-2",
    slug: "rpg",
    name: "RPG Nexus",
    description: "Storytelling, Builds & Theorycrafting",
    icon: "swords",
    threadCount: 96,
    postCount: 804,
    subcategories: [
      { id: "sub-8", name: "Lore", threadCount: 28 },
      { id: "sub-9", name: "Builds", threadCount: 36 },
      { id: "sub-10", name: "Mods", threadCount: 17 },
      { id: "sub-11", name: "Speedruns", threadCount: 11 }
    ]
  },
  {
    id: "cat-3",
    slug: "moba",
    name: "MOBA Arena",
    description: "Drafts, Meta-Analyse & Turniere",
    icon: "shield",
    threadCount: 75,
    postCount: 612,
    subcategories: [
      { id: "sub-12", name: "Patchnotes", threadCount: 22 },
      { id: "sub-13", name: "Champion-Guides", threadCount: 18 },
      { id: "sub-14", name: "Drafting", threadCount: 14 },
      { id: "sub-15", name: "Esports", threadCount: 16 }
    ]
  },
  {
    id: "cat-4",
    slug: "indie",
    name: "Indie Signals",
    description: "Hidden Gems & Game Dev Insights",
    icon: "sparkles",
    threadCount: 54,
    postCount: 301,
    subcategories: [
      { id: "sub-16", name: "Pixel Art", threadCount: 12 },
      { id: "sub-17", name: "Solo Dev", threadCount: 9 },
      { id: "sub-18", name: "Narrative", threadCount: 7 },
      { id: "sub-19", name: "Soundtracks", threadCount: 6 }
    ]
  },
  {
    id: "cat-5",
    slug: "sim",
    name: "Sim Orbit",
    description: "Space- & Vehicle-Sims, Cockpits & Telemetrie",
    icon: "rocket",
    threadCount: 82,
    postCount: 540,
    subcategories: [
      { id: "sub-20", name: "Flight Sims", threadCount: 24 },
      { id: "sub-21", name: "Racing", threadCount: 20 },
      { id: "sub-22", name: "Hardware", threadCount: 16 },
      { id: "sub-23", name: "VR", threadCount: 12 }
    ]
  },
  {
    id: "cat-6",
    slug: "strategy",
    name: "Strategium",
    description: "4X, RTS & Taktik-Highlights im Deep-Dive",
    icon: "brain",
    threadCount: 91,
    postCount: 688,
    subcategories: [
      { id: "sub-24", name: "Build Orders", threadCount: 21 },
      { id: "sub-25", name: "Turniere", threadCount: 13 },
      { id: "sub-26", name: "Wargames", threadCount: 9 },
      { id: "sub-27", name: "Deckbau", threadCount: 10 }
    ]
  },
  {
    id: "cat-7",
    slug: "creative",
    name: "Creative Forge",
    description: "Modding, Asset-Sharing & Tooling",
    icon: "palette",
    threadCount: 48,
    postCount: 274,
    subcategories: [
      { id: "sub-28", name: "Blender", threadCount: 14 },
      { id: "sub-29", name: "Unreal", threadCount: 11 },
      { id: "sub-30", name: "Unity", threadCount: 9 },
      { id: "sub-31", name: "Shaders", threadCount: 6 },
      { id: "sub-32", name: "Concept Art", threadCount: 8 }
    ]
  },
  {
    id: "cat-8",
    slug: "fighting",
    name: "Fight Lab",
    description: "Frame Data, Tech & Match-Ups",
    icon: "gamepad-2",
    threadCount: 58,
    postCount: 402,
    subcategories: [
      { id: "sub-33", name: "Combo Guides", threadCount: 19 },
      { id: "sub-34", name: "Netcode", threadCount: 8 },
      { id: "sub-35", name: "Events", threadCount: 12 },
      { id: "sub-36", name: "Tier Lists", threadCount: 11 }
    ]
  },
  {
    id: "cat-9",
    slug: "mobile",
    name: "Pocket Realm",
    description: "Mobile Games, Touch-Optimierungen & Cloud Play",
    icon: "smartphone",
    threadCount: 67,
    postCount: 358,
    subcategories: [
      { id: "sub-37", name: "Gacha", threadCount: 15 },
      { id: "sub-38", name: "Controllers", threadCount: 10 },
      { id: "sub-39", name: "Cloud", threadCount: 14 },
      { id: "sub-40", name: "Indie", threadCount: 8 }
    ]
  },
  {
    id: "cat-10",
    slug: "retro",
    name: "Retro Vault",
    description: "Speedruns, Preservation & CRT-Setups",
    icon: "joystick",
    threadCount: 43,
    postCount: 245,
    subcategories: [
      { id: "sub-41", name: "Emulation", threadCount: 16 },
      { id: "sub-42", name: "Hardware", threadCount: 12 },
      { id: "sub-43", name: "Records", threadCount: 9 }
    ]
  },
  {
    id: "cat-11",
    slug: "coop",
    name: "Co-Op Collective",
    description: "Partyfinder, Clan-Support & Crossplay",
    icon: "users",
    threadCount: 62,
    postCount: 331,
    subcategories: [
      { id: "sub-44", name: "LFG", threadCount: 20 },
      { id: "sub-45", name: "Crossplay", threadCount: 12 },
      { id: "sub-46", name: "Clans", threadCount: 14 },
      { id: "sub-47", name: "Events", threadCount: 10 }
    ]
  },
  {
    id: "cat-12",
    slug: "wellbeing",
    name: "Player Balance",
    description: "Performance, Ergonomie & Mental Game",
    icon: "heart-pulse",
    threadCount: 37,
    postCount: 214,
    subcategories: [
      { id: "sub-48", name: "Ergonomie", threadCount: 11 },
      { id: "sub-49", name: "Mindset", threadCount: 9 },
      { id: "sub-50", name: "Workout", threadCount: 8 },
      { id: "sub-51", name: "Nutrition", threadCount: 6 }
    ]
  }
];

const categoryMeta: Record<string, { createdAt: number; hasNew: boolean; tag: string }> = {
  "cat-1": { createdAt: Date.parse("2024-06-12"), hasNew: true, tag: "Shooter" },
  "cat-2": { createdAt: Date.parse("2024-05-30"), hasNew: true, tag: "RPG" },
  "cat-3": { createdAt: Date.parse("2024-04-18"), hasNew: false, tag: "MOBA" },
  "cat-4": { createdAt: Date.parse("2024-03-11"), hasNew: true, tag: "Indie" },
  "cat-5": { createdAt: Date.parse("2024-06-02"), hasNew: false, tag: "Simulation" },
  "cat-6": { createdAt: Date.parse("2024-02-22"), hasNew: true, tag: "Strategy" },
  "cat-7": { createdAt: Date.parse("2024-01-12"), hasNew: false, tag: "Creative" },
  "cat-8": { createdAt: Date.parse("2024-05-05"), hasNew: true, tag: "Fighting" },
  "cat-9": { createdAt: Date.parse("2024-04-01"), hasNew: true, tag: "Mobile" },
  "cat-10": { createdAt: Date.parse("2023-12-18"), hasNew: false, tag: "Retro" },
  "cat-11": { createdAt: Date.parse("2024-03-30"), hasNew: true, tag: "Co-Op" },
  "cat-12": { createdAt: Date.parse("2024-02-10"), hasNew: false, tag: "Wellbeing" }
};

const categoryGenres = Array.from(new Set(Object.values(categoryMeta).map((meta) => meta.tag))).sort();

const threadSeeds: ThreadWithMeta[] = Array.from({ length: 24 }).map((_, idx) => {
  const category = categories[idx % categories.length];
  const author = users[idx % users.length];
  const created = new Date(Date.now() - idx * 36 * 60 * 60 * 1000);
  return {
    id: `thread-${idx + 1}`,
    categoryId: category.id,
    title: `${category.name} Spotlight #${idx + 1}`,
    authorId: author.id,
    createdAt: created.toISOString(),
    updatedAt: new Date(created.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 400 + Math.floor(Math.random() * 1200),
    replies: 8 + Math.floor(Math.random() * 76),
    lastPostAt: new Date(created.getTime() + Math.random() * 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastPosterId: users[(idx + 3) % users.length].id,
    tags: ["Strategy", "Patch", idx % 2 ? "Competitive" : "Casual"].slice(0, 2 + (idx % 2))
  };
});

const posts: Post[] = threadSeeds.flatMap((thread, idx) => {
  const base = Array.from({ length: 4 + (idx % 5) }).map((_, postIdx) => {
    const author = users[(idx + postIdx) % users.length];
    const created = new Date(new Date(thread.createdAt).getTime() + postIdx * 3600 * 1000);
    return {
      id: `${thread.id}-post-${postIdx + 1}`,
      threadId: thread.id,
      authorId: author.id,
      content:
        postIdx === 0
          ? `## ${thread.title}\n\nWas haltet ihr vom neuen Patch? Hier sind meine Highlights:\n\n- Balancing wirkt deutlich fairer\n- Neue Map \`Astra Prime\` fühlt sich großartig an\n- Sounddesign wurde massiv verbessert\n\nFreue mich auf euer Feedback!`
          : `Game-Insights von **${author.name}** – ich habe ${
              5 + postIdx * 2
            } Matches gespielt und ${postIdx % 2 ? "positive" : "gemischte"} Erfahrungen gemacht.\n\n> ${
              postIdx % 2
                ? "Teamplay ist aktuell der Schlüssel zum Sieg."
                : "Solo-Queue bleibt tough, aber lernbar."
            }`,
      createdAt: created.toISOString(),
      updatedAt: postIdx % 3 === 0 ? new Date(created.getTime() + 1800 * 1000).toISOString() : undefined
    } satisfies Post;
  });
  return base;
});

const stats: Stats = {
  usersTotal: 3200,
  usersOnline: 148,
  categoriesTotal: categories.length,
  threadsTotal: threadSeeds.length,
  postsTotal: posts.length,
  messagesTotal: 9480
};

const systemMessages: ChatMessage[] = [
  {
    id: newId("system"),
    text: "Patch 1.27 Notes sind jetzt live!",
    system: true,
    createdAt: nowIso()
  },
  {
    id: newId("system"),
    text: "Community Turnier startet heute um 20:00 Uhr.",
    system: true,
    createdAt: nowIso()
  }
];

export const mockApi = {
  async getStats(): Promise<Stats> {
    await wait();
    maybeFail();
    return { ...stats, usersOnline: stats.usersOnline + Math.round(Math.random() * 12 - 6) };
  },
  async getCategories(filter: CategoryFilter = {}): Promise<PaginatedResponse<Category>> {
    await wait();
    maybeFail();

    const { q, sort = "name", onlyNew, tag, page = 1, pageSize = 12 } = filter;

    const normalizedQuery = q?.trim().toLowerCase();

    let filtered = categories.slice();

    if (normalizedQuery) {
      filtered = filtered.filter((category) => {
        const matchesCategory =
          category.name.toLowerCase().includes(normalizedQuery) ||
          category.description?.toLowerCase().includes(normalizedQuery);
        const matchesSub = category.subcategories?.some((sub) =>
          sub.name.toLowerCase().includes(normalizedQuery)
        );
        return matchesCategory || matchesSub;
      });
    }

    if (onlyNew) {
      filtered = filtered.filter((category) => categoryMeta[category.id]?.hasNew);
    }

    if (tag) {
      filtered = filtered.filter((category) => categoryMeta[category.id]?.tag === tag);
    }

    const sorted = filtered.sort((a, b) => {
      switch (sort) {
        case "threads":
          return b.threadCount - a.threadCount;
        case "posts":
          return b.postCount - a.postCount;
        case "new":
          return (categoryMeta[b.id]?.createdAt ?? 0) - (categoryMeta[a.id]?.createdAt ?? 0);
        case "name":
        default:
          return a.name.localeCompare(b.name, "de-DE");
      }
    });

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: sorted.slice(start, end),
      page,
      pageSize,
      total: sorted.length
    } satisfies PaginatedResponse<Category>;
  },
  getCategoryGenres(): string[] {
    return categoryGenres;
  },
  async getThreads(filter: ThreadFilter = {}): Promise<PaginatedResponse<ThreadWithMeta>> {
    await wait();
    maybeFail();
    const { categoryId, sort = "new", page = 1, pageSize = 8 } = filter;
    const filtered = sortThreads(
      categoryId ? threadSeeds.filter((thread) => thread.categoryId === categoryId) : threadSeeds,
      sort
    );
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      data: filtered.slice(start, end),
      page,
      pageSize,
      total: filtered.length
    };
  },
  async getThreadById(id: string): Promise<ThreadWithMeta | undefined> {
    await wait();
    maybeFail();
    return threadSeeds.find((thread) => thread.id === id);
  },
  async getPosts(threadId: string): Promise<Post[]> {
    await wait();
    maybeFail();
    return posts.filter((post) => post.threadId === threadId);
  },
  async createThread(data: Pick<ThreadWithMeta, "categoryId" | "title" | "tags"> & { body: string; authorId: string }): Promise<ThreadWithMeta> {
    await wait();
    maybeFail();
    const thread: ThreadWithMeta = {
      id: nanoid(),
      categoryId: data.categoryId,
      title: data.title,
      authorId: data.authorId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      lastPostAt: nowIso(),
      lastPosterId: data.authorId,
      replies: 0,
      views: 0,
      tags: data.tags
    };
    threadSeeds.unshift(thread);
    posts.push({
      id: nanoid(),
      threadId: thread.id,
      authorId: data.authorId,
      content: data.body,
      createdAt: nowIso()
    });
    stats.threadsTotal += 1;
    stats.postsTotal += 1;
    return thread;
  },
  async createPost(data: { threadId: string; body: string; authorId: string }): Promise<Post> {
    await wait();
    maybeFail();
    const post: Post = {
      id: nanoid(),
      threadId: data.threadId,
      authorId: data.authorId,
      content: data.body,
      createdAt: nowIso()
    };
    posts.push(post);
    const thread = threadSeeds.find((t) => t.id === data.threadId);
    if (thread) {
      thread.replies += 1;
      thread.lastPostAt = post.createdAt;
      thread.lastPosterId = data.authorId;
      thread.updatedAt = post.createdAt;
    }
    stats.postsTotal += 1;
    return post;
  },
  async getSystemMessages(): Promise<ChatMessage[]> {
    await wait();
    return systemMessages;
  },
  async getUserById(id: string): Promise<User | undefined> {
    await wait();
    return users.find((user) => user.id === id);
  },
  async getUsers(): Promise<User[]> {
    await wait();
    return users;
  }
};

export type MockApi = typeof mockApi;
