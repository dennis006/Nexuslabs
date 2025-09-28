import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { createRequireAuth } from "../middlewares/requireAuth";

const profileParamsSchema = z.object({
  handle: z
    .string()
    .min(2)
    .max(64)
    .regex(/^@?[A-Za-z0-9_-]+$/, "INVALID_HANDLE"),
});

const profileQuerySchema = z.object({
  includeSettings: z
    .union([
      z.boolean(),
      z
        .string()
        .transform((value) => value === "true" || value === "1" || value === "on"),
    ])
    .optional(),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(3).max(50).optional(),
  bio: z.string().max(280).nullable().optional(),
  pronouns: z.string().max(32).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  timezone: z.string().max(64).nullable().optional(),
  website: z.string().url().nullable().optional(),
  language: z.string().min(2).max(8).nullable().optional(),
  signature: z.string().max(500).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  birthday: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),
  socials: z
    .array(
      z.object({
        id: z.string().max(40),
        label: z.string().max(40).optional(),
        url: z.string().url(),
        handle: z.string().max(60).nullable().optional(),
        icon: z.string().max(60).nullable().optional(),
      })
    )
    .optional(),
  links: z
    .array(
      z.object({
        label: z.string().max(60),
        url: z.string().url(),
      })
    )
    .optional(),
  about: z.string().max(1200).nullable().optional(),
  interests: z.string().max(600).nullable().optional(),
  privacy: z
    .object({
      showEmail: z.boolean().optional(),
      showLastOnline: z.boolean().optional(),
      showBirthday: z.boolean().optional(),
      showLocation: z.boolean().optional(),
      showPronouns: z.boolean().optional(),
      allowMessages: z.boolean().optional(),
      allowTagging: z.boolean().optional(),
      blockedUsers: z.array(z.string()).optional(),
    })
    .optional(),
  notifications: z
    .object({
      emailMentions: z.boolean().optional(),
      emailFollows: z.boolean().optional(),
      emailDigest: z.boolean().optional(),
      pushMentions: z.boolean().optional(),
      pushReplies: z.boolean().optional(),
      pushFollows: z.boolean().optional(),
      watchedThreads: z.array(z.string()).optional(),
    })
    .optional(),
  appearance: z
    .object({
      theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),
      density: z.enum(["COMFORTABLE", "COMPACT"]).optional(),
      accent: z.string().max(32).nullable().optional(),
      language: z.string().min(2).max(8).nullable().optional(),
      timeFormat: z.enum(["H12", "H24"]).optional(),
    })
    .optional(),
});

const sanitizeHandle = (handle: string) => handle.replace(/^@/, "");

const profileSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  createdAt: true,
  displayName: true,
  avatarUrl: true,
  coverImage: true,
  bio: true,
  pronouns: true,
  website: true,
  location: true,
  timezone: true,
  language: true,
  signature: true,
  birthday: true,
  lastSeenAt: true,
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
      bio: true,
      about: true,
      interests: true,
      socials: true,
      links: true,
      badges: true,
      updatedAt: true,
    },
  },
  notificationSettings: {
    select: {
      emailMentions: true,
      emailFollows: true,
      emailDigest: true,
      pushMentions: true,
      pushReplies: true,
      pushFollows: true,
      watchedThreads: true,
      updatedAt: true,
    },
  },
  privacySettings: {
    select: {
      showEmail: true,
      showLastOnline: true,
      showBirthday: true,
      showLocation: true,
      showPronouns: true,
      allowMessages: true,
      allowTagging: true,
      blockedUsers: true,
      updatedAt: true,
    },
  },
  appearanceSettings: {
    select: {
      theme: true,
      density: true,
      accent: true,
      language: true,
      timeFormat: true,
      updatedAt: true,
    },
  },
  connectedAccounts: {
    select: {
      id: true,
      provider: true,
      displayName: true,
      profileUrl: true,
      verified: true,
      metadata: true,
      linkedAt: true,
    },
  },
  badgeAwards: {
    select: {
      id: true,
      earnedAt: true,
      seasonKey: true,
      note: true,
      badge: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          icon: true,
          isSeasonal: true,
          seasonKey: true,
          startsAt: true,
          endsAt: true,
        },
      },
    },
    orderBy: { earnedAt: "desc" },
  },
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
  actionsReceived: {
    select: {
      id: true,
      type: true,
      reason: true,
      active: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  },
} satisfies Prisma.UserSelect;

