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
  content: z.string().min(4, "Content is too short"),

});

export type TaskSchema = z.infer<typeof taskSchema>;