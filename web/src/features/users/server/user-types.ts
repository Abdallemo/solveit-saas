import { UserDetails, UserRoleType, UserTable } from "@/drizzle/schemas";
import { MIN_CONTENT_LENGTH } from "@/features/tasks/server/task-types";
import { auth } from "@/lib/auth";
import { calculateEditorTextLength } from "@/lib/utils/utils";
import { JSONContent } from "@tiptap/react";
import { InferInsertModel } from "drizzle-orm";
import z from "zod";
import { getAllOwnerBlog, getBlogBySlug } from "./actions";
export type UserRole = UserRoleType;

function createSelection<T extends Record<string, true>>(selection: T): T {
  return selection;
}

export type User = Omit<
  (typeof auth.$Infer.Session)["user"],
  "role" | "metadata"
> & {
  role: UserRole;
  metadata: UserMetadata;
};
export type Session = Omit<typeof auth.$Infer.Session, "user"> & {
  user: User;
};
export type publicUserType = {
  id: string;
  name: string | null;
  role: UserRole | null;
  image: string | null;
  email: string | null;
};
export const publicUserColumns = createSelection({
  id: true,
  email: true,
  name: true,
  image: true,
  role: true,
  emailVerified: true,
});

export type OnboardingFormData = {
  first_name: string;
  last_name: string;
  dob: Date | undefined;
  address: Address;
  business_profile: Business;
};

export type Address = {
  line1: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
};
export type Business = {
  mcc?: string;
};

export type PartialUserTableColumns = Partial<
  InferInsertModel<typeof UserTable>
>;
export type PartialUserDetailsTableColumns = Partial<
  InferInsertModel<typeof UserDetails>
>;
export type UserDetailsTableColumns = InferInsertModel<typeof UserDetails>;

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt is too long"),
  content: z
    .unknown()
    .refine(
      (val) => {
        const content = val as JSONContent;
        const textLength = calculateEditorTextLength(content);
        return textLength >= MIN_CONTENT_LENGTH;
      },
      {
        message: `Task content is too short. Please provide at least ${MIN_CONTENT_LENGTH} characters.`,
      },
    )
    .transform((val) => val as JSONContent),
  category: z.string().min(1, "Category is required"),
  readTime: z.coerce.number().min(1, "Read time must be at least 1 minute"),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;
export type BlogsWithUser = Awaited<ReturnType<typeof getAllOwnerBlog>>;

export type UserMetadata = {
  stripeAccountLinked?: boolean;
  onboardingCompleted?: boolean;
  agreedOnTerms?: boolean;
};
export const defaultUserMetadata: UserMetadata = {
  agreedOnTerms: false,
  onboardingCompleted: false,
  stripeAccountLinked: false,
};
export type BlogType = Exclude<Awaited<ReturnType<typeof getBlogBySlug>>, null>;
