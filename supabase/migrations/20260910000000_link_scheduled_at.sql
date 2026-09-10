ALTER TABLE "public"."links"
ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone;
