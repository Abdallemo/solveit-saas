import SystemReportsPage from "@/features/users/components/admin/SystemReportPageComps";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  return <SystemReportsPage />;
}
