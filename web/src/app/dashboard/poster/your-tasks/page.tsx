import { isAuthorized } from "@/features/auth/server/actions";
import DisplayListComponent from "@/features/tasks/components/DisplayComponent";
import StripeCheckoutSucessClient from "@/features/tasks/components/stripeCheckoutSucessClient";
import { getAllCategoryMap, getDraftTask } from "@/features/tasks/server/data";

export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{
    id: string;
  }>;
}) {
  const { session } = await isAuthorized(["POSTER"]);
  const { id } = await searchParams;
  let publishedSuccessfully = false;

  if (id && session?.user) {
    const draftTask = await getDraftTask(session.user.id, id);
    publishedSuccessfully = !draftTask;
  }

  const categoryMap = await getAllCategoryMap();
  const limit = 8;

  return (
    <>
      {id && (
        <StripeCheckoutSucessClient
          publishedSuccessfully={publishedSuccessfully}
        />
      )}
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
