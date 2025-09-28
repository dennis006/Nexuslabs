-- profile_bootstrap.sql
-- Zweck: Schema-Erweiterungen für das Profilsystem und Bootstrap-Daten für NexusLabs.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrustLevel') THEN
    CREATE TYPE "TrustLevel" AS ENUM ('NEWCOMER', 'MEMBER', 'CONTRIBUTOR', 'VETERAN', 'MODERATOR', 'ADMINISTRATOR');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ThemePreference') THEN
    CREATE TYPE "ThemePreference" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DensityPreference') THEN
    CREATE TYPE "DensityPreference" AS ENUM ('COMFORTABLE', 'COMPACT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TimeFormatPreference') THEN
    CREATE TYPE "TimeFormatPreference" AS ENUM ('H12', 'H24');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SecurityEventType') THEN
    CREATE TYPE "SecurityEventType" AS ENUM (
      'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
      'TWO_FA_ENABLED', 'TWO_FA_DISABLED', 'SESSION_INVALIDATED', 'DEVICE_LOGOUT'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConnectedProvider') THEN
    CREATE TYPE "ConnectedProvider" AS ENUM (
      'DISCORD', 'GITHUB', 'STEAM', 'TWITTER', 'MASTODON', 'BLUESKY', 'LINKEDIN', 'WEBSITE', 'OTHER'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisciplinaryType') THEN
    CREATE TYPE "DisciplinaryType" AS ENUM ('WARNING', 'TEMP_BAN', 'PERM_BAN', 'NOTE');
  END IF;
END $$;

ALTER TABLE public."User"
  ADD COLUMN IF NOT EXISTS "displayName" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS birthday TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "lastSeenAt" TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public."UserProfile" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  bio TEXT,
  about TEXT,
  interests TEXT,
  socials JSONB,
  links JSONB,
  badges JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserStats" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  topics INTEGER NOT NULL DEFAULT 0,
  posts INTEGER NOT NULL DEFAULT 0,
  "likesGiven" INTEGER NOT NULL DEFAULT 0,
  "likesReceived" INTEGER NOT NULL DEFAULT 0,
  reputation INTEGER NOT NULL DEFAULT 0,
  "trustLevel" "TrustLevel" NOT NULL DEFAULT 'NEWCOMER',
  "streakDays" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "streakUpdatedAt" TIMESTAMPTZ,
  "lastActiveAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserNotificationSetting" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "emailMentions" BOOLEAN NOT NULL DEFAULT true,
  "emailFollows" BOOLEAN NOT NULL DEFAULT true,
  "emailDigest" BOOLEAN NOT NULL DEFAULT false,
  "pushMentions" BOOLEAN NOT NULL DEFAULT true,
  "pushReplies" BOOLEAN NOT NULL DEFAULT true,
  "pushFollows" BOOLEAN NOT NULL DEFAULT false,
  "watchedThreads" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserPrivacySetting" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "showEmail" BOOLEAN NOT NULL DEFAULT false,
  "showLastOnline" BOOLEAN NOT NULL DEFAULT true,
  "showBirthday" BOOLEAN NOT NULL DEFAULT false,
  "showLocation" BOOLEAN NOT NULL DEFAULT true,
  "showPronouns" BOOLEAN NOT NULL DEFAULT true,
  "allowMessages" BOOLEAN NOT NULL DEFAULT true,
  "allowTagging" BOOLEAN NOT NULL DEFAULT true,
  "blockedUsers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserAppearanceSetting" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  theme "ThemePreference" NOT NULL DEFAULT 'SYSTEM',
  density "DensityPreference" NOT NULL DEFAULT 'COMFORTABLE',
  accent TEXT,
  language TEXT,
  "timeFormat" "TimeFormatPreference" NOT NULL DEFAULT 'H24',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserSecurityEvent" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  type "SecurityEventType" NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserSession" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "lastUsedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public."UserTwoFactor" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  "backupCodes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."ConnectedAccount" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  provider "ConnectedProvider" NOT NULL,
  "providerId" TEXT NOT NULL,
  "displayName" TEXT,
  "profileUrl" TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  "linkedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, "providerId"),
  UNIQUE ("userId", provider)
);

CREATE TABLE IF NOT EXISTS public."Badge" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  "isSeasonal" BOOLEAN NOT NULL DEFAULT false,
  "seasonKey" TEXT,
  "startsAt" TIMESTAMPTZ,
  "endsAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."UserBadge" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "badgeId" TEXT NOT NULL REFERENCES public."Badge" (id) ON DELETE CASCADE,
  "earnedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "seasonKey" TEXT,
  note TEXT,
  UNIQUE ("userId", "badgeId", "seasonKey")
);

