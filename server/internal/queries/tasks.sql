-- name: GetAvailbleTasks :many
SELECT *
FROM tasks
WHERE task_status = 'ASSIGNED'
  OR task_status = 'IN_PROGRESS'
  AND assigned_at IS NOT NULL
LIMIT $1;

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

-- name: GetTaskCategories :many
SELECT name
FROM task_categories;