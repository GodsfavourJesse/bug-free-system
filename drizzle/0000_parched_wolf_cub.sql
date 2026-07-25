CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"password" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"membership_plan_id" uuid,
	"can_upgrade" boolean DEFAULT true NOT NULL,
	"referral_code" varchar(30) NOT NULL,
	"referred_by" uuid,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp,
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"available_balance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"held_balance" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_earned" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_deposited" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_withdrawn" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_available_balance_non_negative" CHECK ("wallets"."available_balance" >= 0),
	CONSTRAINT "wallet_held_balance_non_negative" CHECK ("wallets"."held_balance" >= 0),
	CONSTRAINT "wallet_total_earned_non_negative" CHECK ("wallets"."total_earned" >= 0),
	CONSTRAINT "wallet_total_deposited_non_negative" CHECK ("wallets"."total_deposited" >= 0),
	CONSTRAINT "wallet_total_withdrawn_non_negative" CHECK ("wallets"."total_withdrawn" >= 0)
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"upgrade_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"daily_order_limit" integer NOT NULL,
	"order_reward" numeric(12, 2) NOT NULL,
	"lifetime_order_limit" integer,
	"sort_order" integer NOT NULL,
	"description" varchar(255),
	"invitation_commission_level_1" numeric(5, 2) NOT NULL,
	"invitation_commission_level_2" numeric(5, 2) NOT NULL,
	"invitation_commission_level_3" numeric(5, 2) NOT NULL,
	"order_commission_level_1" numeric(5, 2) NOT NULL,
	"order_commission_level_2" numeric(5, 2) NOT NULL,
	"order_commission_level_3" numeric(5, 2) NOT NULL,
	"is_internship" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_before" numeric(18, 2) NOT NULL,
	"balance_after" numeric(18, 2) NOT NULL,
	"status" varchar(30) DEFAULT 'completed' NOT NULL,
	"reference" varchar(100) NOT NULL,
	"description" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_membership_plan_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_membership_plan_idx" ON "users" USING btree ("membership_plan_id");--> statement-breakpoint
CREATE INDEX "users_phone_idx" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_referred_by_idx" ON "users" USING btree ("referred_by");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_user_id_unique" ON "wallets" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_plans_name_unique" ON "membership_plans" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_plans_sort_order_unique" ON "membership_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "membership_plans_slug_idx" ON "membership_plans" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "membership_plans_sort_order_idx" ON "membership_plans" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "membership_plans_is_active_idx" ON "membership_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "membership_plans_is_internship_idx" ON "membership_plans" USING btree ("is_internship");--> statement-breakpoint
CREATE INDEX "transactions_user_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_wallet_idx" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_reference_idx" ON "transactions" USING btree ("reference");