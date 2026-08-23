ALTER TABLE "admin_wallet_transactions" ALTER COLUMN "amount" SET DATA TYPE numeric(18, 2);--> statement-breakpoint
ALTER TABLE "admin_wallet_transactions" ALTER COLUMN "balance_before" SET DATA TYPE numeric(18, 2);--> statement-breakpoint
ALTER TABLE "admin_wallet_transactions" ALTER COLUMN "balance_after" SET DATA TYPE numeric(18, 2);