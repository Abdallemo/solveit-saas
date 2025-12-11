import { CommentProvider } from "@/contexts/TaskCommentProvider";
import { isAuthorized } from "@/features/auth/server/actions";
import SolutionPageComps from "@/features/tasks/components/solutionPageComps";
import {
  getSolutionById,
  isFeedbackSubmited,
} from "@/features/tasks/server/data";

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ solutionId: string }>;
}) {
  const { solutionId } = await params;
  const solution = await getSolutionById(solutionId);
  const { session, user } = await isAuthorized(["POSTER"]);
  const isFeedbackSumbited = await isFeedbackSubmited(solution.taskId);
  return (
    <CommentProvider
      taskComments={solution.taskSolution.taskComments}
      taskId={solution.taskId}
      userId={session?.user.id}
    >
      <SolutionPageComps
        solution={solution}
        user={user}
        isFeedbackSumbited={isFeedbackSumbited}
      />
    </CommentProvider>
  );
}
