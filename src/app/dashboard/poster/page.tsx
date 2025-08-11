import Pricing from "@/components/marketing/pricing";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import {
  getServerUserSubscriptionById,
  getUserById,
} from "@/features/users/server/actions";
import { redirect } from "next/navigation";

export default async function page() {
  const currentUser = await getServerUserSession();

  if (!currentUser) {
    return redirect("/api/auth/signout?callbackUrl=/login");
  }

  const userInDb = await getUserById(currentUser.id!);
  if (!userInDb) {
    return redirect(
      "/api/auth/signout?callbackUrl=/login?error=account_deleted"
    );
  }
  await isAuthorized("POSTER");
  const userRole = await getServerUserSubscriptionById(currentUser?.id);
  const cache = Math.random() * 1000;
  return (
    <main className="flex flex-col w-full h-screen justify-center items-center">
      <p>Dashbard</p>
      <p>test cache :{cache}</p>

      {!userRole && <Pricing />}
    </main>
  );
}
