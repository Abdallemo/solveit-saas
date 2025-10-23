-- name: GetUsers :many
SELECT *
from users;
-- name: GetAIRules :many
SELECT rule
FROM ai_rules;
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