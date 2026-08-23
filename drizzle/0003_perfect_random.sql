ALTER TABLE "shares" ALTER COLUMN "started_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "shares" ALTER COLUMN "started_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shares" ADD COLUMN "logo_public_id" varchar(255);--> statement-breakpoint
ALTER TABLE "share_purchases" ADD COLUMN "expected_return_at" timestamp NOT NULL;