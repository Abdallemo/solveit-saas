import TaskPageComps from "@/features/tasks/components/TaskPageComps";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TaskPageComps id={id} />;
}
