import { getBillingStatus, getRefundDetails } from "./data";

export type BillingStatus = Awaited<ReturnType<typeof getBillingStatus>>;
export type refundType = Exclude<
  Awaited<ReturnType<typeof getRefundDetails>>,
  undefined | null
>;
