import { AuthGate } from "@/components/GateComponents";
import { Button } from "@/components/ui/button";
import { getServerUserSession } from "@/features/auth/server/actions";
import { getAllCustomerPaymentMethods } from "@/features/payments/server/action";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import AccountComponent from "@/features/users/components/poster/AccountComponent";
import { isUserAccountOauth } from "@/features/users/server/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PosterAccountPage() {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.id) return <AuthGate />;

  const isOauthUser = await isUserAccountOauth(currentUser.id);
  const cards = await getAllCustomerPaymentMethods(currentUser.id);

  const refress = await getServerReturnUrl();
  return (
    <div className="w-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`${refress}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Account Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AccountComponent isOauthUser={isOauthUser} cards={cards} />;
    </div>
  );
}
