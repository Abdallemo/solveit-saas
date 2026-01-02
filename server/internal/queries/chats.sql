-- name: CreateChatFiles :exec
INSERT INTO mentorship_chat_files (
chat_id,
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


-- name: CreateChat :one
INSERT INTO mentorship_chats (
seesion_id,
message,
sent_by,
sent_to,
pending
)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetChatWithFilesByID :one
SELECT
  c.id,
  c.created_at,
  c.seesion_id,
  c.message,
  c.sent_by,
  c.sent_to,
  c.read_at,
  c.pending,
  c.is_deleted,

  (
    json_build_object(
      'id', u.id,
      'name', u.name,
      'role', u.role,
      'image', u.image,
      'email', u.email
    )
  )::jsonb AS chat_owner,

  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', f.id,
          'fileName', f.file_name,
          'fileType', f.file_type,
          'fileSize', f.file_size,
          'filePath', f.file_path,
          'uploadedAt', f.uploaded_at,
          'uploadedById', f.uploaded_by_id,
          'chatId', f.chat_id
        )
      )
      FROM mentorship_chat_files f
      WHERE f.chat_id = c.id
    ),
    '[]'::jsonb
  )::jsonb AS chat_files

FROM mentorship_chats c
JOIN users u ON u.id = c.sent_by
WHERE c.id = $1
ORDER BY c.created_at ASC;

-- name: DeleteChatFileByPath :exec
DELETE FROM mentorship_chat_files WHERE file_path = $1;

-- name: DeleteChatWithFiles :one
WITH params AS (
    SELECT sqlc.arg(chat_id)::uuid AS target_chat_id, sqlc.arg(file_path)::text AS target_file_path
),
deleted_file_action AS (
    UPDATE mentorship_chat_files
    SET is_deleted = true
    WHERE chat_id = (SELECT target_chat_id FROM params)
      AND file_path = (SELECT target_file_path FROM params)
    RETURNING file_path
),
remaining_files_check AS (
    SELECT COUNT(*) as count
    FROM mentorship_chat_files
    WHERE chat_id = (SELECT target_chat_id FROM params)
      AND is_deleted = false
      AND file_path != (SELECT target_file_path FROM params)
),
updated_chat_action AS (

    UPDATE mentorship_chats
    SET is_deleted = CASE
        WHEN (SELECT count FROM remaining_files_check) = 0
        THEN true
        ELSE is_deleted
    END
    WHERE id = (SELECT target_chat_id FROM params)
    RETURNING id, created_at, seesion_id, message, sent_by, sent_to, is_deleted
)

SELECT
    c.id,
    c.created_at,
    c.seesion_id,
    c.message,
    c.sent_by,
    c.sent_to,
    c.is_deleted,
    (
        SELECT COALESCE(array_agg(f.file_path), ARRAY[]::text[])
        FROM deleted_file_action f
    )::text[] AS deleted_file_paths
FROM updated_chat_action c;
