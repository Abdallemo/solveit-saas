-- name: GetAIRules :many
SELECT rule
FROM ai_rules
WHERE is_active = TRUE
ORDER BY updated_at DESC;

-- name: AddAIFlags :exec
INSERT INTO ai_flags (hashed_content, reason, confidence_score)
VALUES ($1, $2, $3);