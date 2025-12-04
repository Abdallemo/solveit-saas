import { isAuthorized } from "@/features/auth/server/actions";
import DisplayListComponent from "@/features/tasks/components/DisplayComponent";
import StripeCheckoutSucessClient from "@/features/tasks/components/stripeCheckoutSucessClient";
import { getAllCategoryMap } from "@/features/tasks/server/data";

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
  const { session } = await isAuthorized(["POSTER"]);
  const { id } = await searchParams;
  const categoryMap = await getAllCategoryMap();
  const limit = 8;

  return (
    <>
      {id && <StripeCheckoutSucessClient id={id} />}
      <DisplayListComponent
        categoryMap={categoryMap}
        title="Your Tasks"
        filterType="status"
        type="PosterTasks"
        currentUser={session?.user}
        limit={limit}
      />
    </>
  );
}
