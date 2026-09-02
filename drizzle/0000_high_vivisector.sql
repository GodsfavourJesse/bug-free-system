CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."daily_order_status" AS ENUM('pending', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."daily_order_item_status" AS ENUM('pending', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'approved', 'rejected', 'paid');--> statement-breakpoint
CREATE TYPE "public"."advertisement_status" AS ENUM('draft', 'active', 'inactive', 'scheduled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'under_review', 'approved', 'declined', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."share_status" AS ENUM('started', 'in_progress', 'closed');--> statement-breakpoint
CREATE TYPE "public"."share_purchase_status" AS ENUM('active', 'completed', 'return_credited');--> statement-breakpoint
CREATE TYPE "public"."support_conversation_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."support_message_sender" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"password" varchar(255) NOT NULL,
	"country" varchar(100) DEFAULT 'Nigeria' NOT NULL,
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
	"can_upgrade_to" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "membership_plans_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"withdrawal_id" uuid,
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
CREATE TABLE "upgrade_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_membership_plan_id" uuid NOT NULL,
	"requested_membership_plan_id" uuid NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"payment_method" varchar(30) NOT NULL,
	"payment_proof" text,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"reference" varchar(150) NOT NULL,
	"transaction_id" uuid,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"rejected_reason" text,
	"admin_note" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
	"advertisement_id" uuid NOT NULL,
	"reward" numeric(12, 2) NOT NULL,
	"status" "daily_order_item_status" DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"account_name" varchar(120) NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"bank_name" varchar(120) NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"admin_remark" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "completed_advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"advertisement_id" uuid NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "completed_advertisements_user_advertisement_unique" UNIQUE("user_id","advertisement_id")
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" varchar(100) NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"account_name" varchar(120) NOT NULL,
	"account_number" varchar(20) NOT NULL,
	"bank_name" varchar(120) NOT NULL,
	"payment_receipt" text NOT NULL,
	"status" "deposit_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"admin_remark" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deposits_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "admin_wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"direction" varchar(20) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"balance_before" numeric(18, 2) NOT NULL,
	"balance_after" numeric(18, 2) NOT NULL,
	"description" varchar(255) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"name" varchar(150) NOT NULL,
	"logo" varchar(500),
	"logo_public_id" varchar(255),
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
	"expected_return_at" timestamp NOT NULL,
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
CREATE TABLE "support_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "support_conversation_status" DEFAULT 'open' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"user_unread_count" integer DEFAULT 0 NOT NULL,
	"admin_unread_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"sender_type" "support_message_sender" NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corporate_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(150) NOT NULL,
	"message" text NOT NULL,
	"created_by" uuid NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corporate_announcement_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"announcement_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_membership_plan_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_withdrawal_id_withdrawals_id_fk" FOREIGN KEY ("withdrawal_id") REFERENCES "public"."withdrawals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_current_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("current_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_requested_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("requested_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_order_configs" ADD CONSTRAINT "daily_order_configs_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_orders" ADD CONSTRAINT "daily_orders_config_id_daily_order_configs_id_fk" FOREIGN KEY ("config_id") REFERENCES "public"."daily_order_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_order_items" ADD CONSTRAINT "daily_order_items_daily_order_id_daily_orders_id_fk" FOREIGN KEY ("daily_order_id") REFERENCES "public"."daily_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_order_items" ADD CONSTRAINT "daily_order_items_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_advertisements" ADD CONSTRAINT "completed_advertisements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_advertisements" ADD CONSTRAINT "completed_advertisements_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_wallet_transactions" ADD CONSTRAINT "admin_wallet_transactions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_created_by_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_share_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shares"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_purchases" ADD CONSTRAINT "share_purchases_wallet_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversation_id_support_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcements" ADD CONSTRAINT "corporate_announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcement_reads" ADD CONSTRAINT "corporate_announcement_reads_announcement_id_corporate_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."corporate_announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcement_reads" ADD CONSTRAINT "corporate_announcement_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "membership_plans_can_upgrade_to_idx" ON "membership_plans" USING btree ("can_upgrade_to");--> statement-breakpoint
CREATE INDEX "membership_plans_is_internship_idx" ON "membership_plans" USING btree ("is_internship");--> statement-breakpoint
CREATE INDEX "transactions_user_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_wallet_idx" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_reference_idx" ON "transactions" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "upgrade_requests_user_idx" ON "upgrade_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_current_plan_idx" ON "upgrade_requests" USING btree ("current_membership_plan_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_requested_plan_idx" ON "upgrade_requests" USING btree ("requested_membership_plan_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_status_idx" ON "upgrade_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upgrade_requests_reviewed_by_idx" ON "upgrade_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "upgrade_requests_created_at_idx" ON "upgrade_requests" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "upgrade_requests_reference_idx" ON "upgrade_requests" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "upgrade_requests_transaction_idx" ON "upgrade_requests" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deposits_user_idx" ON "deposits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deposits_wallet_idx" ON "deposits" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "deposits_status_idx" ON "deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deposits_reviewed_by_idx" ON "deposits" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "deposits_created_at_idx" ON "deposits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deposits_reference_idx" ON "deposits" USING btree ("reference");--> statement-breakpoint
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
CREATE UNIQUE INDEX "share_purchases_return_reference_unique" ON "share_purchases" USING btree ("return_reference");--> statement-breakpoint
CREATE UNIQUE INDEX "support_conversations_user_unique" ON "support_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_conversations_status_idx" ON "support_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "support_conversations_last_message_idx" ON "support_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "support_conversations_user_idx" ON "support_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_messages_conversation_idx" ON "support_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "support_messages_sender_idx" ON "support_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "support_messages_created_at_idx" ON "support_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "support_messages_read_idx" ON "support_messages" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "corporate_announcements_published_idx" ON "corporate_announcements" USING btree ("is_published","published_at");--> statement-breakpoint
CREATE INDEX "corporate_announcements_created_by_idx" ON "corporate_announcements" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "corporate_announcements_created_at_idx" ON "corporate_announcements" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "corporate_announcement_user_unique" ON "corporate_announcement_reads" USING btree ("announcement_id","user_id");