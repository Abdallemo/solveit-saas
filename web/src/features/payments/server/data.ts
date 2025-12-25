"use server";

import db from "@/drizzle/db";
import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import { publicUserColumns } from "@/features/users/server/user-types";
import { stripe } from "@/lib/stripe";
import { to } from "@/lib/utils/async";
import { redirect, RedirectType } from "next/navigation";

export async function getRefundDetails(refundId: string) {
  const [data, err] = await to(
    db.query.RefundTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, refundId),
      with: {
        taskRefund: {
          with: {
            poster: { columns: publicUserColumns },
            solver: { columns: publicUserColumns },
          },
        },
      },
    }),
  );
  if (err) return null;
  return data!;
}

export async function getBillingStatus() {
  const {
    session: { user },
  } = await isAuthorized(["POSTER", "SOLVER"]);

  if (!user?.stripeAccountId) {
    return {
      isLinked: false,
      isPayoutsEnabled: false,
      hasPendingRequirements: false,
      externalAccountLast4: null,
      balance: { available: 0, pending: 0 },
      accountInfo: null,
      error: "Stripe account ID is missing.",
    };
  }

  try {
    const account = await stripe.accounts.retrieve(user.stripeAccountId, {
      expand: ["external_accounts"],
    });

    const balanceObject = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    const isPayoutsEnabled = account.capabilities?.transfers === "active";
    const hasPendingRequirements =
      (account.requirements?.currently_due?.length ?? 0) > 0;
    const isRestricted = account.requirements?.disabled_reason !== null;

    const bankAccount = (account.external_accounts?.data || []).find(
      (acc) => acc.object === "bank_account",
    ) as { last4?: string; bank_name?: string } | undefined;

    const accountInfo = {
      businessName:
        account.business_profile?.name ||
        account.settings?.dashboard?.display_name ||
        null,
      supportEmail:
        account.business_profile?.support_email || account.email || null,
      payoutSchedule: account.settings?.payouts?.schedule?.interval || "manual",
      country: account.country,
      bankName: bankAccount?.bank_name || null,
    };

    const myrAvailable =
      balanceObject.available.find((b) => b.currency === "myr")?.amount ?? 0;
    const myrPending =
      balanceObject.pending.find((b) => b.currency === "myr")?.amount ?? 0;

    return {
      isLinked: true,
      isPayoutsEnabled: isPayoutsEnabled && !isRestricted,
      hasPendingRequirements: hasPendingRequirements,
      externalAccountLast4: bankAccount?.last4 ?? null,
      balance: {
        available: myrAvailable / 100,
        pending: myrPending / 100,
      },
      accountInfo,
      error: null,
    };
  } catch (error) {
    console.error("Stripe Error:", error);
    return {
      isLinked: true,
      isPayoutsEnabled: false,
      hasPendingRequirements: true,
      externalAccountLast4: null,
      balance: { available: 0, pending: 0 },
      accountInfo: null,
      error: "Unable to retrieve account status.",
    };
  }
}

export interface PayoutTransaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrival_date: number;
  bank_name: string;
}

export async function getPayoutHistory() {
  const {
    session: { user },
  } = await isAuthorized(["POSTER", "SOLVER"]);
  if (!user?.stripeAccountId) return [];

  try {
    const payouts = await stripe.payouts.list(
      { limit: 5 },
      { stripeAccount: user.stripeAccountId },
    );

    return payouts.data.map((payout) => ({
      id: payout.id,
      amount: payout.amount / 100,
      currency: payout.currency.toUpperCase(),
      status: payout.status,
      arrival_date: payout.arrival_date * 1000,
      bank_name: payout.destination ? "Bank Account" : "Card",
    }));
  } catch (error) {
    console.error("Stripe Payout History Error:", error);
    return [];
  }
}
export async function getTransferHistory() {
  const {
    session: { user },
  } = await isAuthorized(["POSTER", "SOLVER"]);
  if (!user?.stripeAccountId) return [];

  try {
    const transfers = await stripe.transfers.list({
      limit: 10,
      destination: user.stripeAccountId,
    });
    return transfers.data.map((transfer) => ({
      id: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency.toUpperCase(),
      status: "completed",
      date: transfer.created * 1000,
      source_transaction: transfer.source_transaction || "N/A",
    }));
  } catch (error) {
    console.error("Stripe Transfer History Error:", error);
    return [];
  }
}
export async function manageStripeAccount() {
  const {
    session: { user },
  } = await isAuthorized(["POSTER", "SOLVER"]);

  if (!user || !user.stripeAccountId) {
    throw new Error("No connected Stripe account found.");
  }
  if (user.metadata.stripeAccountLinked) {
    console.log(
      `User ${user.id} is linked. Redirecting to Standard Dashboard.`,
    );
    return redirect("https://dashboard.stripe.com/login", RedirectType.push);
  }

  const returnUrl = `${env.NEXTAUTH_URL}/dashboard/${user.role?.toLowerCase()}/billings`;

  console.log(`User ${user.id} is NOT linked. Generating update link.`);

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_update",
  });

  return redirect(accountLink.url, RedirectType.push);
}
