CREATE TYPE "public"."advertisement_status" AS ENUM('draft', 'active', 'inactive', 'scheduled', 'expired');--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"short_description" text NOT NULL,
	"full_description" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"banner_url" text,
	"button_text" varchar(80) DEFAULT 'Learn More' NOT NULL,
	"target_url" text NOT NULL,
	"category" varchar(120) NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" "advertisement_status" DEFAULT 'draft' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"view_count" integer DEFAULT 0 NOT NULL,
	"completion_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "advertisements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "daily_order_items" ALTER COLUMN "advertisement_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_order_items" ADD CONSTRAINT "daily_order_items_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE no action ON UPDATE no action;