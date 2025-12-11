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

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  return <SystemReportsPage reportsData={reportsData} />;
}
