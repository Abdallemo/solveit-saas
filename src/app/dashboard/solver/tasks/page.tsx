import { isAuthorized } from "@/features/auth/server/actions";
import { getAllCategoryMap } from "@/features/tasks/server/data";

import DisplayListComponent from "@/features/tasks/components/DisplayComponent";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ category: string; search: string; page: string }>;
}) {
  const { user } = await isAuthorized(["SOLVER"]);
  const limit = 8;

  const categoryMap = await getAllCategoryMap();

  return (
    <DisplayListComponent
      title={"Available Tasks"}
      categoryMap={categoryMap}
      filterType="category"
      currentUser={user}
      limit={limit}
      type="AllTasks"
    />
  );
}
