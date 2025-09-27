import { nanoid } from "nanoid";
import { newId } from "../utils/id";
import type {
  Category,
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
    postCount: 982
  },
  {
    id: "cat-2",
    slug: "rpg",
    name: "RPG Nexus",
    description: "Storytelling, Builds & Theorycrafting",
    icon: "swords",
    threadCount: 96,
    postCount: 804
  },
  {
    id: "cat-3",
    slug: "moba",
    name: "MOBA Arena",
    description: "Drafts, Meta-Analyse & Turniere",
    icon: "shield",
    threadCount: 75,
    postCount: 612
  },
  {
    id: "cat-4",
    slug: "indie",
    name: "Indie Signals",
    description: "Hidden Gems & Game Dev Insights",
    icon: "sparkles",
    threadCount: 54,
    postCount: 301
  }
];

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
  async getCategories(): Promise<Category[]> {
    await wait();
    maybeFail();
    return categories;
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
