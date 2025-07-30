// app/features/tasks/task-form-schema.ts
import { z } from 'zod'

export const TaskFormSchema = z.object({
  title: z.string().min(1, 'Please enter price'),
  description: z.string().min(1, 'Please enter price'),
  category: z.string().min(1, 'Please select category'),
  content: z.string().min(1, 'Please enter price'),
  visibility: z.string().min(1, 'Please select visibility'),
  price: z.string().min(1, 'Please enter price'),
  deadline: z.string().min(1, 'Please select a deadline'),

})

export type TaskFormValues = z.infer<typeof TaskFormSchema>

export const taskSchema = z.object({
  deadline: z.string().nonempty("Deadline is required"),
  visibility: z.enum(["public", "private"]),
  category: z.string().nonempty("Category is required"),
  price: z.coerce.number().min(10, "Minimum price is 10"),
  content: z.string().min(4, "Content is too short"),
  title: z.string().min(4, "title is too short"),
  description: z.string().min(4, "description is too short"),
});
export const WorkpaceSchem = z.object({
  content: z.string().min(10, "Content is too short"),

});
export type WorkpaceSchemType = z.infer<typeof WorkpaceSchem>;

export type TaskSchema = z.infer<typeof taskSchema>;


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

