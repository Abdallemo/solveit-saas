ALTER TABLE "solutions" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "task_drafts" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "task_drafts" ALTER COLUMN "content" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ALTER COLUMN "content" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ALTER COLUMN "content" SET DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "solution_workspaces" ADD COLUMN "contentText" text DEFAULT '' NOT NULL;