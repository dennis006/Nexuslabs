import type { PrismaClient, Role, TrustLevel, ConnectedProvider } from "@prisma/client";
import type { LegacyBadgeMetadata } from "../profile/badges";

export interface CandidateStats {
  topics: number;
  posts: number;
  likesGiven: number;
  likesReceived: number;
  reputation: number;
  trustLevel: TrustLevel;
  streakDays: number;
  longestStreak: number;
  lastActiveAt: Date | null;
}

export interface CandidateProfileDetails {
  hasDisplayName: boolean;
  hasBio: boolean;
  aboutLength: number;
  socialsCount: number;
  linksCount: number;
  interestsLength: number;
  legacyOfficial: Map<string, LegacyBadgeMetadata>;
}

export interface CandidateConnectedAccount {
  provider: ConnectedProvider;
  verified: boolean;
}

export interface BadgeCandidate {
  id: string;
  username: string;
  createdAt: Date;
  role: Role;
  stats: CandidateStats | null;
  profile: CandidateProfileDetails | null;
  connectedAccounts: CandidateConnectedAccount[];
  followerCount: number;
  followingCount: number;
}

export interface BadgeGrant {
  userId: string;
  earnedAt?: Date;
  note?: string | null;
  reason?: string | null;
  seasonKey?: string | null;
}

export interface BadgeAssignmentResult {
  userId: string;
  badgeSlug: string;
  seasonKey: string | null;
  earnedAt: Date;
  note: string | null;
  earnedReason: string | null;
  priority: number;
  allowRevocation: boolean;
  ruleId: string;
}

export interface BadgeRule {
  /**
   * Stable identifier for logging and tests.
   */
  id: string;
  badgeSlug: string;
  description: string;
  defaultReason?: string;
  seasonKey?: string | null;
  priority?: number;
  allowRevocation?: boolean;
  evaluate(context: BadgeEvaluationContext): Promise<BadgeGrant[] | BadgeGrant[]>;
}

export interface BadgeEvaluationContext {
  prisma: PrismaClient;
  candidates: BadgeCandidate[];
  now: Date;
  targetUserIds: Set<string> | null;
  cache: Map<string, unknown>;
  useCache<T>(key: string, loader: () => Promise<T>): Promise<T>;
}

export type BadgeAssignmentSummary = {
  slug: string;
  userId: string;
  seasonKey: string | null;
  change: "created" | "updated" | "restored" | "noop";
};

export type BadgeRevocationSummary = {
  userId: string;
  badgeSlug: string;
  seasonKey: string | null;
  userBadgeId: string;
};
