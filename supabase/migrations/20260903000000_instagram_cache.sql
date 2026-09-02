-- Cached Instagram data for committee members.
--
-- These are kept separate from `bio` / `profile_image_url` so that anything an
-- admin sets by hand stays authoritative: the UI prefers the manual column and
-- only falls back to the cached one. That also means the cache can be cleared
-- and re-synced without destroying hand-entered content.
--
-- Written idempotently so it is safe to replay against a database where it has
-- already been applied by hand.
ALTER TABLE "public"."team_members"
ADD COLUMN IF NOT EXISTS "instagram_avatar_url" "text",
ADD COLUMN IF NOT EXISTS "instagram_bio" "text",
ADD COLUMN IF NOT EXISTS "instagram_synced_at" timestamp with time zone;

-- Avatars scraped from Instagram are re-hosted here; Instagram's CDN URLs are
-- signed and expire, so they cannot be stored directly.
INSERT INTO "storage"."buckets" ("id", "name", "public")
VALUES ('avatars', 'avatars', true)
ON CONFLICT ("id") DO NOTHING;

DROP POLICY IF EXISTS "Public can read avatars" ON "storage"."objects";

CREATE POLICY "Public can read avatars" ON "storage"."objects" FOR
SELECT
    USING ("bucket_id" = 'avatars');
