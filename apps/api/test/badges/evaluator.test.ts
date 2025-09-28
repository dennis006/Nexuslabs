import { describe, expect, it, beforeEach } from "vitest";
import { runBadgeRules } from "../../src/badges/evaluator";
import badgeRules from "../../src/badges/rules";
import type { BadgeCandidate, BadgeEvaluationContext } from "../../src/badges/types";
import { BadgeAssignmentOrchestrator } from "../../src/badges/assignment";
import type { Prisma, PrismaClient } from "@prisma/client";

const basePrismaMock = {
  user: {
    findMany: async () => [],
  },
  badge: {
    findMany: async () => [],
  },
  userBadge: {
    findMany: async () => [],
    upsert: async () => ({}),
    update: async () => ({}),
  },
  $transaction: async (operations: Promise<unknown>[]) => {
    for (const op of operations) await op;
    return [];
  },
} as unknown as PrismaClient;

const createContext = (candidates: BadgeCandidate[], overrides?: Partial<BadgeEvaluationContext>) => {
  const cache = overrides?.cache ?? new Map<string, unknown>();
  const context: BadgeEvaluationContext = {
    prisma: overrides?.prisma ?? basePrismaMock,
    candidates,
    now: overrides?.now ?? new Date("2024-01-01T00:00:00.000Z"),
    targetUserIds: overrides?.targetUserIds ?? null,
    cache,
    async useCache<T>(key: string, loader: () => Promise<T>): Promise<T> {
      if (cache.has(key)) {
        return cache.get(key) as T;
      }
      const value = await loader();
      cache.set(key, value);
      return value;
    },
  };
  return context;
};

describe("badge rules", () => {
  it("assigns core-team and operations-lead to administrators", async () => {
    const candidate: BadgeCandidate = {
      id: "admin-1",
      username: "admin",
      createdAt: new Date("2023-01-01T00:00:00.000Z"),
      role: "ADMIN",
      stats: {
        topics: 10,
        posts: 50,
        likesGiven: 120,
        likesReceived: 300,
        reputation: 600,
        trustLevel: "ADMINISTRATOR",
        streakDays: 5,
        longestStreak: 5,
        lastActiveAt: new Date("2024-01-01T00:00:00.000Z"),
      },
      profile: {
        hasDisplayName: true,
        hasBio: true,
        aboutLength: 120,
        socialsCount: 2,
        linksCount: 1,
        interestsLength: 80,
        legacyOfficial: new Map(),
      },
      connectedAccounts: [],
      followerCount: 3,
      followingCount: 1,
    };

    const context = createContext([candidate]);
    const assignments = await runBadgeRules(badgeRules, context);
    const slugs = assignments.map((assignment) => assignment.badgeSlug);

    expect(slugs).toContain("core-team");
    expect(slugs).toContain("operations-lead");
  });

  it("marks early adopters via cached first-100 set", async () => {
    const candidate: BadgeCandidate = {
      id: "member-1",
      username: "fan",
      createdAt: new Date("2023-02-01T00:00:00.000Z"),
      role: "MEMBER",
      stats: {
        topics: 2,
        posts: 3,
        likesGiven: 1,
        likesReceived: 5,
        reputation: 5,
        trustLevel: "MEMBER",
        streakDays: 0,
        longestStreak: 0,
        lastActiveAt: null,
      },
      profile: {
        hasDisplayName: false,
        hasBio: false,
        aboutLength: 0,
        socialsCount: 0,
        linksCount: 0,
        interestsLength: 0,
        legacyOfficial: new Map(),
      },
      connectedAccounts: [],
      followerCount: 0,
      followingCount: 0,
    };

    const cache = new Map<string, unknown>();
    cache.set("badges:early:set", new Set([candidate.id]));
    cache.set("badges:founder:set", new Set<string>());

    const context = createContext([candidate], { cache });
    const assignments = await runBadgeRules(badgeRules, context);
    const slugs = assignments.map((assignment) => assignment.badgeSlug);

    expect(slugs).toContain("early-adopter");
    expect(slugs).not.toContain("founder");
  });
});

class MockPrisma {
  public readonly user: PrismaClient["user"];
  public readonly badge: PrismaClient["badge"];
  public readonly userBadge: PrismaClient["userBadge"];
  public readonly $transaction: PrismaClient["$transaction"];
  public readonly creates: Prisma.UserBadgeCreateArgs[] = [];
  public readonly upserts: Prisma.UserBadgeUpsertArgs[] = [];
  public readonly updates: Prisma.UserBadgeUpdateArgs[] = [];

  private readonly users: any[];
  private readonly badges: any[];
  private readonly userBadges: any[];

