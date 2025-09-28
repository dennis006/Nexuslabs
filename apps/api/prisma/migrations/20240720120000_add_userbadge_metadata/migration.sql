-- Add metadata fields to UserBadge for badge pipeline
ALTER TABLE "UserBadge"
  ADD COLUMN IF NOT EXISTS "earnedReason" TEXT,
  ADD COLUMN IF NOT EXISTS "revokedAt" TIMESTAMP(3);

-- Ensure existing revoked entries default to null state
UPDATE "UserBadge"
SET "revokedAt" = NULL
WHERE "revokedAt" IS NULL;
