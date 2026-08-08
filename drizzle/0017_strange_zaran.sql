ALTER TABLE "membership_plans" ADD COLUMN "badge_label" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "badge_stars" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "badge_color" varchar(30) DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "daily_order_revenue" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "benefits" varchar(5000)[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "requirements" varchar(5000)[] DEFAULT '{}' NOT NULL;