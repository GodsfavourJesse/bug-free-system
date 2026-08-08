ALTER TABLE "membership_plans" ALTER COLUMN "description" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "badge_label";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "badge_stars";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "badge_color";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "daily_order_quota";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "daily_order_revenue";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "benefits";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "requirements";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "reward_per_order";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "daily_revenue_limit";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "daily_withdrawal_limit";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "minimum_withdrawal";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "maximum_withdrawal";