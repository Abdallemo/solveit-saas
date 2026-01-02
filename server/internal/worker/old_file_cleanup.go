package worker

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func (w *Worker) StartFileGarbageCollectorJob(ctx context.Context, timeBetweenChecks time.Duration) {
	ticker := time.NewTicker(timeBetweenChecks)
	log.Println("Starting Background Job for file garbage collection")
	defer ticker.Stop()
	go w.runCleanup(ctx)
	for {
		select {
		case <-ctx.Done():
			log.Println("File garbage collection shutting down...")
			return
		case <-ticker.C:
			go w.runCleanup(ctx)
		}
	}
}

func (w *Worker) runCleanup(ctx context.Context) {
	if !w.mu.TryLock() {
		log.Println("Skipping scheduled garbage collection. Previous run is still active.")
		return
	}
	defer w.mu.Unlock()

	wg := &sync.WaitGroup{}
	wg.Add(2)

	go func() {
		defer wg.Done()
		w.deleteUnreferencedS3Files(ctx)
	}()

	go func() {
		defer wg.Done()
		w.removeMissingS3FileRecords(ctx)
	}()

	wg.Wait()
	log.Println("Garbage collection cycle finished.")
}

func (w *Worker) deleteUnreferencedS3Files(ctx context.Context) {
	log.Println("Starting S3 Unreferenced file cleanup")

	s3Files := map[string]struct{}{}
	paginator := s3.NewListObjectsV2Paginator(w.s3, &s3.ListObjectsV2Input{
		Bucket: aws.String("solveit"),
		Prefix: aws.String(""),
	})

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(ctx)
		if err != nil {
			log.Printf("Error listing S3 objects: %v", err)
			return
		}
		for _, obj := range page.Contents {
			s3Files[*obj.Key] = struct{}{}
		}
	}

	dbFiles := map[string]struct{}{}
	tables := []func(ctx context.Context) ([]string, error){
		w.store.GetAllTaskFilePaths,
		w.store.GetAllWorkspaceFilePaths,
		w.store.GetAllChatFilePaths,
		w.store.GetAllMediaFilePaths,
	}
	for _, fetch := range tables {
		paths, err := fetch(ctx)
		if err != nil {
			log.Printf("Error fetching DB file paths: %v", err)
			continue
		}
		for _, p := range paths {
			dbFiles[p] = struct{}{}
		}
	}
	deletedCount := 0
	for key := range s3Files {
		if _, exists := dbFiles[key]; !exists {
			_, err := w.s3.DeleteObject(ctx, &s3.DeleteObjectInput{
				Bucket: aws.String("solveit"),
				Key:    aws.String(key),
			})
			if err != nil {
				log.Printf("Failed to delete Unreferenced S3 file %s: %v", key, err)
			} else {
				log.Printf("Deleted Unreferenced S3 file: %s", key)
				deletedCount++
			}
		}
	}
	log.Printf("S3 Unreferenced file cleanup completed. Scanned %d S3 files, deleted %d Unreferenced.",
		len(s3Files),
		deletedCount)
}

func (w *Worker) removeMissingS3FileRecords(ctx context.Context) {
	log.Println("Starting DB Missing S3 file cleanup")

	tables := []struct {
		name   string
		fetch  func(ctx context.Context) ([]string, error)
		delete func(ctx context.Context, filePath string) error
	}{
		{"TaskFiles", w.store.GetAllTaskFilePaths, w.store.DeleteTaskFileByPath},
		{"WorkspaceFiles", w.store.GetAllWorkspaceFilePaths, w.store.DeleteWorkspaceFileByPath},
		{"ChatFiles", w.store.GetAllChatFilePaths, w.store.DeleteChatFileByPath},
		{"EditorFiles", w.store.GetAllMediaFilePaths, w.store.DeleteEditorFile},
	}
	for _, table := range tables {
		deleteCount := 0
		paths, err := table.fetch(ctx)
		if err != nil {
			log.Printf("Failed to fetch %s: %v", table.name, err)
			continue
		}

		for _, filePath := range paths {
			_, err := w.s3.HeadObject(ctx, &s3.HeadObjectInput{
				Bucket: aws.String("solveit"),
				Key:    aws.String(filePath),
			})
			if err != nil {
				log.Printf("File missing in S3, deleting DB record: %s", filePath)
				err = table.delete(ctx, filePath)
				if err != nil {
					log.Printf("Failed to delete DB record %s: %v", filePath, err)
				} else {
					deleteCount++
				}

			}
		}
		log.Printf("totoal found %d deleted %d", len(paths), deleteCount)

	}
}
