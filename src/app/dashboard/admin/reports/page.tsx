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

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ from: string; to: string }>;
}) {
  const { from, to } = await searchParams;
  // console.log("from:", from);
  // console.log("to:", to);
  // const u = await getUserGrowthData(from, to);

  // const u = await fetch(`http://localhost:3000/api/user_growth`, {
  //   method: "GET",
  //   headers: await headers(),
  // }).then(s=>s.json());
  // const r = await fetch(`http://localhost:3000/api/revenue`, {
  //   method: "GET",
  //   headers: await headers(),
  // }).then(s=>s.json());
  // const t = await fetch(`http://localhost:3000/api/task_categories`, {
  //   method: "GET",
  //   headers: await headers(),
  // }).then(s=>s.json());

  // const r = await getRevenueData(from, to);
  // const t = await getTaskCategoriesData(from, to);
  // console.log(d);
  return (
    <SystemReportsPage reportsData={reportsData} aiFlagsData={aiFlagsData}  />
    // <div className="flex flex-col gap-2 justify-between items-center w-full h-full p-20">
    //   <div className="w-full h-full">
    //     <h1>debug mode</h1>
    //     <p>user growth</p>
    //     <pre>{JSON.stringify(u, null, 2)}</pre>
    //     <br />
    //     <p>revenue</p>
    //     <pre>{JSON.stringify(r, null, 2)}</pre>
    //     <br />
    //     <p>cat per task</p>
    //     <pre>{JSON.stringify(t, null, 2)}</pre>
    //     <br />
    //   </div>
    // </div>
  );
}
