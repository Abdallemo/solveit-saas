CREATE INDEX "mentorship_chat_files_filePath_idx" ON "mentorship_chat_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "task_files_filePath_idx" ON "task_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "solution_workspace_files_filePath_idx" ON "solution_workspace_files" USING btree ("file_path");