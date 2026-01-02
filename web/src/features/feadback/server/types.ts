import z from "zod";
import { getProductFeedback, getSupportRequest } from "./data";

export const supportSchema = z.object({
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority level"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(150, "Subject must be less than 150 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be less than 2000 characters"),
});

export type SupportFormValues = z.infer<typeof supportSchema>;

export const feedbackSchema = z.object({
  type: z.string().min(1, "Please select a feedback type"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
});

export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export type SupportRequestType = Awaited<
  ReturnType<typeof getSupportRequest>
>[number];
export type ProductFeedbackType = Awaited<
  ReturnType<typeof getProductFeedback>
>[number];
