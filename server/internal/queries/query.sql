-- name: GetUsers :many
SELECT *
from users;
-- name: GetAIRules :many
SELECT rule
FROM ai_rules
WHERE is_active = TRUE
ORDER BY updated_at DESC;
-- name: GetTaskCategories :many
SELECT name
FROM task_categories;
-- name: GetAvailbleTasks :many
SELECT *
FROM tasks
WHERE task_status = 'ASSIGNED'
  OR task_status = 'IN_PROGRESS'
  AND assigned_at IS NOT NULL
LIMIT $1;
-- name: AddSolverToTaskBlockList :one
INSERT INTO blocked_tasks (user_id, task_id, reason)
VALUES ($1, $2, $3) ON CONFLICT (user_id, task_id) DO NOTHING
RETURNING *;
-- name: ProcessSystemNotification :one
INSERT INTO notifications (
    sender_id,
    receiver_id,
    subject,
    content,
    method,
    read
  )
VALUES ($1, $2, $3, $4, 'SYSTEM', $5)
RETURNING *;
-- name: ResetTaskInfo :exec
UPDATE tasks
SET task_status = 'OPEN',
  assigned_at = NULL,
  updated_at = NOW(),
  solver_id = NULL
WHERE id = $1;
-- name: GetAllTaskDrafts :many
SELECT *
FROM task_drafts
WHERE updated_at < $1
  AND json_array_length("uploadedFiles") > 0;
-- name: RemoveFileFromTaskDraft :exec
UPDATE task_drafts
SET "uploadedFiles" = '[]'
WHERE id = $1;
-- name: AddAIFlags :exec
INSERT INTO ai_flags (hashed_content, reason, confidence_score)
VALUES ($1, $2, $3);

-- name: GetAllTaskFilePaths :many
SELECT file_path FROM task_files;
-- name: GetAllWorkspaceFilePaths :many
SELECT file_path FROM solution_workspace_files;
-- name: GetAllChatFilePaths :many
SELECT file_path FROM mentorship_chat_files;
-- name: GetAllMediaFilePaths :many
SELECT file_path FROM global_media_files;

-- name: RemoveTaskFile :exec
DELETE FROM task_files WHERE file_path = $1;
-- name: RemoveWorkspaceFile :exec
DELETE FROM solution_workspace_files WHERE file_path = $1;
-- name: RemoveChatFile :exec
DELETE FROM mentorship_chat_files WHERE file_path = $1;
-- name: RemoveMediaFile :exec
DELETE FROM global_media_files WHERE file_path = $1;

