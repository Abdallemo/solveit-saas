import { env } from "@/env/server";
import { isAuthorized } from "@/features/auth/server/actions";
import AdminSettingsPage from "@/features/users/components/admin/SettingsPageComps";

export default async function Page() {
  await isAuthorized(["ADMIN"]);
  const stripTestMode = env.STRIPE_TEST_MODE;

  return <AdminSettingsPage stripeTestMode={stripTestMode} />;
}