CREATE TABLE IF NOT EXISTS public."UserFollow" (
  "followerId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "followingId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("followerId", "followingId")
);

CREATE TABLE IF NOT EXISTS public."UserDisciplinaryAction" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "issuedById" TEXT REFERENCES public."User" (id),
  type "DisciplinaryType" NOT NULL,
  reason TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "expiresAt" TIMESTAMPTZ
);

-- Bootstrap missing relational rows for bestehende Nutzer
INSERT INTO public."UserProfile" (id, "userId")
SELECT gen_random_uuid()::text, u.id
FROM public."User" u
WHERE NOT EXISTS (SELECT 1 FROM public."UserProfile" up WHERE up."userId" = u.id);

INSERT INTO public."UserStats" (id, "userId")
SELECT gen_random_uuid()::text, u.id
FROM public."User" u
WHERE NOT EXISTS (SELECT 1 FROM public."UserStats" us WHERE us."userId" = u.id);

INSERT INTO public."UserNotificationSetting" (id, "userId")
SELECT gen_random_uuid()::text, u.id
FROM public."User" u
WHERE NOT EXISTS (SELECT 1 FROM public."UserNotificationSetting" un WHERE un."userId" = u.id);

INSERT INTO public."UserPrivacySetting" (id, "userId")
SELECT gen_random_uuid()::text, u.id
FROM public."User" u
WHERE NOT EXISTS (SELECT 1 FROM public."UserPrivacySetting" up WHERE up."userId" = u.id);

INSERT INTO public."UserAppearanceSetting" (id, "userId")
SELECT gen_random_uuid()::text, u.id
FROM public."User" u
WHERE NOT EXISTS (SELECT 1 FROM public."UserAppearanceSetting" ua WHERE ua."userId" = u.id);

-- Admin-Benutzer initialisieren
DO $$
DECLARE
  v_admin_id TEXT;
  v_core_team_badge TEXT;
  v_operations_badge TEXT;
