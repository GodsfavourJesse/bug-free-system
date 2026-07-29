CREATE TABLE "completed_advertisements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"advertisement_id" uuid NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "completed_advertisements_user_advertisement_unique" UNIQUE("user_id","advertisement_id")
);
--> statement-breakpoint
ALTER TABLE "completed_advertisements" ADD CONSTRAINT "completed_advertisements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completed_advertisements" ADD CONSTRAINT "completed_advertisements_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;