type ProfileRecord = Prisma.UserGetPayload<{ select: typeof profileSelect }>;

const parseJsonArray = <T>(value: Prisma.JsonValue | null | undefined): T[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

const parseJsonObject = <T extends Record<string, unknown>>(value: Prisma.JsonValue | null | undefined): T | null => {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as T;
  }
  return null;
};

const toJsonInput = (value: unknown) => {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
};

const computeProfileCompletion = (user: ProfileRecord) => {
  const essentials = [
    Boolean(user.avatarUrl),
    Boolean(user.displayName && user.displayName !== user.username),
    Boolean(user.bio ?? user.profile?.bio ?? user.profile?.about),
    Boolean(user.website),
    parseJsonArray(user.profile?.socials).length > 0,
    Boolean(user.signature),
  ];
  const completed = essentials.filter(Boolean).length;
  const score = Math.round((completed / essentials.length) * 100);
  const missing: string[] = [];
  if (!user.avatarUrl) missing.push("avatar");
  if (!user.displayName || user.displayName === user.username) missing.push("displayName");
  if (!user.bio && !user.profile?.bio && !user.profile?.about) missing.push("bio");
  if (!user.website) missing.push("website");
  if (parseJsonArray(user.profile?.socials).length === 0) missing.push("socials");
  if (!user.signature) missing.push("signature");
  return { score, completed, total: essentials.length, missing };
};

const formatLocalTime = (timeZone: string | null | undefined) => {
  if (!timeZone) return null;
  try {
    return new Intl.DateTimeFormat("de-DE", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return null;
  }
};

type ViewerContext = { id: string; role: Role } | null;

type SocialLink = {
  id: string;
  label?: string;
  url: string;
  handle?: string | null;
  icon?: string | null;
};

type ExternalLink = { label: string; url: string };

const sanitizeSocials = (value: Prisma.JsonValue | null | undefined): SocialLink[] => {
  const array = parseJsonArray<SocialLink>(value);
  return array.map((item) => ({
    id: item.id,
    label: item.label,
    url: item.url,
    handle: item.handle ?? null,
    icon: item.icon ?? null,
  }));
};

const sanitizeLinks = (value: Prisma.JsonValue | null | undefined): ExternalLink[] => {
  const array = parseJsonArray<ExternalLink>(value);
  return array.map((item) => ({ label: item.label, url: item.url }));
};

const buildProfilePayload = (
  user: ProfileRecord,
  viewer: ViewerContext,
  includeSettings: boolean,
  options: { following: boolean }
) => {
  const privacy = user.privacySettings;
  const isSelf = viewer?.id === user.id;
  const isAdmin = viewer?.role === "ADMIN";
  const blockedSet = new Set(privacy?.blockedUsers ?? []);

  if (viewer && !isSelf && blockedSet.has(viewer.id)) {
    return { blocked: true as const };
  }

  const socials = sanitizeSocials(user.profile?.socials ?? null);
  const links = sanitizeLinks(user.profile?.links ?? null);
  const customBadges = sanitizeSocials(user.profile?.badges ?? null);
  const completion = computeProfileCompletion(user);
  const trust = user.stats?.trustLevel ?? "NEWCOMER";

  const badgeAwards = user.badgeAwards.map((award) => ({
    id: award.id,
    earnedAt: award.earnedAt,
    seasonKey: award.seasonKey ?? null,
    note: award.note ?? null,
    badge: {
      id: award.badge.id,
      slug: award.badge.slug,
      name: award.badge.name,
      description: award.badge.description,
      icon: award.badge.icon ?? null,
      isSeasonal: award.badge.isSeasonal,
      seasonKey: award.badge.seasonKey ?? null,
      startsAt: award.badge.startsAt,
      endsAt: award.badge.endsAt,
    },
  }));

  const metadata = {
    joinedAt: user.createdAt,
    lastOnline:
      privacy?.showLastOnline !== false || isSelf || isAdmin ? user.lastSeenAt : null,
    location:
      privacy?.showLocation !== false || isSelf || isAdmin ? user.location ?? null : null,
    timezone: user.timezone ?? null,
    localTime: formatLocalTime(user.timezone),
    birthday:
      privacy?.showBirthday || isSelf || isAdmin ? user.birthday ?? null : null,
    email: privacy?.showEmail || isSelf || isAdmin ? user.email : null,
  };

  const stats = {
    topics: user.stats?.topics ?? 0,
    posts: user.stats?.posts ?? 0,
    likesGiven: user.stats?.likesGiven ?? 0,
    likesReceived: user.stats?.likesReceived ?? 0,
    reputation: user.stats?.reputation ?? 0,
    trustLevel: trust,
    streak: {
      current: user.stats?.streakDays ?? 0,
      best: user.stats?.longestStreak ?? 0,
      lastActiveAt: user.stats?.lastActiveAt ?? null,
    },
  };

  const contact = {
    website: user.website ?? null,
    socials,
    links,
    pronouns:
      privacy?.showPronouns !== false || isSelf || isAdmin ? user.pronouns ?? null : null,
    canMessage: (privacy?.allowMessages ?? true) && (!viewer || !blockedSet.has(viewer.id)),
    pmAvailable: privacy?.allowMessages ?? true,
  };

  const viewerInfo = {
    isSelf,
    isAdmin,
    canEdit: isSelf || isAdmin,
    following: options.following,
    canMessage:
      (privacy?.allowMessages ?? true) && (!viewer || !blockedSet.has(viewer.id)),
  };

  const moderation = {
    actions: user.actionsReceived.map((action) => ({
      id: action.id,
      type: action.type,
      reason: action.reason,
      active: action.active,
      createdAt: action.createdAt,
      expiresAt: action.expiresAt ?? null,
    })),
    trustLevel: trust,
  };

  const verification = {
    email: true,
    badge: badgeAwards.some((award) => award.badge.slug === "verified"),
  };

  const profile = {
    id: user.id,
    displayName: user.displayName ?? user.username,
    handle: user.username,
    avatarUrl: user.avatarUrl ?? null,
    coverImage: user.coverImage ?? null,
    bio: user.bio ?? user.profile?.bio ?? null,
    about: user.profile?.about ?? null,
    interests: user.profile?.interests ?? null,
    role: user.role,
    signature: user.signature ?? null,
    language: user.language ?? null,
    stats,
    metadata,
    contact,
    badges: badgeAwards,
    customBadges,
    connectedAccounts: user.connectedAccounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      displayName: account.displayName ?? null,
      profileUrl: account.profileUrl ?? null,
      verified: account.verified,
      linkedAt: account.linkedAt,
      metadata: account.metadata,
    })),
    counts: {
      followers: user._count.followers,
      following: user._count.following,
    },
    activity: {
      threads: [] as unknown[],
      posts: [] as unknown[],
      reactions: [] as unknown[],
      lastActiveAt: user.stats?.lastActiveAt ?? null,
    },
    progress: completion,
    verification,
    signatureRules: {
      maxLength: 500,
      mediaAllowed: false,
      htmlWhitelist: ["b", "i", "strong", "em", "a"],
    },
    moderation,
  };

  const settings = includeSettings && (isSelf || isAdmin)
    ? {
        privacy: user.privacySettings,
        notifications: user.notificationSettings,
        appearance: user.appearanceSettings,
      }
    : undefined;

  return {
    blocked: false as const,
    profile,
    settings,
    viewer: viewerInfo,
  };
};

