import { isAuthorized } from "@/features/auth/server/actions";
import DisplayListComponent from "@/features/tasks/components/DisplayComponent";
import { getAllCategoryMap } from "@/features/tasks/server/data";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ search: string; page: string; status: string }>;
}) {
  const { user } = await isAuthorized(["SOLVER"]);

  const categoryMap = await getAllCategoryMap();
  const limit = 8;

  // for (const task of tasks) {
  //   await handleTaskDeadline(task);
  // }

  return (
    <DisplayListComponent
      title="Assigned Tasks"
      categoryMap={categoryMap}
      filterType="status"
      type="SolverTasks"
      currentUser={user}
      limit={limit}
    />
  );
}
