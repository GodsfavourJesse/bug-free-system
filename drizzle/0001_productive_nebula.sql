CREATE TYPE "public"."support_conversation_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."support_message_sender" AS ENUM('user', 'admin');--> statement-breakpoint
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
	"published_at" timestamp DEFAULT now() NOT NULL,
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
ALTER TABLE "support_conversations" ADD CONSTRAINT "support_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_conversation_id_support_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcements" ADD CONSTRAINT "corporate_announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcement_reads" ADD CONSTRAINT "corporate_announcement_reads_announcement_id_corporate_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."corporate_announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_announcement_reads" ADD CONSTRAINT "corporate_announcement_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
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