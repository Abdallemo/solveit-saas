import { TaskStatusType } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import DisplayListComponent from "@/features/tasks/components/DisplayComponent";
import { handleTaskDeadline } from "@/features/tasks/server/action";
import {
  getAllCategoryMap,
  getAssignedTasksbyIdPaginated,
} from "@/features/tasks/server/data";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ search: string; page: string; status: string }>;
}) {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();
  const { search, page,status } = await searchParams;

  const pages = Number.parseInt(page ?? "1");
  const limit = 8;
  const offset = (pages - 1) * limit;

  const { tasks, totalCount } = await getAssignedTasksbyIdPaginated(
    currentUser.id,
    {
      search:search ?? "",
      limit,
      offset,
      status: status as TaskStatusType ?? "",
    },
    true
  );
  for (const task of tasks) {
    await handleTaskDeadline(task);
  }
  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevious = pages > 1;
  const hasNext = pages < totalPages;
  return (
    <DisplayListComponent
      title="Assigned Tasks"
      itretable={tasks}
      totalCount={totalCount}
      categoryMap={categoryMap}
      pages={pages}
      totalPages={totalPages}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      filterType="status"
    />
  );
}
