ALTER TYPE "public"."payment_status" ADD VALUE 'PENDING_USER_ACTION';--> statement-breakpoint
ALTER TABLE "blocked_tasks" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mentorship_bookings" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mentor_session" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "refunds" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "solver_profile" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "task_comments" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "public"."refunds" ALTER COLUMN "refundStatus" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."refund_status";--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'PROCESSING', 'REFUNDED', 'REJECTED', 'FAILED', 'PENDING_USER_ACTION');--> statement-breakpoint
ALTER TABLE "public"."refunds" ALTER COLUMN "refundStatus" SET DATA TYPE "public"."refund_status" USING "refundStatus"::"public"."refund_status";