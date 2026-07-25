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
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_current_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("current_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_requested_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("requested_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upgrade_requests" ADD CONSTRAINT "upgrade_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "upgrade_requests_user_idx" ON "upgrade_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_current_plan_idx" ON "upgrade_requests" USING btree ("current_membership_plan_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_requested_plan_idx" ON "upgrade_requests" USING btree ("requested_membership_plan_id");--> statement-breakpoint
CREATE INDEX "upgrade_requests_status_idx" ON "upgrade_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "upgrade_requests_reviewed_by_idx" ON "upgrade_requests" USING btree ("reviewed_by");--> statement-breakpoint
CREATE INDEX "upgrade_requests_created_at_idx" ON "upgrade_requests" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "upgrade_requests_reference_idx" ON "upgrade_requests" USING btree ("reference");--> statement-breakpoint
CREATE INDEX "upgrade_requests_transaction_idx" ON "upgrade_requests" USING btree ("transaction_id");