  constructor(data: { users: any[]; badges: any[]; userBadges: any[] }) {
    this.users = data.users;
    this.badges = data.badges;
    this.userBadges = data.userBadges;

    this.user = {
      findMany: async (args?: any) => {
        let records = [...this.users];
        if (args?.where?.id?.in) {
          const ids: string[] = args.where.id.in;
          records = records.filter((record) => ids.includes(record.id));
        }
        if (args?.orderBy?.createdAt === "asc") {
          records = records.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (typeof args?.take === "number") {
          records = records.slice(0, args.take);
        }
        return records;
      },
    } as unknown as PrismaClient["user"];

    this.badge = {
      findMany: async () => this.badges,
    } as unknown as PrismaClient["badge"];

    this.userBadge = {
      findMany: async (args?: any) => {
        let records = [...this.userBadges];
        if (args?.where?.userId?.in) {
          const ids: string[] = args.where.userId.in;
          records = records.filter((record) => ids.includes(record.userId));
        }
        return records;
      },
      create: async (args: Prisma.UserBadgeCreateArgs) => {
        this.creates.push(args);
        return {};
      },
      upsert: async (args: Prisma.UserBadgeUpsertArgs) => {
        this.upserts.push(args);
        return {};
      },
      update: async (args: Prisma.UserBadgeUpdateArgs) => {
        this.updates.push(args);
        return {};
      },
    } as unknown as PrismaClient["userBadge"];

    this.$transaction = (async (arg: any) => {
      if (Array.isArray(arg)) {
        for (const operation of arg) {
          await operation;
        }
        return [] as never[];
      }
      if (typeof arg === "function") {
        return arg(this as unknown as PrismaClient);
      }
      return [] as never[];
    }) as unknown as PrismaClient["$transaction"];
  }
}

describe("badge assignment orchestrator", () => {
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = new MockPrisma({
      users: [
        {
          id: "u1",
          username: "hero",
          createdAt: new Date("2023-01-01T00:00:00.000Z"),
          role: "MEMBER",
          displayName: "Hero",
          bio: "",
          stats: {
            topics: 35,
            posts: 210,
            likesGiven: 220,
            likesReceived: 260,
            reputation: 480,
            trustLevel: "VETERAN",
            streakDays: 15,
            longestStreak: 15,
            lastActiveAt: new Date("2024-01-01T00:00:00.000Z"),
          },
          profile: {
            about: "Working on community projects",
            interests: "community",
            socials: [],
            links: [],
            badges: null,
            bio: null,
          },
          connectedAccounts: [
            { provider: "GITHUB", verified: true },
          ],
          _count: { followers: 12, following: 5 },
        },
        {
          id: "u2",
          username: "lurker",
          createdAt: new Date("2023-05-01T00:00:00.000Z"),
          role: "MEMBER",
          displayName: null,
          bio: null,
          stats: {
            topics: 1,
            posts: 2,
            likesGiven: 0,
            likesReceived: 0,
            reputation: 5,
            trustLevel: "MEMBER",
            streakDays: 0,
            longestStreak: 0,
            lastActiveAt: null,
          },
          profile: {
            about: "",
            interests: "",
            socials: [],
            links: [],
            badges: null,
            bio: null,
          },
          connectedAccounts: [],
          _count: { followers: 0, following: 0 },
        },
      ],
      badges: [
        { id: "b1", slug: "top-poster" },
        { id: "b1a", slug: "founder" },
        { id: "b1b", slug: "early-adopter" },
        { id: "b1c", slug: "verified" },
        { id: "b2", slug: "community-champion" },
        { id: "b3", slug: "knowledge-sharer" },
        { id: "b4", slug: "bug-hunter" },
        { id: "b5", slug: "helpful-responder" },
        { id: "b6", slug: "mentor" },
        { id: "b7", slug: "community-builder" },
        { id: "b8", slug: "event-champion" },
      ],
      userBadges: [
        {
          id: "award-1",
          userId: "u1",
          badgeId: "b1",
          badge: { slug: "top-poster" },
          earnedAt: new Date("2023-06-01T00:00:00.000Z"),
          seasonKey: null,
          note: null,
          earnedReason: null,
          revokedAt: null,
        },
        {
          id: "award-2",
          userId: "u2",
          badgeId: "b1",
          badge: { slug: "top-poster" },
          earnedAt: new Date("2023-07-01T00:00:00.000Z"),
          seasonKey: null,
          note: null,
          earnedReason: null,
          revokedAt: null,
        },
      ],
    });
  });

  it("creates updates and revocations in a single recompute run", async () => {
    const orchestrator = new BadgeAssignmentOrchestrator(prisma as unknown as PrismaClient);
    const result = await orchestrator.recompute({ userIds: ["u1", "u2"], now: new Date("2024-02-01T00:00:00.000Z") });

    expect(result.summaries.length).toBeGreaterThan(0);
    const revoked = result.revocations.find((entry) => entry.userId === "u2");
    expect(revoked).toBeTruthy();

    const summarySlugs = result.summaries.map((entry) => entry.slug);
    expect(prisma.creates.length).toBeGreaterThan(0);
    expect(prisma.updates.length).toBeGreaterThan(0);
    expect(summarySlugs).toContain("top-poster");
  });
});
