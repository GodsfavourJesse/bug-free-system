ALTER TABLE "daily_order_items" DROP CONSTRAINT "daily_order_items_advertisement_id_advertisements_id_fk";
--> statement-breakpoint
ALTER TABLE "daily_order_items" ALTER COLUMN "advertisement_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_order_items" ADD CONSTRAINT "daily_order_items_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE restrict ON UPDATE no action;