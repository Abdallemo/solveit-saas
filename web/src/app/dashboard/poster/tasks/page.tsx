import { isAuthorized } from "@/features/auth/server/actions";
import { getAllCategoryMap } from "@/features/tasks/server/data";

import DisplayListComponent from "@/features/tasks/components/DisplayComponent";

export default async function Page({}: {}) {
  const { session } = await isAuthorized(["POSTER"]);

  const categoryMap = await getAllCategoryMap();
  const limit = 8;
  return (
    <DisplayListComponent
      title={"Public Tasks"}
      categoryMap={categoryMap}
      filterType="category"
      currentUser={session?.user}
      limit={limit}
      type="AllTasks"
    />
  );
}
