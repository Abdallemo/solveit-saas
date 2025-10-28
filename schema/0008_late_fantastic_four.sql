ALTER TABLE "solution_workspaces" DROP CONSTRAINT "solution_workspaces_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "mentorship_chats" ADD COLUMN "sent_to" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "mentorship_chats" ADD CONSTRAINT "mentorship_chats_sent_to_users_id_fk" FOREIGN KEY ("sent_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ADD CONSTRAINT "solution_workspaces_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;