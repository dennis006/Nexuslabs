import { TrustLevel } from "@prisma/client";
import { KNOWN_OFFICIAL_BADGES } from "../profile/badges";
import type { BadgeRule, BadgeGrant, BadgeEvaluationContext, BadgeCandidate } from "./types";

const trustOrder: Record<TrustLevel, number> = {
  NEWCOMER: 0,
  MEMBER: 1,
  CONTRIBUTOR: 2,
  VETERAN: 3,
  MODERATOR: 4,
  ADMINISTRATOR: 5,
};

const hasMinimumTrust = (candidate: BadgeCandidate, min: TrustLevel) => {
  const candidateLevel = candidate.stats?.trustLevel ?? TrustLevel.NEWCOMER;
  return trustOrder[candidateLevel] >= trustOrder[min];
};

const withTarget = (context: BadgeEvaluationContext, candidate: BadgeCandidate) => {
  if (!context.targetUserIds) return true;
  return context.targetUserIds.has(candidate.id);
};

const makeGrants = (
  context: BadgeEvaluationContext,
  predicate: (candidate: BadgeCandidate) => boolean,
  options?: { note?: string; reason?: string; earnedAt?: (candidate: BadgeCandidate) => Date }
): BadgeGrant[] => {
  const { note, reason, earnedAt } = options ?? {};
  return context.candidates
    .filter((candidate) => withTarget(context, candidate) && predicate(candidate))
    .map((candidate) => ({
      userId: candidate.id,
      note: note ?? null,
      reason: reason ?? null,
      earnedAt: earnedAt ? earnedAt(candidate) : candidate.createdAt,
    }));
};

