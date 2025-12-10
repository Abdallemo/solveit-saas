-- name: GetAvailbleTasks :many
SELECT *
FROM tasks
WHERE (task_status = 'ASSIGNED'
  OR task_status = 'IN_PROGRESS')
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
-- name: SaveDraftTaskFiles :exec
UPDATE task_drafts
SET "uploadedFiles" = COALESCE("uploadedFiles", '[]'::jsonb) || $1::jsonb
WHERE user_id = $2;
-- name: SaveFileToWorkspaceDB :exec
INSERT INTO solution_workspace_files (
workspace_id,
uploaded_by_id,
file_name,
file_type,
file_size,
file_location,
file_path)
SELECT
  $1,
  $2,
  unnest($3::text[]),
  unnest($4::text[]),
  unnest($5::int[]),
  unnest($6::text[]),
  unnest($7::text[])
;
