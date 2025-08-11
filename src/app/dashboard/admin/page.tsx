import { isAuthorized } from "@/features/auth/server/actions";
import AdminDashboardComponent from "@/features/users/components/admin/AdminHomePageComponent";
import { getLogs } from "@/lib/logging/action";

export default async function page() {
  await isAuthorized("ADMIN");
  const serverLogs = await getLogs()
  return (
    <AdminDashboardComponent serverLogs={serverLogs}/>
  );
}
