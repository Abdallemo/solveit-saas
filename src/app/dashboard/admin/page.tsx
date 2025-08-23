import { isAuthorized } from "@/features/auth/server/actions";
import AdminDashboardComponent from "@/features/users/components/admin/AdminHomePageComponent";
import { getSummaryStats } from "@/features/users/server/actions";
import { getLogs } from "@/lib/logging/action";
export type StastType = Awaited<ReturnType<typeof getSummaryStats>>
export default async function page() {
  await isAuthorized(["ADMIN"]);
  const serverLogs = await getLogs();
  const stats = await getSummaryStats();
  
  
  return <AdminDashboardComponent serverLogs={serverLogs} stats ={stats} />;
}
