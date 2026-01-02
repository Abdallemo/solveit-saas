-- name: GetAllTaskFilePaths :many
SELECT file_path FROM task_files;
-- name: GetAllWorkspaceFilePaths :many
SELECT file_path FROM solution_workspace_files;
-- name: GetAllChatFilePaths :many
SELECT file_path FROM mentorship_chat_files;
-- name: GetAllMediaFilePaths :many
SELECT file_path FROM editor_files;

-- name: CreateEditorFile :one
INSERT INTO editor_files (
  file_name, file_type, file_size, file_path
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: CreateWorkspaceFiles :exec
INSERT INTO solution_workspace_files (
workspace_id,
uploaded_by_id,
file_name,
file_type,
file_size,
file_path)
SELECT
  $1,
  $2,
  unnest(sqlc.arg(file_name)::text[]),
  unnest(sqlc.arg(file_type)::text[]),
  unnest(sqlc.arg(file_size)::int[]),
  unnest(sqlc.arg(file_path)::text[]);


-- name: DeleteTaskFileByPath :exec
DELETE FROM task_files WHERE file_path = $1;
-- name: DeleteWorkspaceFileByPath :exec
DELETE FROM solution_workspace_files WHERE file_path = $1 ;

-- name: DeleteEditorFile :exec
DELETE FROM editor_files WHERE file_path = $1;



-- name: DeleteWorkspaceFile :exec
DELETE FROM solution_workspace_files WHERE file_path = $1 AND workspace_id = $2;