const resolveViewer = async (request: FastifyRequest, app: Parameters<typeof createRequireAuth>[0]) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) {
    return null;
  }

  try {
    const payload = app.jwt.verify(token) as { sub: string; role?: Role };
    return {
      id: payload.sub,
      role: payload.role ?? "MEMBER",
    } as const;
  } catch {
    return null;
  }
};

const usersRoutes: FastifyPluginAsync = async (app) => {
  const requireAuth = createRequireAuth(app);

  app.get(
    "/me/permissions",
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.user) {
        return reply.code(401).send({ role: "GUEST" });
    }

      return reply.send({ role: request.user.role });
    }
  );

  app.get("/:handle", async (request, reply) => {
    const params = profileParamsSchema.parse(request.params);
    const query = profileQuerySchema.parse(request.query ?? {});
    const handle = sanitizeHandle(params.handle);
    const viewer = await resolveViewer(request, app);

    const user = await app.db.user.findFirst({
      where: { username: { equals: handle, mode: "insensitive" } },
      select: profileSelect,
    });

    if (!user) {
      return reply.code(404).send({ error: "NOT_FOUND", message: "Profil nicht gefunden" });
    }

    const following = viewer
      ? Boolean(
          await app.db.userFollow.findUnique({
            where: {
              followerId_followingId: { followerId: viewer.id, followingId: user.id },
            },
            select: { followerId: true },
          })
        )
      : false;

    const payload = buildProfilePayload(user, viewer, Boolean(query.includeSettings), {
      following,
    });

    if (payload.blocked) {
      return reply.code(403).send({ error: "BLOCKED", message: "Der Zugriff auf dieses Profil ist eingeschränkt." });
    }

    return reply.send({
      profile: payload.profile,
      viewer: payload.viewer,
      settings: payload.settings ?? null,
    });
  });

  app.patch(
    "/:handle",
    { preHandler: requireAuth },
    async (request, reply) => {
      const params = profileParamsSchema.parse(request.params);
      const body = updateProfileSchema.parse(request.body ?? {});
      const handle = sanitizeHandle(params.handle);
      const viewer = request.user!;

      const target = await app.db.user.findFirst({
        where: { username: { equals: handle, mode: "insensitive" } },
        select: { id: true, role: true },
      });

      if (!target) {
        return reply.code(404).send({ error: "NOT_FOUND", message: "Profil nicht gefunden" });
      }

      const isSelf = target.id === viewer.id;
      const isAdmin = viewer.role === "ADMIN";

      if (!isSelf && !isAdmin) {
        return reply.code(403).send({ error: "FORBIDDEN" });
      }

      const profileData: Prisma.UserProfileUpsertWithoutUserInput | undefined =
        body.bio !== undefined ||
        body.about !== undefined ||
        body.interests !== undefined ||
        body.socials !== undefined ||
        body.links !== undefined
          ? {
              update: {
                bio: body.bio !== undefined ? body.bio : undefined,
                about: body.about !== undefined ? body.about : undefined,
                interests: body.interests !== undefined ? body.interests : undefined,
                socials: toJsonInput(body.socials ?? undefined),
                links: toJsonInput(body.links ?? undefined),
              },
              create: {
                bio: body.bio ?? null,
                about: body.about ?? null,
                interests: body.interests ?? null,
                socials: toJsonInput(body.socials ?? null) ?? Prisma.JsonNull,
                links: toJsonInput(body.links ?? null) ?? Prisma.JsonNull,
              },
            }
          : undefined;

      const userUpdate: Prisma.UserUpdateInput = {};

      if (body.displayName !== undefined) userUpdate.displayName = body.displayName;
      if (body.bio !== undefined) userUpdate.bio = body.bio;
      if (body.pronouns !== undefined) userUpdate.pronouns = body.pronouns;
      if (body.location !== undefined) userUpdate.location = body.location;
      if (body.timezone !== undefined) userUpdate.timezone = body.timezone;
      if (body.website !== undefined) userUpdate.website = body.website;
      if (body.language !== undefined) userUpdate.language = body.language;
      if (body.signature !== undefined) userUpdate.signature = body.signature;
      if (body.avatarUrl !== undefined) userUpdate.avatarUrl = body.avatarUrl;
      if (body.coverImage !== undefined) userUpdate.coverImage = body.coverImage;
      if (body.birthday !== undefined) {
        userUpdate.birthday = body.birthday ? new Date(body.birthday) : null;
      }
      if (profileData) {
        userUpdate.profile = {
          upsert: profileData,
        } as never;
      }

      if (body.notifications) {
        userUpdate.notificationSettings = {
          upsert: {
            create: {
              emailMentions: body.notifications.emailMentions ?? true,
              emailFollows: body.notifications.emailFollows ?? true,
              emailDigest: body.notifications.emailDigest ?? false,
              pushMentions: body.notifications.pushMentions ?? true,
              pushReplies: body.notifications.pushReplies ?? true,
              pushFollows: body.notifications.pushFollows ?? false,
              watchedThreads: toJsonInput(body.notifications.watchedThreads ?? null) ?? Prisma.JsonNull,
            },
            update: {
              emailMentions: body.notifications.emailMentions ?? undefined,
              emailFollows: body.notifications.emailFollows ?? undefined,
              emailDigest: body.notifications.emailDigest ?? undefined,
              pushMentions: body.notifications.pushMentions ?? undefined,
              pushReplies: body.notifications.pushReplies ?? undefined,
              pushFollows: body.notifications.pushFollows ?? undefined,
              watchedThreads: toJsonInput(body.notifications.watchedThreads ?? undefined),
            },
          },
        };
      }

      if (body.privacy) {
        userUpdate.privacySettings = {
          upsert: {
            create: {
              showEmail: body.privacy.showEmail ?? false,
              showLastOnline: body.privacy.showLastOnline ?? true,
              showBirthday: body.privacy.showBirthday ?? false,
              showLocation: body.privacy.showLocation ?? true,
              showPronouns: body.privacy.showPronouns ?? true,
              allowMessages: body.privacy.allowMessages ?? true,
              allowTagging: body.privacy.allowTagging ?? true,
              blockedUsers: body.privacy.blockedUsers ?? [],
            },
            update: {
              showEmail: body.privacy.showEmail ?? undefined,
              showLastOnline: body.privacy.showLastOnline ?? undefined,
              showBirthday: body.privacy.showBirthday ?? undefined,
              showLocation: body.privacy.showLocation ?? undefined,
              showPronouns: body.privacy.showPronouns ?? undefined,
              allowMessages: body.privacy.allowMessages ?? undefined,
              allowTagging: body.privacy.allowTagging ?? undefined,
              blockedUsers: body.privacy.blockedUsers ?? undefined,
            },
          },
        };
      }

      if (body.appearance) {
        userUpdate.appearanceSettings = {
          upsert: {
            create: {
              theme: body.appearance.theme ?? "SYSTEM",
              density: body.appearance.density ?? "COMFORTABLE",
              accent: body.appearance.accent ?? null,
              language: body.appearance.language ?? null,
              timeFormat: body.appearance.timeFormat ?? "H24",
            },
            update: {
              theme: body.appearance.theme ?? undefined,
              density: body.appearance.density ?? undefined,
              accent: body.appearance.accent ?? undefined,
              language: body.appearance.language ?? undefined,
              timeFormat: body.appearance.timeFormat ?? undefined,
            },
          },
        };
      }

      const updated = await app.db.user.update({
        where: { id: target.id },
        data: userUpdate,
        select: profileSelect,
      });

      const following = !isSelf
        ? Boolean(
            await app.db.userFollow.findUnique({
              where: {
                followerId_followingId: { followerId: viewer.id, followingId: target.id },
              },
              select: { followerId: true },
            })
          )
        : false;

      const payload = buildProfilePayload(
        updated,
        { id: viewer.id, role: viewer.role },
        true,
        { following }
      );

      if (payload.blocked) {
        return reply.code(200).send({
          profile: null,
          viewer: payload.viewer,
          settings: payload.settings ?? null,
        });
      }

      return reply.send({
        profile: payload.profile,
        viewer: payload.viewer,
        settings: payload.settings ?? null,
      });
    }
  );

  app.post(
    "/:handle/follow",
    { preHandler: requireAuth },
    async (request, reply) => {
      const params = profileParamsSchema.parse(request.params);
      const handle = sanitizeHandle(params.handle);
      const viewer = request.user!;

      const target = await app.db.user.findFirst({
        where: { username: { equals: handle, mode: "insensitive" } },
        select: { id: true },
      });

      if (!target) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }

      if (target.id === viewer.id) {
        return reply.code(400).send({ error: "CANNOT_FOLLOW_SELF" });
      }

      await app.db.userFollow.upsert({
        where: {
          followerId_followingId: { followerId: viewer.id, followingId: target.id },
        },
        update: {},
        create: {
          followerId: viewer.id,
          followingId: target.id,
        },
      });

      const [followers, following] = await Promise.all([
        app.db.userFollow.count({ where: { followingId: target.id } }),
        app.db.userFollow.count({ where: { followerId: viewer.id } }),
      ]);

      return reply.send({
        ok: true,
        counts: {
          followers,
          following,
        },
      });
    }
  );

  app.delete(
    "/:handle/follow",
    { preHandler: requireAuth },
    async (request, reply) => {
      const params = profileParamsSchema.parse(request.params);
      const handle = sanitizeHandle(params.handle);
      const viewer = request.user!;

      const target = await app.db.user.findFirst({
        where: { username: { equals: handle, mode: "insensitive" } },
        select: { id: true },
      });

      if (!target) {
        return reply.code(404).send({ error: "NOT_FOUND" });
      }

      if (target.id === viewer.id) {
        return reply.code(400).send({ error: "CANNOT_UNFOLLOW_SELF" });
      }

      await app.db.userFollow.deleteMany({
        where: { followerId: viewer.id, followingId: target.id },
      });

      const [followers, following] = await Promise.all([
        app.db.userFollow.count({ where: { followingId: target.id } }),
        app.db.userFollow.count({ where: { followerId: viewer.id } }),
      ]);

      return reply.send({
        ok: true,
        counts: {
          followers,
          following,
        },
      });
    }
  );
};

export default usersRoutes;
