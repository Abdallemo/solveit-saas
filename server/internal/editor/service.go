package editor

import (
	"context"
	"errors"
	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/file"
	"log"
	"mime/multipart"

	"github.com/google/uuid"
)

type Service struct {
	store       *database.Queries
	fileService *file.Service
}

func NewService(
	store *database.Queries,
	fileService *file.Service,
) *Service {
	return &Service{
		store:       store,
		fileService: fileService,
	}
}

func (s *Service) CreateEditorFiles(ctx context.Context, files []*multipart.FileHeader, scope string) (file.UploadFileRes, error) {
	id := uuid.New()

	uploaded, failed := s.fileService.ProcessBatchUpload(files, scope, id)

	if len(failed) > 0 {
		return file.UploadFileRes{}, errors.New("failed to upload")
	}

	_, err := s.store.CreateEditorFile(ctx, database.CreateEditorFileParams{
		FileName:        uploaded[0].FileName,
		FileType:        uploaded[0].FilePath,
		FilePath:        uploaded[0].FilePath,
		FileSize:        int32(uploaded[0].FileSize),
		StorageLocation: uploaded[0].StorageLocation,
	})
	if err != nil {
		return file.UploadFileRes{}, errors.New("failed to upload")
	}

	return file.UploadFileRes{UploadedFiles: uploaded, FailedFiles: failed}, nil

}

// Editor Resource
func (s *Service) DeleteEditorFile(ctx context.Context, filePath string) error {

	err := s.store.DeleteEditorFile(ctx, filePath)
	if err != nil {
		log.Printf("Error Deleting from S3: %s", err.Error())

		return errors.New("failed to delete")
	}

	err = s.fileService.DeleteFromS3(filePath)
	if err != nil {
		log.Printf("WARNING: DB deleted but S3 failed for %s. Error: %s", filePath, err.Error())
	}

	return nil
}
