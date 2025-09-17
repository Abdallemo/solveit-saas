import { TaskStatusType } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import DisplayListComponent from "@/features/tasks/components/DisplayComponent";
import StripeCheckoutSucessClient from "@/features/tasks/components/stripeCheckoutSucessClient";
import {
  getAllCategoryMap,
  getPosterTasksbyIdPaginated,
} from "@/features/tasks/server/data";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{
    search: string;
    page: string;
    id: string;

    status: string;
  }>;
}) {
  const currentUser = await getServerUserSession();
  if (!currentUser || !currentUser.role || !currentUser.id) return;

  const categoryMap = await getAllCategoryMap();
  const { search, page, id, status } = await searchParams;
  const pages = Number.parseInt(page ?? "1");
  const limit = 8;
  const offset = (pages - 1) * limit;

  const { tasks, totalCount } = await getPosterTasksbyIdPaginated(
    currentUser.id,
    {
      search: search ?? "",
      limit,
      offset,
   
      status: status as TaskStatusType ?? "",
    }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevious = pages > 1;
  const hasNext = pages < totalPages;
  return (
    <>
      {id && <StripeCheckoutSucessClient id={id} />}
      <DisplayListComponent
        categoryMap={categoryMap}
        title="Your Tasks"
        itretable={tasks}
        totalCount={totalCount}
        pages={pages}
        totalPages={totalPages}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        filterType="status"
      />
    </>
  );
}