const primaryRules: BadgeRule[] = [
  {
    id: "core-team.role",
    badgeSlug: "core-team",
    description: "Vergeben an Mitglieder des Administrationskerns.",
    defaultReason: "Mitglied des NexusLabs Kernteams.",
    priority: 10,
    evaluate: async (context) =>
      makeGrants(context, (candidate) => candidate.role === "ADMIN", {
        reason: "User besitzt Administratorrechte und gehört zum Kernteam.",
      }),
  },
  {
    id: "operations-lead.trust",
    badgeSlug: "operations-lead",
    description: "Leitet operative Prozesse und hat Administrator-Vertrauensstufe.",
    defaultReason: "Operative Leitungsverantwortung bestätigt.",
    priority: 20,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) =>
          candidate.role === "ADMIN" && hasMinimumTrust(candidate, TrustLevel.ADMINISTRATOR),
        {
          reason: "Vertrauensstufe ADMINISTRATOR bestätigt operative Leitungsrolle.",
        }
      ),
  },
  {
    id: "founder.first-users",
    badgeSlug: "founder",
    description: "Erste Gründungsmitglieder der Plattform.",
    defaultReason: "Zu den frühesten NexusLabs Accounts gezählt.",
    priority: 30,
    evaluate: async (context) => {
      const founderSet = await context.useCache("badges:founder:set", async () => {
        const earliest = await context.prisma.user.findMany({
          orderBy: { createdAt: "asc" },
          take: 5,
          select: { id: true },
        });
        return new Set(earliest.map((entry) => entry.id));
      });

      return makeGrants(
        context,
        (candidate) => founderSet.has(candidate.id),
        {
          reason: "Gehört zu den ersten fünf registrierten Mitgliedern.",
        }
      );
    },
  },
  {
    id: "early-adopter.first-100",
    badgeSlug: "early-adopter",
    description: "Frühe Unterstützerinnen und Unterstützer in der Aufbauphase.",
    defaultReason: "Unter den ersten 100 Mitgliedern der Community.",
    priority: 40,
    evaluate: async (context) => {
      const adopterSet = await context.useCache("badges:early:set", async () => {
        const earliest = await context.prisma.user.findMany({
          orderBy: { createdAt: "asc" },
          take: 100,
          select: { id: true },
        });
        return new Set(earliest.map((entry) => entry.id));
      });

      return makeGrants(
        context,
        (candidate) => adopterSet.has(candidate.id),
        {
          reason: "Zählt zu den ersten hundert registrierten Accounts.",
        }
      );
    },
  },
  {
    id: "verified.connected-account",
    badgeSlug: "verified",
    description: "Identität oder Social-Profil wurde überprüft.",
    defaultReason: "Mindestens ein verifiziertes verbundenes Konto vorhanden.",
    priority: 50,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => candidate.connectedAccounts.some((account) => account.verified),
        {
          reason: "Verifiziertes Drittanbieter-Konto hinterlegt.",
        }
      ),
  },
  {
    id: "community-champion.engagement",
    badgeSlug: "community-champion",
    description: "Vorbildliche Aktivität und Community-Engagement.",
    defaultReason: "Hohe Aktivität und viel positives Feedback in der Community.",
    priority: 60,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          if (!stats) return false;
          return (
            stats.likesGiven >= 200 &&
            stats.likesReceived >= 250 &&
            candidate.followerCount >= 5 &&
            hasMinimumTrust(candidate, TrustLevel.VETERAN)
          );
        },
        {
          reason: "Hohe Zahl an erhaltenen Likes und aktive Community-Unterstützung.",
        }
      ),
  },
  {
    id: "top-poster.volume",
    badgeSlug: "top-poster",
    description: "Aktivste Verfasser:innen von Beiträgen.",
    defaultReason: "Mehr als 200 Beiträge veröffentlicht.",
    priority: 70,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => (candidate.stats?.posts ?? 0) >= 200,
        {
          reason: "Mindestens 200 veröffentlichte Beiträge.",
        }
      ),
  },
  {
    id: "knowledge-sharer.guides",
    badgeSlug: "knowledge-sharer",
    description: "Teilt regelmäßig Wissen und hilfreiche Themen.",
    defaultReason: "Viele Themen eröffnet und positives Feedback erhalten.",
    priority: 80,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          if (!stats) return false;
          return stats.topics >= 25 && stats.likesReceived >= 150;
        },
        {
          reason: "Mindestens 25 Themen mit über 150 erhaltenen Likes.",
        }
      ),
  },
  {
    id: "event-champion.legacy",
    badgeSlug: "event-champion",
    description: "Gewinner:innen von NexusLabs Community-Events.",
    defaultReason: "Event-Sieg laut bestehenden Auszeichnungen.",
    seasonKey: "community-events",
    priority: 90,
    allowRevocation: false,
    evaluate: async (context) => {
      const awards = await context.useCache("badges:event-champion:existing", async () => {
        const entries = await context.prisma.userBadge.findMany({
          where: {
            revokedAt: null,
            badge: { slug: "event-champion" },
          },
          select: { userId: true, earnedAt: true, note: true, seasonKey: true },
        });
        return entries;
      });

      const userIds = new Set(context.candidates.map((candidate) => candidate.id));
      return awards
        .filter((award) => userIds.has(award.userId))
        .map((award) => ({
          userId: award.userId,
          seasonKey: award.seasonKey ?? "community-events",
          earnedAt: award.earnedAt ?? context.now,
          note: award.note ?? null,
          reason: "Aus vorherigem Event-Sieg übernommen.",
        }));
    },
  },
  {
    id: "bug-hunter.reports",
    badgeSlug: "bug-hunter",
    description: "Hilft aktiv bei technischen Tests und meldet Bugs.",
    defaultReason: "Verifiziertes Entwicklerkonto oder hohe Reputation.",
    priority: 100,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          const hasGithub = candidate.connectedAccounts.some(
            (account) => account.provider === "GITHUB" && account.verified
          );
          return hasGithub || (stats?.reputation ?? 0) >= 350;
        },
        {
          reason: "Verifiziertes Entwicklerkonto oder Reputation über 350.",
        }
      ),
  },
  {
    id: "helpful-responder.support",
    badgeSlug: "helpful-responder",
    description: "Antwortet schnell und hilfreich auf Fragen anderer.",
    defaultReason: "Viele hilfreiche Antworten mit positiver Resonanz.",
    priority: 110,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          if (!stats) return false;
          return stats.posts >= 50 && stats.likesReceived >= 100;
        },
        {
          reason: "Mindestens 50 Antworten und über 100 Likes erhalten.",
        }
      ),
  },
  {
    id: "mentor.trust",
    badgeSlug: "mentor",
    description: "Unterstützt neue Mitglieder nachhaltig.",
    defaultReason: "Hohe Vertrauensstufe und aktive Hilfestellung.",
    priority: 120,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          if (!stats) return false;
          return hasMinimumTrust(candidate, TrustLevel.VETERAN) && stats.likesGiven >= 120;
        },
        {
          reason: "Vertrauensstufe VETERAN und mindestens 120 gegebene Likes.",
        }
      ),
  },
  {
    id: "creative-mind.profile",
    badgeSlug: "creative-mind",
    description: "Inspiriert mit Projekten und kreativen Profilinhalten.",
    defaultReason: "Ausführliches Profil mit mehreren Projektreferenzen.",
    priority: 130,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const profile = candidate.profile;
          if (!profile) return false;
          return (
            profile.linksCount >= 3 ||
            profile.socialsCount >= 3 ||
            profile.aboutLength >= 200 ||
            profile.interestsLength >= 120
          );
        },
        {
          reason: "Profil mit mindestens drei Projekten oder umfangreichen Beschreibungen.",
        }
      ),
  },
  {
    id: "community-builder.network",
    badgeSlug: "community-builder",
    description: "Bringt Menschen zusammen und startet Projekte.",
    defaultReason: "Hohe Themenanzahl und aktive Community-Verknüpfung.",
    priority: 140,
    evaluate: async (context) =>
      makeGrants(
        context,
        (candidate) => {
          const stats = candidate.stats;
          if (!stats) return false;
          return stats.topics >= 30 && stats.posts >= 150 && candidate.followerCount >= 10;
        },
        {
          reason: "Mindestens 30 Themen, 150 Beiträge und 10 Follower.",
        }
      ),
  },
];

const baseSlugSet = new Set(primaryRules.map((rule) => rule.badgeSlug));

const legacyFallbackRules: BadgeRule[] = Array.from(KNOWN_OFFICIAL_BADGES)
  .filter((slug) => slug)
  .map((slug) => ({
    id: `legacy.profile.${slug}`,
    badgeSlug: slug,
    description: `Legacy-Fallback für ${slug}.`,
    defaultReason: `Legacy-Badge aus importierten Profildaten (${slug}).`,
    priority: 400,
    allowRevocation: false,
    evaluate: async (context) => {
      const grants: BadgeGrant[] = [];
      for (const candidate of context.candidates) {
        if (!withTarget(context, candidate)) continue;
        const legacy = candidate.profile?.legacyOfficial;
        const metadata = legacy?.get(slug);
        if (!metadata) continue;
        grants.push({
          userId: candidate.id,
          reason:
            metadata.description ??
            metadata.label ??
            `Legacy-Badge aus importierten Profildaten (${slug}).`,
          note: metadata.label ?? null,
          earnedAt: candidate.createdAt,
        });
      }
      return grants;
    },
  }));

const badgeRules: BadgeRule[] = [
  ...primaryRules,
  ...legacyFallbackRules.filter((rule) => !baseSlugSet.has(rule.badgeSlug)),
];

export default badgeRules;
