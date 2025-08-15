package main

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github/abdallemo/solveit-saas/internal/api"
	"github/abdallemo/solveit-saas/internal/storage"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/sashabaranov/go-openai"
)

func main() {
	log.Println("Go version:", runtime.Version())
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Join(filepath.Dir(b), "..", "..")
	dotenvPath := filepath.Join(basepath, ".env")
	if err := godotenv.Load(dotenvPath); err != nil {
		log.Println("No .env file found, falling back to system env")
	}
	cfg, err := config.LoadDefaultConfig(context.Background(),
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
	dbUrl := os.Getenv("DATABASE_URL")
	db, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatal("unable to connect to database:", err)
	}
	defer db.Close()
	store := storage.NewSPostgressStore(db)

	s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(os.Getenv("S3_ENDPOINT"))
	})
	openaiClient := openai.NewClient(os.Getenv("OPENAI_API_KEY"))
	server := api.NewServer(":3030", s3Client, openaiClient, store)
	log.Fatal(server.Run())
}
