package main

import (
	"context"
	"log"
	"runtime"
	"time"

	"github/abdallemo/solveit-saas/internal/ai"
	"github/abdallemo/solveit-saas/internal/api"
	"github/abdallemo/solveit-saas/internal/cache"
	"github/abdallemo/solveit-saas/internal/chat"
	"github/abdallemo/solveit-saas/internal/editor"
	"github/abdallemo/solveit-saas/internal/file"
	"github/abdallemo/solveit-saas/internal/task"
	"github/abdallemo/solveit-saas/internal/utils"
	"github/abdallemo/solveit-saas/internal/worker"
	"github/abdallemo/solveit-saas/internal/workspace"

	"github/abdallemo/solveit-saas/internal/database"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sashabaranov/go-openai"
)

func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()
	log.Println("Go version:", runtime.Version())

	utils.LoadEnvs()

	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				utils.GetenvWithDefault("S3_ACCESS_KEY_ID", ""),
				utils.GetenvWithDefault("S3_SECRTE_ACCESS_KEY_ID", ""),
				"",
			),
		),
	)
	if err != nil {
		log.Fatalf("failed to S3 load config: %v", err)
	}

	dbURL := utils.GetenvWithDefault("DATABASE_URL", "")
	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal("unable to connect to database:", err)
	}
	defer db.Close()
	store := database.New(db)

	opt, err := redis.ParseURL(utils.GetenvWithDefault("REDIS_URL", ""))
	if err != nil {
		log.Fatal("unable to parse redis url")
	}
	redisClient := redis.NewClient(opt)
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal("unable to connect to redis instance")
	}
	defer redisClient.Close()

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(utils.GetenvWithDefault("S3_ENDPOINT", ""))
	})

	openaiClient := openai.NewClient(utils.GetenvWithDefault("OPENAI_API_KEY", ""))

	fileService := file.NewService(s3Client)
	chatService := chat.NewService(store, db, fileService)
	taskService := task.NewTaskService(store, fileService)
	workspaceService := workspace.NewService(store, fileService)
	cacheService := cache.NewService(redisClient)
	AIService := ai.NewService(openaiClient, store, cacheService)
	editorService := editor.NewService(store, fileService)

	srvCfg := api.NewConfigs(utils.GetenvWithDefault("GO_PORT", ":3030"))

	server := api.NewServer(srvCfg, &api.Services{
		FileService:      fileService,
		ChatService:      chatService,
		TaskService:      taskService,
		AIService:        AIService,
		WorkspaceService: workspaceService,
		EditorService:    editorService,
	})

	worker := worker.NewWorker(database.New(db), s3Client, redisClient, server.WebSockets.Notif, db)
	go worker.StartDeadlineEnforcerJob(ctx, 50, 10*time.Minute)
	go worker.StartDraftMediaCleanupJob(ctx, time.Hour)
	go worker.StartFileGarbageCollectorJob(ctx, time.Hour*24)

	log.Fatal(server.Run())
}
