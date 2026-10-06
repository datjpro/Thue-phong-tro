ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "category" text DEFAULT 'facility' NOT NULL;
ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "priority" text DEFAULT 'normal' NOT NULL;
ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "response" text;
ALTER TABLE "maintenance_requests" ADD COLUMN IF NOT EXISTS "is_anonymous" text DEFAULT 'no' NOT NULL;
