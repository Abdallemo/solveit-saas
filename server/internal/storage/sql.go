package storage

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgressStore struct {
	db *pgxpool.Pool
}

func NewSPostgressStore(db *pgxpool.Pool) *PostgressStore {
	return &PostgressStore{db: db}
}

type AIRule struct {
	ID        int
	RuleList  []string
	CreatedAt time.Time
}

func (s *PostgressStore) GetAIRules(ctx context.Context) ([]string, error) {
	rows, err := s.db.Query(ctx, "SELECT rule FROM ai_rules")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var allRules []string
	for rows.Next() {
		var r string
		if err := rows.Scan(&r); err != nil {
			return nil, err
		}
		allRules = append(allRules, r)
	}

	return allRules, rows.Err()
}
