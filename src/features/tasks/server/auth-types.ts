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
