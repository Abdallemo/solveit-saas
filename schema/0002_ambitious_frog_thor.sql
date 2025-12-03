CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text NOT NULL,
	"content" jsonb NOT NULL,
	"category" text NOT NULL,
	"author" uuid NOT NULL,
	"publishedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"readTime" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_source_check";--> statement-breakpoint
ALTER TABLE "mentorship_profiles" ALTER COLUMN "available_times" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "mentorship_profiles" ALTER COLUMN "available_times" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "mentor_session" ALTER COLUMN "time_slot" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "solutions" ALTER COLUMN "content" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "task_drafts" ALTER COLUMN "content" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "task_drafts" ALTER COLUMN "uploadedFiles" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "content" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "user_details" ALTER COLUMN "address" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "user_details" ALTER COLUMN "business" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ALTER COLUMN "content" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_source_check" CHECK ((feedback_type = 'TASK' AND task_id IS NOT NULL AND mentor_booking_id IS NULL) OR
          (feedback_type = 'MENTORING' AND task_id IS NULL AND mentor_booking_id IS NOT NULL));