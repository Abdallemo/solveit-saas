import { getAdminStats } from "@/features/tasks/server/action";
import AdminDashboard from "@/features/users/components/admin/AdminHomePageComponent";
import { getSummaryStats } from "@/features/users/server/actions";
import { getLogs } from "@/lib/logging/action";
export type StastType = Awaited<ReturnType<typeof getSummaryStats>>;
export default async function page() {

  const serverLogs = await getLogs();
  const data  = await getAdminStats()
  return <AdminDashboard serverLogs={serverLogs} statsData={data} />;
}
