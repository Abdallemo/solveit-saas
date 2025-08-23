"use client";

import useStripeSessionValidate from "../lib/useStripeSessionValidate";

export default function StripeCheckoutSucessClient({ id }: { id: string }) {
  useStripeSessionValidate(id);
  return <></>;
}
