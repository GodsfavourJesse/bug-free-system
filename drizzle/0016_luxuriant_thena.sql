ALTER TABLE "membership_plans" ALTER COLUMN "description" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "daily_order_quota" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "reward_per_order" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "daily_revenue_limit" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "daily_withdrawal_limit" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "minimum_withdrawal" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD COLUMN "maximum_withdrawal" numeric(12, 2);