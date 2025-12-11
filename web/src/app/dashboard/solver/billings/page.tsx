import { BillingGate } from "@/components/GateComponents";
import { getServerUserSession } from "@/features/auth/server/actions";
import BillingStatusCard from "@/features/payments/components/BillingPageComps";
import { handlerStripeConnect } from "@/features/payments/server/action";
import { getUserById } from "@/features/users/server/actions";

export default async function Page() {
  const user = await getServerUserSession();
  if (!user || !user.id) return;
  const userDb = await getUserById(user.id);
  if (!userDb) return;
  if (!userDb.stripeAccountLinked)
    return <BillingGate action={handlerStripeConnect} />;
  return (
    <main className="bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Billing & Payouts
          </h1>
          <p className="text-muted-foreground">
            Manage your account balance and payout settings
          </p>
        </div>
        <BillingStatusCard />
      </div>
    </main>
  );
}
