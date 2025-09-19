import { BillingGate } from "@/components/AuthGate";
import {
  getServerUserSession
} from "@/features/auth/server/actions";
import { handlerStripeConnect } from "@/features/payments/server/action";
import { getUserById } from "@/features/users/server/actions";

export default async function Page() {
  const user = await getServerUserSession();
  if (!user || !user.id) return;
  const userDb = await getUserById(user.id);
  if (!userDb) return;
  if (!userDb.stripeAccountLinked)
    return <BillingGate action={handlerStripeConnect} />;
  return <div>Linked</div>;
}
