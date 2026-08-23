ALTER TABLE "shares" ALTER COLUMN "started_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "shares" ALTER COLUMN "started_at" SET NOT NULL;