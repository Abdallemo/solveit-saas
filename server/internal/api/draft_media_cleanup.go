package api

import (
	"context"
	"encoding/json"
	"github/abdallemo/solveit-saas/internal/database"
	"log"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/jackc/pgx/v5/pgtype"
)

func (s *Server) StartDraftMediaCleanupJob(ctx context.Context, timeBetweenChecks time.Duration) {
	ticker := time.NewTicker(timeBetweenChecks)

	log.Println("Starting Background Job for draft task for unused media cleanup")
	for {
		select {
		case <-ctx.Done():
			log.Println("Draft task background checkup shutting down...")
			return
		case <-ticker.C:
			log.Println("Running scheduled draft task media cleanup")
			taskDrafts, err := s.store.GetAllTaskDrafts(ctx, pgtype.Timestamptz{
				Time:  time.Now().Add(-7 * time.Hour * 24),
				Valid: true,
			})
			if err != nil {
				log.Println("error getting draft tasks")
				continue
			}
			wg := &sync.WaitGroup{}

			for _, draftTask := range taskDrafts {
				wg.Add(1)

				go process(wg, s.store, s.s3Client, draftTask)

			}
			wg.Wait()
		}
	}
}

func process(wg *sync.WaitGroup, store *database.Queries, s3client *s3.Client, draftTask database.TaskDraft) {
	defer wg.Done()
	files := []FileMeta{}
	_, err := json.Marshal(draftTask.UploadedFiles)
	if err != nil {
		log.Println("unable to marshel uploadeed Files")
		return
	}
	for _, file := range files {
		_, err = s3client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
			Bucket: aws.String("solveit"),
			Key:    aws.String(file.FilePath),
		})
		if err != nil {
			log.Printf("Error Deleting from S3: %v", err.Error())
			return
		}

	}
	err = store.RemoveFileFromTaskDraft(context.Background(), draftTask.ID)
	if err != nil {
		log.Printf("unable to reset task draft files, %v", err.Error())
	}

}
