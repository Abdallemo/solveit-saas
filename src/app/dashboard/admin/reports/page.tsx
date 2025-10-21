import { getRevenueData } from "@/features/tasks/server/data";
import SystemReportsPage from "@/features/users/components/admin/SystemReportPageComps";
const reportsData = [
  {
    id: "1",
    name: "Monthly User Growth Report",
    description: "Report on user growth trends over the past month.",
    lastGenerated: "2023-06-15",
  },
  {
    id: "2",
    name: "Financial Report",
    description: "Monthly financial summary including revenue and expenses.",
    lastGenerated: "2023-06-15",
  },
  {
    id: "3",
    name: "Task Categories Distribution Report",
    description: "Breakdown of tasks by category.",
    lastGenerated: "2023-06-15",
  },
  {
    id: "4",
    name: "AI Moderation Flags Report",
    description: "Daily AI moderation flags summary.",
    lastGenerated: "2023-06-15",
  },
];
const aiFlagsData = [
  { date: "Oct 10", flags: 12 },
  { date: "Oct 11", flags: 15 },
  { date: "Oct 12", flags: 8 },
  { date: "Oct 13", flags: 22 },
  { date: "Oct 14", flags: 18 },
  { date: "Oct 15", flags: 25 },
];
const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 250 },
  { month: "Apr", users: 320 },
  { month: "May", users: 410 },
  { month: "Jun", users: 520 },
];
const revenueData = [
  { month: "Jan", revenue: 4500 },
  { month: "Feb", revenue: 5200 },
  { month: "Mar", revenue: 6100 },
  { month: "Apr", revenue: 7300 },
  { month: "May", revenue: 8200 },
  { month: "Jun", revenue: 9900 },
];
const taskCategoriesData = [
  { name: "Bug Reports", value: 35 },
  { name: "Feature Requests", value: 25 },
  { name: "Support", value: 20 },
  { name: "Moderation", value: 20 },
];

export default async function page() {
  const d = await getRevenueData("2025-09-21", "2025-10-21");
  console.log(d);
  return (
    <SystemReportsPage
      reportsData={reportsData}
      aiFlagsData={aiFlagsData}
      userGrowthData={userGrowthData}
      revenueData={revenueData}
      taskCategoriesData={taskCategoriesData}
    />
  );
}
