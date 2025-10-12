// app/features/tasks/task-form-schema.ts
import { RefundStatusEnumType } from "@/drizzle/schemas";
import { z } from "zod";
import {
  getAllDisputes,
  getAllTaskCatagories,
  getAllTaskDeadlines,
  getAllTasks,
  getAllTasksByRolePaginated,
  getAssignedTasksbyIdPaginated,
  getDraftTask,
  getDraftTaskWithDefualtVal,
  getModeratorDisputes,
  getPosterTasksbyIdPaginated,
  getSolutionById,
  getTasksbyId,
  getTasksbyIdWithFiles,
  getUserDisputes,
  getUserTasksbyId,
  getWorkspaceById,
} from "./data";
export type taskRefundSchemaType = z.infer<typeof taskRefundSchema>;
export type TaskFormValues = z.infer<typeof TaskFormSchema>;
export type WorkpaceSchemType = z.infer<typeof WorkpaceSchem>;
export type TaskSchema = z.infer<typeof taskSchema>;

export type NewtaskDraftType = Exclude<
  Awaited<ReturnType<typeof getDraftTaskWithDefualtVal>>,
  null
>;
export type taskDraftType = Exclude<
  Awaited<ReturnType<typeof getDraftTask>>,
  null
>;
export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;
export type UserDisputeswithTask = Awaited<ReturnType<typeof getUserDisputes>>[number];
export type userTasksType = Awaited<ReturnType<typeof getUserTasksbyId>>;
export type ModDisputeType = Awaited<ReturnType<typeof getModeratorDisputes>>;
export type SolverAssignedTaskType = Awaited<
  ReturnType<typeof getAssignedTasksbyIdPaginated>
>["tasks"][number];
export type PosterTasksFiltred = Awaited<
  ReturnType<typeof getPosterTasksbyIdPaginated>
>["tasks"][number];
export type AllTasksFiltred = Awaited<
  ReturnType<typeof getAllTasksByRolePaginated>
>["tasks"][number];
export type allTasksFiltredType = Awaited<ReturnType<typeof getAllTasks>>;
export type allDisputesType = Awaited<
  ReturnType<typeof getAllDisputes>
>[number];
export type SolutionById = Awaited<ReturnType<typeof getSolutionById>>;
export type WorkpaceSchemReturnedType = Awaited<
  ReturnType<typeof getWorkspaceById>
>;
export type CatagoryType = Exclude<
  Awaited<ReturnType<typeof getAllTaskCatagories>>[number],
  null
>;
export type DeadlineType = Exclude<
  Awaited<ReturnType<typeof getAllTaskDeadlines>>[number],
  null
>;
export type FlatDispute = {
  id: string;
  refundReason: string | null;
  refundedAt: Date | null;
  createdAt: Date | null;
  paymentId: string;
  taskId: string;
  refundStatus: RefundStatusEnumType | null;
  assignedAt: Date | null;
  taskPaymentId: string | null;
  moderatorName: string | null;
  moderatorEmail: string | null;
  taskTitle: string;
  taskPrice: number | null;
  posterName: string | null;
  posterEmail: string | null;
  solverName: string | null;
  solverEmail: string | null;
  solutionContent: string | null;
};
export type TaskReturnType = Awaited<ReturnType<typeof getTasksbyId>>;
export type TaskWithFilesType = Awaited<ReturnType<typeof getTasksbyIdWithFiles>>;
export type assignTaskReturnType = {
  error?:
    | "no such task available"
    | "unable to assign task"
    | "task already assigned to solver";
  success?: "Task successfully assigned to you!";
  newTask: TaskReturnType;
};

export type workspaceFileType = {
  fileName: string;
  uploadedById: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  storageLocation: string;
  workspaceId: string;
  isDraft: boolean;
};
export type SolutionReturnErrorType =
  | "Unable to locate the specified workspace. Please verify the ID and try again."
  | "Submission window has closed. You can no longer publish a solution for this task."
  | "This solution has already been marked as completed. No further submissions are allowed."
  | "This solution has been canceled and cannot be submitted."
  | "Failed to create a solution record. Please try again or contact support if the issue persists."
  | "Solution published successfully!"
  | "An error occurred while attempting to publish the solution. See console for details."
  | "Unable to publish the solution due to an unexpected issue. Please try again later."
  | "Publishing failed due to: [error details]. Please review and retry.";

export const TaskFormSchema = z.object({
  title: z.string().min(1, "Please enter price"),
  description: z.string().min(1, "Please enter price"),
  category: z.string().min(1, "Please select category"),
  content: z.string().min(1, "Please enter price"),
  visibility: z.string().min(1, "Please select visibility"),
  price: z.string().min(1, "Please enter price"),
  deadline: z.string().min(1, "Please select a deadline"),
});
export const taskRefundSchema = z.object({
  reason: z.string().min(10, "please enter a valid reason!"),
});
export const taskSchema = z
  .object({
    deadline: z.string().nonempty("Deadline is required").default("12h"),
    visibility: z.enum(["public", "private"]).default("public"),
    category: z.string().nonempty("Category is required").default(""),
    price: z.coerce.number().min(10, "Minimum price is 10").default(10),
    content: z.string().min(4, "Content is too short").default(""),
    title: z.string().min(4, "title is too short").default(""),
    description: z.string().min(4, "description is too short").default(""),
  })
  .passthrough();
export const WorkpaceSchem = z.object({
  content: z.string().min(10, "Content is too short"),
});
export type Units = "h" | "d" | "w" | "m" | "y";
export type dataOptions = {
  useCache?: boolean;
};
