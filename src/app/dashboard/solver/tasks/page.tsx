import { getServerUserSession } from "@/features/auth/server/actions";
import {
  getAllCategoryMap,
  getAllTasksByRolePaginated,
} from "@/features/tasks/server/data";

import DisplayListComponent from "@/features/tasks/components/DisplayComponent";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ search: string; page: string }>;
}) {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();
  const { search, page } = await searchParams;
  const pages = Number.parseInt(page ?? "1");
  const limit = 8;
  const offset = (pages - 1) * limit;

  const { tasks, totalCount } = await getAllTasksByRolePaginated(
    currentUser.id,
    currentUser.role!,
    {
      search: search ?? "",
      limit,
      offset,
    }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevious = pages > 1;
  const hasNext = pages < totalPages;
  return (
    <DisplayListComponent
      title={"Available Tasks"}
      itretable={tasks}
      totalCount={totalCount}
      categoryMap={categoryMap}
      pages={pages}
      totalPages={totalPages}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      filterType="category"
    />
  );
}
