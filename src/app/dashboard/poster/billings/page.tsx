import { BillingGate } from "@/components/AuthGate";
import {
  getStripeConnectAccount,
  handlerStripeConnect,
} from "@/features/payments/server/action";

export default function page() {
  return <BillingGate action={handlerStripeConnect} />;
}
