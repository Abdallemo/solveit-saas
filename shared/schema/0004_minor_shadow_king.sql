ALTER TABLE "payments" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "mentor_session" ADD COLUMN "payment_id" uuid;--> statement-breakpoint
ALTER TABLE "mentor_session" ADD CONSTRAINT "mentor_session_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "payments" DROP CONSTRAINT "payments_stripe_payment_intent_id_unique";--> statement-breakpoint

WITH
migration_map AS (
    SELECT
        s.id AS session_id,
        p.user_id,
        p.status,
        p.stripe_payment_intent_id,
        p.stripe_charge_id,
        ROUND((p.amount::numeric / count(*) OVER (PARTITION BY b.id)), 2) AS split_amount,
        gen_random_uuid() AS new_payment_id
    FROM mentorship_bookings b
    JOIN payments p ON b.payment_id = p.id
    JOIN mentor_session s ON b.id = s.booking_id
    WHERE s.payment_id IS NULL
),

create_payments AS (
    INSERT INTO payments (
        id, user_id, amount, status, purpose,
        stripe_payment_intent_id, stripe_charge_id,
        created_at
    )
    SELECT
        new_payment_id, user_id, split_amount, status, 'Mentor Session Payment',
        stripe_payment_intent_id, stripe_charge_id,
        NOW()
    FROM migration_map
    RETURNING id
)

UPDATE mentor_session
SET payment_id = mm.new_payment_id
FROM migration_map mm
WHERE mentor_session.id = mm.session_id;
