CREATE TYPE "public"."deposit_status" AS ENUM('pending', 'under_review', 'approved', 'declined', 'cancelled');--> statement-breakpoint
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
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deposits_user_idx" ON "deposits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "deposits_wallet_idx" ON "deposits" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "deposits_status_idx" ON "deposits" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deposits_reviewed_by_idx" ON "deposits" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "deposits_created_at_idx" ON "deposits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "deposits_reference_idx" ON "deposits" USING btree ("reference");