import { env } from "@/env/server";
import { OnboardingFormData, User } from "@/features/users/server/user-types";
import Stripe from "stripe";
import { getBillingStatus, getRefundDetails } from "./data";

export type BillingStatus = Awaited<ReturnType<typeof getBillingStatus>>;
export type refundType = Exclude<
  Awaited<ReturnType<typeof getRefundDetails>>,
  undefined | null
>;
export function StripeConnectConfig(
  values: OnboardingFormData,
  user: User,
): Stripe.AccountCreateParams {
  return {
    type: "standard",
    email: user.email,
    business_type: "individual",

    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    individual: {
      first_name: values.first_name,
      last_name: values.last_name,
      email: user.email,
      dob: {
        day: values.dob?.getDate()!,
        month: values.dob?.getMonth()! + 1,
        year: values.dob?.getFullYear()!,
      },
      address: values.address,
      phone: "+15555550123",
      id_number: "000000000",
      verification: {
        document: {
          front: "file_identity_document_success",
        },
      },
    },
    business_profile: {
      mcc:
        values.business_profile.mcc === "5734"
          ? values.business_profile.mcc
          : "5734",
      product_description:
        "SolveIt is a student job board where students post and solve academic tasks.",
      url: env.PRODUCTION_URL,
    },
  } satisfies Stripe.AccountCreateParams;
}
