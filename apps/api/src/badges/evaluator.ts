import type { PrismaClient, Prisma } from "@prisma/client";
import badgeRules from "./rules";
import type {
  BadgeAssignmentResult,
  BadgeCandidate,
  BadgeEvaluationContext,
  BadgeRule,
  CandidateProfileDetails,
  CandidateStats,
} from "./types";
import { extractProfileBadges } from "../profile/badges";
import { parseJsonArray } from "../utils/json";

const DEFAULT_PRIORITY = 100;

const createProfileDetails = (user: {
  username: string;
  displayName: string | null;
  bio: string | null;
  profile: {
    about: string | null;
    interests: string | null;
    socials: Prisma.JsonValue | null;
    links: Prisma.JsonValue | null;
    badges: Prisma.JsonValue | null;
    bio: string | null;
  } | null;
}): CandidateProfileDetails | null => {
  if (!user.profile) {
    return {
      hasDisplayName: Boolean(user.displayName && user.displayName !== user.username),
      hasBio: Boolean(user.bio),
      aboutLength: 0,
      socialsCount: 0,
      linksCount: 0,
      interestsLength: 0,
      legacyOfficial: new Map(),
    };
  }

  const aboutLength = (user.profile.about ?? "").length;
  const interestsLength = (user.profile.interests ?? "").length;
  const socialsCount = parseJsonArray<unknown>(user.profile.socials).length;
  const linksCount = parseJsonArray<unknown>(user.profile.links).length;
  const { legacyOfficial } = extractProfileBadges(user.profile.badges ?? null);

  return {
    hasDisplayName: Boolean(user.displayName && user.displayName !== user.username),
    hasBio: Boolean(user.bio ?? user.profile.about ?? user.profile.bio ?? undefined),
    aboutLength,
    socialsCount,
    linksCount,
    interestsLength,
    legacyOfficial,
  };
};

const mapStats = (stats: {
  topics: number;
  posts: number;
  likesGiven: number;
  likesReceived: number;
  reputation: number;
  trustLevel: string;
  streakDays: number;
  longestStreak: number;
  lastActiveAt: Date | null;
} | null): CandidateStats | null => {
  if (!stats) return null;
  return {
    topics: stats.topics,
    posts: stats.posts,
    likesGiven: stats.likesGiven,
    likesReceived: stats.likesReceived,
    reputation: stats.reputation,
    trustLevel: stats.trustLevel as CandidateStats["trustLevel"],
    streakDays: stats.streakDays,
    longestStreak: stats.longestStreak,
    lastActiveAt: stats.lastActiveAt,
  };
};

export const runBadgeRules = async (
  rules: BadgeRule[],
  context: BadgeEvaluationContext
): Promise<BadgeAssignmentResult[]> => {
  const sorted = [...rules].sort(
    (a, b) => (a.priority ?? DEFAULT_PRIORITY) - (b.priority ?? DEFAULT_PRIORITY)
  );
  const map = new Map<string, BadgeAssignmentResult>();

  for (const rule of sorted) {
    const grants = await rule.evaluate(context);
    if (!Array.isArray(grants) || grants.length === 0) continue;
    for (const grant of grants) {
      if (context.targetUserIds && !context.targetUserIds.has(grant.userId)) {
        continue;
      }
      const seasonKey = grant.seasonKey ?? rule.seasonKey ?? null;
      const key = `${grant.userId}:${rule.badgeSlug}:${seasonKey ?? "_"}`;
      const priority = rule.priority ?? DEFAULT_PRIORITY;
      const existing = map.get(key);
      if (existing && existing.priority <= priority) {
        continue;
      }
      map.set(key, {
        userId: grant.userId,
        badgeSlug: rule.badgeSlug,
        seasonKey,
        earnedAt: grant.earnedAt ?? context.now,
        note: grant.note ?? null,
        earnedReason: grant.reason ?? rule.defaultReason ?? rule.description,
        priority,
        allowRevocation: rule.allowRevocation ?? true,
        ruleId: rule.id,
      });
    }
  }

  return Array.from(map.values());
};

const createContext = (
  prisma: PrismaClient,
  candidates: BadgeCandidate[],
  now: Date,
  targetUserIds: Set<string> | null
): BadgeEvaluationContext => {
  const cache = new Map<string, unknown>();
  return {
    prisma,
    candidates,
    now,
    targetUserIds,
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
};

export class BadgeEvaluator {
  private readonly rules: BadgeRule[];
  constructor(private readonly prisma: PrismaClient, rules: BadgeRule[] = badgeRules) {
    this.rules = rules;
  }

  async loadCandidates(userIds?: string[]): Promise<BadgeCandidate[]> {
    const users = await this.prisma.user.findMany({
      where: userIds && userIds.length > 0 ? { id: { in: userIds } } : undefined,
      select: {
        id: true,
        username: true,
        createdAt: true,
        role: true,
        displayName: true,
        bio: true,
        stats: {
          select: {
            topics: true,
            posts: true,
            likesGiven: true,
            likesReceived: true,
            reputation: true,
            trustLevel: true,
            streakDays: true,
            longestStreak: true,
            lastActiveAt: true,
          },
        },
        profile: {
          select: {
            about: true,
            interests: true,
            socials: true,
            links: true,
            badges: true,
            bio: true,
          },
        },
        connectedAccounts: {
          select: {
            provider: true,
            verified: true,
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return users.map((user) => {
      const profile: CandidateProfileDetails | null = createProfileDetails(user);
      const stats: CandidateStats | null = mapStats(user.stats);
      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        role: user.role,
        stats,
        profile,
        connectedAccounts: user.connectedAccounts.map((account) => ({
          provider: account.provider,
          verified: account.verified,
        })),
        followerCount: user._count.followers,
        followingCount: user._count.following,
      } satisfies BadgeCandidate;
    });
  }

  async evaluate(options: { userIds?: string[]; now?: Date } = {}) {
    const { userIds, now = new Date() } = options;
    const candidates = await this.loadCandidates(userIds);
    const targetUserIds = userIds && userIds.length > 0 ? new Set(userIds) : null;
    const context = createContext(this.prisma, candidates, now, targetUserIds);
    const assignments = await runBadgeRules(this.rules, context);
    return { assignments, candidates, context };
  }
}

export type BadgeEvaluationOutput = Awaited<ReturnType<BadgeEvaluator["evaluate"]>>;
