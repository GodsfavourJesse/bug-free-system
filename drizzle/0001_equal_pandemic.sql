CREATE TYPE "public"."share_status" AS ENUM('started', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."share_purchase_status" AS ENUM('active', 'completed', 'return_credited');--> statement-breakpoint
CREATE TABLE "shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"logo" varchar(500),
	"description" text,
	"daily_return_percentage" numeric(8, 4) NOT NULL,
	"cycle_days" integer NOT NULL,
	"status" "share_status" DEFAULT 'started' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shares_daily_return_percentage_positive" CHECK ("shares"."daily_return_percentage" > 0),
	CONSTRAINT "shares_cycle_days_positive" CHECK ("shares"."cycle_days" > 0)
);
--> statement-breakpoint
CREATE TABLE "share_purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"share_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"purchase_amount" numeric(18, 2) NOT NULL,
	"daily_return_percentage" numeric(8, 4) NOT NULL,
	"daily_return_amount" numeric(18, 2) NOT NULL,
	"cycle_days" integer NOT NULL,
	"total_return_amount" numeric(18, 2) NOT NULL,
	"purchased_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"return_credited_at" timestamp,
	"status" "share_purchase_status" DEFAULT 'active' NOT NULL,
	"purchase_reference" varchar(100) NOT NULL,
	"return_reference" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "share_purchases_purchase_amount_positive" CHECK ("share_purchases"."purchase_amount" > 0),
	CONSTRAINT "share_purchases_daily_return_percentage_positive" CHECK ("share_purchases"."daily_return_percentage" > 0),
	CONSTRAINT "share_purchases_daily_return_amount_positive" CHECK ("share_purchases"."daily_return_amount" > 0),
	CONSTRAINT "share_purchases_cycle_days_positive" CHECK ("share_purchases"."cycle_days" > 0),
	CONSTRAINT "share_purchases_total_return_positive" CHECK ("share_purchases"."total_return_amount" > 0)
);
--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_share_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shares"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_wallet_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "shares_created_by_idx" ON "shares" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "shares_status_idx" ON "shares" USING btree ("status");--> statement-breakpoint
CREATE INDEX "shares_created_at_idx" ON "shares" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "share_purchases_user_idx" ON "share_purchases" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "share_purchases_share_idx" ON "share_purchases" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "share_purchases_wallet_idx" ON "share_purchases" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "share_purchases_status_idx" ON "share_purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "share_purchases_expires_at_idx" ON "share_purchases" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "share_purchases_purchased_at_idx" ON "share_purchases" USING btree ("purchased_at");--> statement-breakpoint
CREATE UNIQUE INDEX "share_purchases_purchase_reference_unique" ON "share_purchases" USING btree ("purchase_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "share_purchases_return_reference_unique" ON "share_purchases" USING btree ("return_reference");