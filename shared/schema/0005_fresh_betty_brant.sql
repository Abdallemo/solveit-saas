ALTER TABLE "mentorship_bookings" DROP CONSTRAINT "mentorship_bookings_payment_id_payments_id_fk";
--> statement-breakpoint
DROP INDEX "mentorship_bookings_paymentId_idx";--> statement-breakpoint
ALTER TABLE "mentorship_bookings" DROP COLUMN "payment_id";