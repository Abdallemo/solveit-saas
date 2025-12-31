package cache

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

type Service struct {
	redisClient *redis.Client
}

func NewService(redisClient *redis.Client) *Service {
	return &Service{
		redisClient: redisClient,
	}
}

func (s *Service) GetCachedValue(ctx context.Context, key string, result any) bool {
	cachedResult, err := s.redisClient.Get(ctx, key).Result()

	if err == nil {
		if err := json.Unmarshal([]byte(cachedResult), result); err != nil {
			log.Printf("Failed to unmarshal cached JSON for key %s: %v", key, err)
			return false
		}
		return true
	} else if err != redis.Nil {
		log.Println("Redis GET error:", err)
	}

	return false
}

func (s *Service) SetCachedValue(ctx context.Context, key string, value any, expiration time.Duration) {

	jsonResponse, err := json.Marshal(value)
	if err != nil {
		log.Println("Failed to marshal JSON for Redis:", err)
		return
	}

	if err := s.redisClient.Set(ctx, key, jsonResponse, expiration).Err(); err != nil {
		log.Println("Failed to set cache in Redis:", err)
	}
}
