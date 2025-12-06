import { Button } from "@/components/ui/button";
import { isAuthorized } from "@/features/auth/server/actions";
import { getAllCustomerPaymentMethods } from "@/features/payments/server/action";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import AccountComponent from "@/features/users/components/poster/AccountComponent";
import { isUserAccountOauth } from "@/features/users/server/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function PosterAccountPage() {
  const { user } = await isAuthorized(["POSTER"]);
  let refress = await getServerReturnUrl();
  const isOauthUser = await isUserAccountOauth(user.id);
  const cards = await getAllCustomerPaymentMethods(user.id);
  return (
    <div className="w-full">
      <div className="border-b bg-sidebar/95 backdrop-blur supports-backdrop-filter:bg-sidebar/60 sticky top-0 z-50">
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
      <AccountComponent isOauthUser={isOauthUser} cards={cards} />
    </div>
  );
}
