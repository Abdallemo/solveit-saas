// Package worker defines all background job and cron jobs for the server
package worker

import (
	"sync"

	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/database"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Worker struct {
	store   *database.Queries
	s3      *s3.Client
	redis   *redis.Client
	wsNotif *websocket.WsNotification
	dbConn  *pgxpool.Pool
	mu      sync.RWMutex
}

func NewWorker(store *database.Queries, s3 *s3.Client, redis *redis.Client, wsNotif *websocket.WsNotification, dbConn *pgxpool.Pool) *Worker {
	return &Worker{store: store, s3: s3, redis: redis, wsNotif: wsNotif, dbConn: dbConn}
}
