package main

import (
	"context"
	"io"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"time"

	"github/abdallemo/solveit-saas/internal/api"
	"github/abdallemo/solveit-saas/internal/worker"

	"github/abdallemo/solveit-saas/internal/database"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/sashabaranov/go-openai"
	"gopkg.in/natefinch/lumberjack.v2"
)

func main() {
	ctx := context.Background()
	logFile := &lumberjack.Logger{
		Filename:   "server.log",
		MaxSize:    10,
		MaxBackups: 3,
		MaxAge:     28,
		Compress:   true,
	}

	multiWriter := io.MultiWriter(os.Stdout, logFile)

	log.SetOutput(multiWriter)
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	log.Println("Go version:", runtime.Version())
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Join(filepath.Dir(b), "..", "..")
	dotenvPath := filepath.Join(basepath, ".env")
	if err := godotenv.Load(dotenvPath); err != nil {
		log.Println("No .env file found, falling back to system env")
	}
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("auto"),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(
				os.Getenv("S3_ACCESS_KEY_ID"),
				os.Getenv("S3_SECRTE_ACCESS_KEY_ID"),
				"",
			),
		),
	)
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	dbURL := os.Getenv("DATABASE_URL")
	db, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal("unable to connect to database:", err)
	}

	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))
	if err != nil {
		log.Fatal("unable to parse redis url")
	}
	redisClient := redis.NewClient(opt)
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal("unable to connect to redis instance")
	}

	defer db.Close()

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("S3_ENDPOINT"))
	})
	openaiClient := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	server := api.NewServer(":3030", s3Client, openaiClient, database.New(db), redisClient, db)

	worker := worker.NewWorker(database.New(db), s3Client, redisClient, server.WsNotif, db)
	go worker.StartDeadlineEnforcerJob(ctx, 10, time.Minute)
	go worker.StartDraftMediaCleanupJob(ctx, time.Hour)
	go worker.StartFileGarbageCollectorJob(ctx, time.Hour*24)

	log.Fatal(server.Run())
}
