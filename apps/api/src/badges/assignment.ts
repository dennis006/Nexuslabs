import type { PrismaClient, Prisma } from "@prisma/client";
import { BadgeEvaluator } from "./evaluator";
import badgeRules from "./rules";
import type {
  BadgeAssignmentResult,
  BadgeAssignmentSummary,
  BadgeRevocationSummary,
  BadgeRule,
} from "./types";

export type RecomputeOptions = {
  userIds?: string[];
  dryRun?: boolean;
  now?: Date;
};

export type BadgeRecomputeResult = {
  dryRun: boolean;
  assignments: BadgeAssignmentResult[];
  summaries: BadgeAssignmentSummary[];
  revocations: BadgeRevocationSummary[];
};

const assignmentKey = (userId: string, slug: string, seasonKey: string | null) =>
  `${userId}:${slug}:${seasonKey ?? "_"}`;

export class BadgeAssignmentOrchestrator {
  private readonly evaluator: BadgeEvaluator;
  private readonly rulesBySlug: Map<string, BadgeRule[]>;

  constructor(private readonly prisma: PrismaClient) {
    this.evaluator = new BadgeEvaluator(prisma);
    this.rulesBySlug = badgeRules.reduce((map, rule) => {
      const existing = map.get(rule.badgeSlug) ?? [];
      existing.push(rule);
      map.set(rule.badgeSlug, existing);
      return map;
    }, new Map<string, BadgeRule[]>());
  }

  async recompute(options: RecomputeOptions = {}): Promise<BadgeRecomputeResult> {
    const { assignments } = await this.evaluator.evaluate({
      userIds: options.userIds,
      now: options.now,
    });
    const dryRun = options.dryRun ?? false;
    const effectiveNow = options.now ?? new Date();

    const userIds = new Set<string>();
    assignments.forEach((assignment) => userIds.add(assignment.userId));
    if (options.userIds) {
      options.userIds.forEach((id) => userIds.add(id));
    }

    const targetIds = Array.from(userIds);
    if (targetIds.length === 0) {
      return { dryRun, assignments, summaries: [], revocations: [] };
    }

    const badges = await this.prisma.badge.findMany({
      select: { id: true, slug: true },
    });
    const badgeBySlug = new Map(badges.map((badge) => [badge.slug, badge]));

    const currentAwards = await this.prisma.userBadge.findMany({
      where: { userId: { in: targetIds } },
      select: {
        id: true,
        userId: true,
        badgeId: true,
        earnedAt: true,
        seasonKey: true,
        note: true,
        earnedReason: true,
        revokedAt: true,
        badge: { select: { slug: true } },
      },
    });

    const currentByKey = new Map<string, (typeof currentAwards)[number]>();
    currentAwards.forEach((award) => {
      const key = assignmentKey(award.userId, award.badge.slug, award.seasonKey);
      currentByKey.set(key, award);
    });

    const summaries: BadgeAssignmentSummary[] = [];
    const revocations: BadgeRevocationSummary[] = [];
    const assignmentMap = new Map<string, BadgeAssignmentResult>();
    const createOperations: Prisma.UserBadgeCreateArgs[] = [];
    const updateOperations: Prisma.UserBadgeUpdateArgs[] = [];
    const revokeOperations: Prisma.UserBadgeUpdateArgs[] = [];

    for (const assignment of assignments) {
      const badge = badgeBySlug.get(assignment.badgeSlug);
      if (!badge) {
        throw new Error(`Badge with slug ${assignment.badgeSlug} not found.`);
      }
      const key = assignmentKey(assignment.userId, assignment.badgeSlug, assignment.seasonKey);
      assignmentMap.set(key, assignment);
      const existing = currentByKey.get(key);
      const change: BadgeAssignmentSummary["change"] = existing
        ? existing.revokedAt
          ? "restored"
          : "updated"
        : "created";

      const needsUpdate = !existing
        ? true
        : existing.revokedAt !== null ||
          existing.earnedAt.getTime() !== assignment.earnedAt.getTime() ||
          (existing.note ?? null) !== (assignment.note ?? null) ||
          (existing.earnedReason ?? null) !== (assignment.earnedReason ?? null);

      if (!needsUpdate) {
        summaries.push({
          slug: assignment.badgeSlug,
          userId: assignment.userId,
          seasonKey: assignment.seasonKey ?? null,
          change: "noop",
        });
        continue;
      }

      summaries.push({
        slug: assignment.badgeSlug,
        userId: assignment.userId,
        seasonKey: assignment.seasonKey ?? null,
        change,
      });

      if (!existing) {
        createOperations.push({
          data: {
            userId: assignment.userId,
            badgeId: badge.id,
            seasonKey: assignment.seasonKey ?? undefined,
            earnedAt: assignment.earnedAt,
            note: assignment.note,
            earnedReason: assignment.earnedReason,
            revokedAt: null,
          },
        });
      } else {
        updateOperations.push({
          where: { id: existing.id },
          data: {
            earnedAt: assignment.earnedAt,
            note: assignment.note,
            earnedReason: assignment.earnedReason,
            revokedAt: null,
          },
        });
      }
    }

    for (const award of currentAwards) {
      const key = assignmentKey(award.userId, award.badge.slug, award.seasonKey);
      if (assignmentMap.has(key)) continue;
      if (award.revokedAt) continue;
      const rules = this.rulesBySlug.get(award.badge.slug) ?? [];
      const allowsRevocation = rules.every((rule) => rule.allowRevocation !== false);
      if (!allowsRevocation) continue;

      revocations.push({
        userId: award.userId,
        badgeSlug: award.badge.slug,
        seasonKey: award.seasonKey ?? null,
        userBadgeId: award.id,
      });

      revokeOperations.push({
        where: { id: award.id },
        data: {
          revokedAt: effectiveNow,
          earnedReason:
            award.earnedReason ?? "Automatische Aberkennung aufgrund fehlender Kriterien.",
        },
      });
    }

    if (!dryRun && (createOperations.length > 0 || updateOperations.length > 0 || revokeOperations.length > 0)) {
      await this.prisma.$transaction([
        ...createOperations.map((args) => this.prisma.userBadge.create(args)),
        ...updateOperations.map((args) => this.prisma.userBadge.update(args)),
        ...revokeOperations.map((args) => this.prisma.userBadge.update(args)),
      ]);
    }

    return { dryRun, assignments, summaries, revocations };
  }
}
