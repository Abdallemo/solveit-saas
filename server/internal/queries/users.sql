-- name: GetUsers :many
SELECT *
FROM users;

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

-- name: AddSolverToTaskBlockList :one
INSERT INTO blocked_tasks (user_id, task_id, reason)
VALUES ($1, $2, $3) ON CONFLICT (user_id, task_id) DO NOTHING
RETURNING *;
