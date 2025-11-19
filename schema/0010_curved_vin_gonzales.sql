CREATE TYPE "public"."file_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_location" text NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "refunds" DROP CONSTRAINT "refunds_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "refunds" ALTER COLUMN "task_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "solution_workspace_files" ADD COLUMN "status" "file_status" DEFAULT 'PENDING';--> statement-breakpoint
CREATE INDEX "media_files_filePath_idx" ON "media_files" USING btree ("file_path");--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;