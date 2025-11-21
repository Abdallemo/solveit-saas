package worker

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github/abdallemo/solveit-saas/internal/api"
	"github/abdallemo/solveit-saas/internal/database"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (w *Worker) StartDraftMediaCleanupJob(ctx context.Context, timeBetweenChecks time.Duration) {
	ticker := time.NewTicker(timeBetweenChecks)
	defer ticker.Stop()
	log.Println("Starting Background Job for draft task for unused media cleanup")
	for {
		select {
		case <-ctx.Done():
			log.Println("Draft task background checkup shutting down...")
			return
		case <-ticker.C:
			log.Println("Running scheduled draft task media cleanup")
			taskDrafts, err := w.store.GetAllTaskDrafts(ctx, time.Now().Add(-7*time.Hour*24))
			if err != nil {
				log.Println("error getting draft tasks")
				continue
			}
			wg := &sync.WaitGroup{}

			for _, draftTask := range taskDrafts {
				wg.Add(1)

				go process(wg, w.store, w.s3, draftTask)

			}
			wg.Wait()
		}
	}
}

func process(wg *sync.WaitGroup, store *database.Queries, s3client *s3.Client, draftTask database.TaskDraft) {
	defer wg.Done()
	files := []api.FileMeta{}
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
