import { getPosterStats } from "@/features/tasks/server/action";
import PosterDashboard from "@/features/users/components/poster/PosterDashboard";

export default async function page() {
  const data = await getPosterStats();
  return <PosterDashboard chartData={data} />;
}
