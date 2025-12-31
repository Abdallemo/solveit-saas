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

-- name: DeleteDraftTaskFile :exec
WITH definition AS (
  SELECT
    sqlc.arg(file_path)::text as target_path ,
    sqlc.arg(user_id)::uuid as target_user_id
)
UPDATE task_drafts
SET "uploadedFiles" = (
  SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
  FROM jsonb_array_elements("uploadedFiles") AS elem
  WHERE elem->>'filePath' <> (SELECT target_path FROM definition)
)
WHERE user_id = (SELECT target_user_id FROM definition);
