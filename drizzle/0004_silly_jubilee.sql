CREATE TYPE "public"."daily_order_status" AS ENUM('pending', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."daily_order_item_status" AS ENUM('pending', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "daily_order_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_plan_id" uuid NOT NULL,
	"tasks_per_day" integer NOT NULL,
	"reward_per_task" numeric(12, 2) NOT NULL,
	"daily_reward_limit" numeric(12, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"membership_plan_id" uuid NOT NULL,
	"config_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "daily_order_status" DEFAULT 'pending' NOT NULL,
	"required_tasks" integer NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"total_reward" numeric(12, 2) NOT NULL,
	"reward_earned" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_order_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"advertisement_id" uuid,
	"reward" numeric(12, 2) NOT NULL,
	"status" "daily_order_item_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_order_configs" ADD CONSTRAINT "daily_order_configs_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_config_id_daily_order_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."daily_order_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_order_items" ADD CONSTRAINT "daily_order_items_daily_order_id_daily_orders_id_fk" FOREIGN KEY ("daily_order_id") REFERENCES "public"."daily_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "daily_order_limit";--> statement-breakpoint
ALTER TABLE "membership_plans" DROP COLUMN "order_reward";