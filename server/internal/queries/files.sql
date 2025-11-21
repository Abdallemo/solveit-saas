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
