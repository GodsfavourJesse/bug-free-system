DROP INDEX "notifications_read_idx";--> statement-breakpoint
ALTER TABLE "corporate_announcements" ALTER COLUMN "published_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "corporate_announcements" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","is_read");