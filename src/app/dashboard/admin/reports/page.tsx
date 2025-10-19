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
export default function page() {
  return (
    <SystemReportsPage reportsData={reportsData} aiFlagsData={aiFlagsData} />
  );
}
