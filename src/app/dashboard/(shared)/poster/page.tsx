import Pricing from "@/components/marketing/pricing";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";

export default async function page() {
  await isAuthorized("POSTER");
  const currentUser = await getServerUserSession();
  const userRole = await getServerUserSubscriptionById(currentUser?.id);
  userRole;
  const cache = (Math.random()* 1000)
  return (
    <main className="flex flex-col w-full h-screen justify-center items-center">
      <p>Dashbard</p>
      <p>test cache :{cache}</p>

      {!userRole && <Pricing />}
    </main>
  );
}
