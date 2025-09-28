import { Prisma } from "@prisma/client";
import { parseJsonArray } from "../utils/json";

export const KNOWN_OFFICIAL_BADGES = new Set(
  [
    "core-team",
    "operations-lead",
    "founder",
    "early-adopter",
    "verified",
    "community-champion",
    "top-poster",
    "knowledge-sharer",
    "event-champion",
    "bug-hunter",
    "helpful-responder",
    "mentor",
    "creative-mind",
    "community-builder",
  ].map((slug) => slug.toLowerCase())
);

export type LegacyBadgeMetadata = { label?: string; description?: string };

export type ParsedCustomBadge = {
  link: {
    id: string;
    label?: string;
    url: string;
    handle?: string | null;
    icon?: string | null;
  };
  slugHint: string | null;
};

export const extractProfileBadges = (
  value: Prisma.JsonValue | null | undefined
): { legacyOfficial: Map<string, LegacyBadgeMetadata>; custom: ParsedCustomBadge[] } => {
  const entries = parseJsonArray<unknown>(value);
  const legacyOfficial = new Map<string, LegacyBadgeMetadata>();
  const custom: ParsedCustomBadge[] = [];

  entries.forEach((entry, index) => {
    if (typeof entry === "string") {
      const slug = entry.trim().toLowerCase();
      if (slug) {
        legacyOfficial.set(slug, {});
      }
      return;
    }

    if (entry && typeof entry === "object") {
      const record = entry as Record<string, unknown>;
      const slugValue =
        typeof record.slug === "string"
          ? record.slug
          : typeof record.id === "string"
          ? record.id
          : undefined;
      const normalizedSlug = slugValue?.trim().toLowerCase() ?? null;
      const label = typeof record.label === "string" ? record.label : undefined;
      const description =
        typeof record.description === "string" ? record.description : undefined;
      const url = typeof record.url === "string" ? record.url : undefined;
      const handle =
        typeof record.handle === "string"
          ? record.handle
          : record.handle === null
          ? null
          : undefined;
      const icon =
        typeof record.icon === "string"
          ? record.icon
          : record.icon === null
          ? null
          : undefined;
      const type = typeof record.type === "string" ? record.type.toLowerCase() : undefined;
      const kind = typeof record.kind === "string" ? record.kind.toLowerCase() : undefined;
      const category =
        typeof record.category === "string" ? record.category.toLowerCase() : undefined;

      if (normalizedSlug) {
        const flaggedOfficial =
          KNOWN_OFFICIAL_BADGES.has(normalizedSlug) ||
          type === "official" ||
          kind === "official" ||
          category === "official" ||
          type === "team" ||
          kind === "team" ||
          category === "team";

        if (flaggedOfficial) {
          legacyOfficial.set(normalizedSlug, { label, description });
          return;
        }
      }

      if (url) {
        const id =
          (typeof record.id === "string" && record.id.trim()) ||
          normalizedSlug ||
          `legacy-${index}`;
        custom.push({
          link: {
            id,
            label,
            url,
            handle: handle ?? null,
            icon: icon ?? null,
          },
          slugHint: normalizedSlug,
        });
      }
    }
  });

  return { legacyOfficial, custom };
};

export const formatBadgeName = (slug: string) =>
  slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
