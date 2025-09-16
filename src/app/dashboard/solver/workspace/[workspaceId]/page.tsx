import { isAuthorized } from "@/features/auth/server/actions";
import WorkspacePageComp from "@/features/tasks/components/WorkspacePageComp";
import { Suspense } from "react";
import WorksapceSkeleton from "./loading";
export default async function Page() {
  await isAuthorized(["SOLVER"]);
  return (
    <Suspense fallback={<WorksapceSkeleton />}>
      <WorkspacePageComp />
    </Suspense>
  );
}
