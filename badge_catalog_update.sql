-- badge_catalog_update.sql
-- Zweck: Offizielle Badges bereinigen und den Badge-Katalog für NexusLabs aktualisieren.
-- Ausführung: In einer PostgreSQL-Instanz mit der NexusLabs Datenbank ausführen.

BEGIN;

-- 1. Doppelte Slugs unabhängig von Groß-/Kleinschreibung zusammenführen.
WITH slug_groups AS (
  SELECT
    id,
    slug,
    lower(slug) AS slug_lower,
    first_value(id) OVER (
      PARTITION BY lower(slug)
      ORDER BY (slug = lower(slug)) DESC, "createdAt" ASC, id ASC
    ) AS keep_id,
    row_number() OVER (
      PARTITION BY lower(slug)
      ORDER BY (slug = lower(slug)) DESC, "createdAt" ASC, id ASC
    ) AS rn
  FROM public."Badge"
),
relinked AS (
  UPDATE public."UserBadge" ub
  SET "badgeId" = sg.keep_id
  FROM slug_groups sg
  WHERE ub."badgeId" = sg.id
    AND sg.rn > 1
  RETURNING 1
),
normalized AS (
  UPDATE public."Badge" b
  SET slug = sg.slug_lower,
      "updatedAt" = now()
  FROM slug_groups sg
  WHERE b.id = sg.keep_id
    AND b.slug <> sg.slug_lower
  RETURNING 1
)
DELETE FROM public."Badge" b
USING slug_groups sg
WHERE b.id = sg.id
  AND sg.rn > 1;

-- 2. Badge-Katalog aktualisieren bzw. ergänzen.
INSERT INTO public."Badge" (slug, name, description, icon, "isSeasonal", "seasonKey", "startsAt", "endsAt")
VALUES
  ('core-team', 'Core Team', 'Bestätigtes Mitglied des NexusLabs Kernteams.', 'ShieldCheck', false, NULL, NULL, NULL),
  ('operations-lead', 'Operations Lead', 'Verantwortlich für Operations und Community-Sicherheit.', 'Workflow', false, NULL, NULL, NULL),
  ('founder', 'Founder', 'Gründungsmitglied von NexusLabs.', 'Crown', false, NULL, NULL, NULL),
  ('early-adopter', 'Early Adopter', 'Unter den ersten 100 Mitgliedern der Community.', 'Rocket', false, NULL, NULL, NULL),
  ('verified', 'Verifiziert', 'Identität durch das NexusLabs Team bestätigt.', 'BadgeCheck', false, NULL, NULL, NULL),
  ('community-champion', 'Community Champion', 'Steht für eine positive NexusLabs Community-Kultur.', 'Users', false, NULL, NULL, NULL),
  ('top-poster', 'Top Poster', 'Veröffentlicht regelmäßig hochwertige Beiträge und Diskussionen.', 'MessageSquare', false, NULL, NULL, NULL),
  ('knowledge-sharer', 'Knowledge Sharer', 'Teilt Guides und beantwortet Fachfragen im Forum.', 'BookOpen', false, NULL, NULL, NULL),
  ('event-champion', 'Event Champion', 'Gewinner eines offiziellen NexusLabs Community-Events.', 'Trophy', true, 'community-events', NULL, NULL),
  ('bug-hunter', 'Bug Hunter', 'Meldet kritische Bugs und hilft beim Testen neuer Features.', 'Bug', false, NULL, NULL, NULL),
  ('helpful-responder', 'Helpful Responder', 'Hilft anderen Mitgliedern mit schnellen und hilfreichen Antworten.', 'LifeBuoy', false, NULL, NULL, NULL),
  ('mentor', 'Mentor', 'Begleitet neue Mitglieder und unterstützt beim Einstieg.', 'GraduationCap', false, NULL, NULL, NULL),
  ('creative-mind', 'Creative Mind', 'Teilt kreative Projekte und inspiriert die Community.', 'Palette', false, NULL, NULL, NULL),
  ('community-builder', 'Community Builder', 'Organisiert Community-Projekte und bringt Leute zusammen.', 'Hammer', false, NULL, NULL, NULL)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      icon = EXCLUDED.icon,
      "isSeasonal" = EXCLUDED."isSeasonal",
      "seasonKey" = EXCLUDED."seasonKey",
      "startsAt" = EXCLUDED."startsAt",
      "endsAt" = EXCLUDED."endsAt",
      "updatedAt" = now();

COMMIT;