BEGIN
  INSERT INTO public."User" (id, email, username, "passwordHash", role, "displayName", pronouns, timezone, language, website, bio, signature, location, "avatarUrl", "coverImage", "createdAt", "updatedAt", "lastSeenAt")
  VALUES (
    gen_random_uuid()::text,
    lower('dennis@nexuslabs.gg'),
    'dennis',
    crypt('Admin!234', gen_salt('bf', 12)),
    'ADMIN',
    'Dennis Schimpf',
    'er/ihm',
    'Europe/Berlin',
    'de',
    'https://nexuslabs.gg',
    'Operations Lead bei NexusLabs. Verantwortlich für Partnerschaften, Sicherheit und Produktstrategie.',
    'Live-Service Insights & Community Ops.',
    'Hamburg, Deutschland',
    'https://cdn.nexuslabs.gg/avatars/dennis-schimpf.jpg',
    'https://cdn.nexuslabs.gg/banners/nexuslabs-control-room.jpg',
    now(),
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE
    SET role = 'ADMIN',
        username = 'dennis',
        "displayName" = EXCLUDED."displayName",
        pronouns = EXCLUDED.pronouns,
        timezone = EXCLUDED.timezone,
        language = EXCLUDED.language,
        website = EXCLUDED.website,
        bio = EXCLUDED.bio,
        signature = EXCLUDED.signature,
        location = EXCLUDED.location,
        "avatarUrl" = EXCLUDED."avatarUrl",
        "coverImage" = EXCLUDED."coverImage",
        "lastSeenAt" = now()
  RETURNING id INTO v_admin_id;

  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM public."User" WHERE email = lower('dennis@nexuslabs.gg');
  END IF;

  UPDATE public."UserStats"
    SET topics = 32,
        posts = 214,
        "likesGiven" = 184,
        "likesReceived" = 562,
        reputation = 1760,
        "trustLevel" = 'ADMINISTRATOR',
        "streakDays" = 12,
        "longestStreak" = 45,
        "streakUpdatedAt" = now(),
        "lastActiveAt" = now()
  WHERE "userId" = v_admin_id;

  UPDATE public."UserProfile"
    SET bio = 'Operations Lead bei NexusLabs.',
        about = 'Ich begleite Publisher und Creator bei Live-Service-Projekten, leite unser Operationsteam und moderiere kritische Eskalationen.',
        interests = 'Live-Service-Strategie, Competitive Gaming, Community Ops, Partnerships',
        socials = jsonb_build_array(
          jsonb_build_object('id','linkedin','label','LinkedIn','url','https://www.linkedin.com/in/dennisschimpf/','handle','dennisschimpf','icon','linkedin'),
          jsonb_build_object('id','x','label','X (Twitter)','url','https://twitter.com/NexusLabsHQ','handle','@NexusLabsHQ','icon','twitter'),
          jsonb_build_object('id','discord','label','Discord','url','https://discord.com/users/3344556677889900','handle','dennis','icon','discord')
        ),
        links = jsonb_build_array(
          jsonb_build_object('label','Roadmap','url','https://nexuslabs.gg/roadmap'),
          jsonb_build_object('label','Partner Portal','url','https://nexuslabs.gg/partners'),
          jsonb_build_object('label','Pressekit','url','https://nexuslabs.gg/press')
        ),
        badges = jsonb_build_array(
          jsonb_build_object('id','core-team','label','Core Team','url','https://nexuslabs.gg/badges/core-team','handle',NULL,'icon','shield'),
          jsonb_build_object('id','operations-lead','label','Operations Lead','url','https://nexuslabs.gg/badges/operations-lead','handle',NULL,'icon','workflow')
        ),
        "updatedAt" = now()
  WHERE "userId" = v_admin_id;

  UPDATE public."UserNotificationSetting"
    SET "emailMentions" = true,
        "emailFollows" = true,
        "emailDigest" = true,
        "pushMentions" = true,
        "pushReplies" = true,
        "pushFollows" = true
  WHERE "userId" = v_admin_id;

  UPDATE public."UserPrivacySetting"
    SET "showEmail" = false,
        "showLastOnline" = true,
        "showBirthday" = false,
        "showLocation" = true,
        "showPronouns" = true,
        "allowMessages" = true,
        "allowTagging" = true,
        "blockedUsers" = ARRAY[]::TEXT[]
  WHERE "userId" = v_admin_id;

  UPDATE public."UserAppearanceSetting"
    SET theme = 'DARK',
        density = 'COMFORTABLE',
        accent = '#4C1D95',
        language = 'de',
        "timeFormat" = 'H24'
  WHERE "userId" = v_admin_id;

  INSERT INTO public."Badge" (slug, name, description, icon, "isSeasonal", "seasonKey")
  VALUES
    ('core-team', 'Core Team', 'Bestätigtes Mitglied des NexusLabs Kernteams.', 'ShieldCheck', false, NULL),
    ('operations-lead', 'Operations Lead', 'Verantwortlich für Operations und Community-Sicherheit.', 'Workflow', false, NULL),
    ('founder', 'Founder', 'Gründungsmitglied von NexusLabs.', 'Crown', false, NULL),
    ('early-adopter', 'Early Adopter', 'Unter den ersten 100 Mitgliedern der Community.', 'Rocket', false, NULL),
    ('verified', 'Verifiziert', 'Identität durch das NexusLabs Team bestätigt.', 'BadgeCheck', false, NULL),
    ('community-champion', 'Community Champion', 'Steht für eine positive NexusLabs Community-Kultur.', 'Users', false, NULL),
    ('top-poster', 'Top Poster', 'Veröffentlicht regelmäßig hochwertige Beiträge und Diskussionen.', 'MessageSquare', false, NULL),
    ('knowledge-sharer', 'Knowledge Sharer', 'Teilt Guides und beantwortet Fachfragen im Forum.', 'BookOpen', false, NULL),
    ('event-champion', 'Event Champion', 'Gewinner eines offiziellen NexusLabs Community-Events.', 'Trophy', true, 'community-events'),
    ('bug-hunter', 'Bug Hunter', 'Meldet kritische Bugs und hilft beim Testen neuer Features.', 'Bug', false, NULL),
    ('helpful-responder', 'Helpful Responder', 'Hilft anderen Mitgliedern mit schnellen und hilfreichen Antworten.', 'LifeBuoy', false, NULL),
    ('mentor', 'Mentor', 'Begleitet neue Mitglieder und unterstützt beim Einstieg.', 'GraduationCap', false, NULL),
    ('creative-mind', 'Creative Mind', 'Teilt kreative Projekte und inspiriert die Community.', 'Palette', false, NULL),
    ('community-builder', 'Community Builder', 'Organisiert Community-Projekte und bringt Leute zusammen.', 'Hammer', false, NULL)
  ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        "isSeasonal" = EXCLUDED."isSeasonal",
        "seasonKey" = EXCLUDED."seasonKey",
        "startsAt" = EXCLUDED."startsAt",
        "endsAt" = EXCLUDED."endsAt",
        "updatedAt" = now();

  SELECT id INTO v_core_team_badge FROM public."Badge" WHERE slug = 'core-team';
  SELECT id INTO v_operations_badge FROM public."Badge" WHERE slug = 'operations-lead';

  INSERT INTO public."UserBadge" (id, "userId", "badgeId", "earnedAt", "seasonKey", note)
  VALUES
    (gen_random_uuid()::text, v_admin_id, v_core_team_badge, now() - INTERVAL '240 days', NULL, 'Kernteam seit Season 0'),
    (gen_random_uuid()::text, v_admin_id, v_operations_badge, now() - INTERVAL '90 days', NULL, 'Leitet Operations & Moderation')
  ON CONFLICT ("userId", "badgeId", "seasonKey") DO UPDATE
    SET "earnedAt" = EXCLUDED."earnedAt",
        note = EXCLUDED.note;

  INSERT INTO public."ConnectedAccount" (id, "userId", provider, "providerId", "displayName", "profileUrl", verified, metadata, "linkedAt")
  VALUES
    (gen_random_uuid()::text, v_admin_id, 'DISCORD', '3344556677889900', 'Dennis', 'https://discord.com/users/3344556677889900', true, jsonb_build_object('server','NexusLabs HQ'), now()),
    (gen_random_uuid()::text, v_admin_id, 'LINKEDIN', 'dennisschimpf', 'Dennis Schimpf', 'https://www.linkedin.com/in/dennisschimpf/', true, jsonb_build_object('headline','Operations Lead @ NexusLabs'), now()),
    (gen_random_uuid()::text, v_admin_id, 'GITHUB', 'dennisschimpf', 'Dennis Schimpf', 'https://github.com/dennisschimpf', true, jsonb_build_object('repos', 24), now())
  ON CONFLICT ("userId", provider) DO UPDATE
    SET "displayName" = EXCLUDED."displayName",
        "profileUrl" = EXCLUDED."profileUrl",
        verified = EXCLUDED.verified,
        metadata = EXCLUDED.metadata,
        "linkedAt" = EXCLUDED."linkedAt";
END $$;

COMMIT;
