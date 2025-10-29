import { CommentProvider } from "@/contexts/TaskCommentProvider";
import { isAuthorized } from "@/features/auth/server/actions";
import SolutionPageComps from "@/features/tasks/components/solutionPageComps";
import { getSolutionById } from "@/features/tasks/server/data";

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ solutionId: string }>;
}) {
  const { solutionId } = await params;
  const solution = await getSolutionById(solutionId);
  const { user } = await isAuthorized(["POSTER"]);
  return (
    <CommentProvider
      taskComments={solution.taskSolution.taskComments}
      taskId={solution.taskId}
      userId={user.id}>
      <SolutionPageComps solution={solution} />
    </CommentProvider>
  );
}
