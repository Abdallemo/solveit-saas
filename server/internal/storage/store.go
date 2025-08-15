package storage

import "context"

type Storage interface {
	GetAIRules(ctx context.Context) ([]string, error)
}
