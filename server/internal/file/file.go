package file

import (
	"context"
	"fmt"
	"io"

	"mime/multipart"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type Service struct {
	s3Client *s3.Client
}

func NewService(s3Client *s3.Client) *Service {
	return &Service{
		s3Client: s3Client,
	}
}

const PublicS3Location = "https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev"

type FailedFileError struct {
	File  FileMeta `json:"file"`
	Error string   `json:"error"`
}
type UploadFileRes struct {
	FailedFiles   []FailedFileError `json:"failed_files"`
	UploadedFiles []FileMeta        `json:"uploaded_files"`
}

type FileMeta struct {
	FileName        string  `json:"fileName"`
	FileType        string  `json:"fileType"`
	FileSize        float64 `json:"fileSize"`
	FilePath        string  `json:"filePath"`
	StorageLocation string  `json:"storageLocation"`
}
type DownloadedFile struct {
	Body          io.ReadCloser
	ContentType   string
	ContentLength int64
}

type FileBatch struct {
	Names     []string
	Types     []string
	Locations []string
	Paths     []string
	Sizes     []int32
}

// Helper
func BuildFileMeta(fh *multipart.FileHeader, key, publicURL string) FileMeta {
	return FileMeta{
		FileName:        fh.Filename,
		FileType:        fh.Header.Get("Content-Type"),
		FileSize:        float64(fh.Size),
		FilePath:        key,
		StorageLocation: publicURL,
	}
}

// NewFileBatch transforms a slice of file metadata into column slices for bulk DB insertion
func NewFileBatch(files []FileMeta) FileBatch {

	n := len(files)
	batch := FileBatch{
		Names:     make([]string, 0, n),
		Types:     make([]string, 0, n),
		Locations: make([]string, 0, n),
		Paths:     make([]string, 0, n),
		Sizes:     make([]int32, 0, n),
	}

	for _, f := range files {
		batch.Names = append(batch.Names, f.FileName)
		batch.Types = append(batch.Types, f.FileType)
		batch.Locations = append(batch.Locations, f.StorageLocation)
		batch.Paths = append(batch.Paths, f.FilePath)
		batch.Sizes = append(batch.Sizes, int32(f.FileSize))
	}

	return batch
}

func (s *Service) DeleteFromS3(filePth string) error {
	_, err := s.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String("solveit"),
		Key:    aws.String(filePth),
	})

	if err != nil {
		//http.Error(w, "Error Deleting from S3: "+err.Error(), http.StatusBadRequest)
		return err
	}
	return nil
}

// GetFile
func (s *Service) GetFile(ctx context.Context, key string) (*DownloadedFile, error) {

	obj, err := s.s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String("solveit"),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}

	contentType := "application/octet-stream"
	if obj.ContentType != nil {
		contentType = *obj.ContentType
	}

	var contentLength int64
	if obj.ContentLength != nil {
		contentLength = *obj.ContentLength
	}

	return &DownloadedFile{
		Body:          obj.Body,
		ContentType:   contentType,
		ContentLength: contentLength,
	}, nil
}

func (s *Service) ProcessBatchUpload(files []*multipart.FileHeader,
	scope string, id uuid.UUID) ([]FileMeta, []FailedFileError) {
	uploaded := []FileMeta{}
	failed := []FailedFileError{}

	for _, fileHeader := range files {
		if err := validateSize(fileHeader); err != nil {
			failed = append(failed, FailedFileError{
				File:  BuildFileMeta(fileHeader, "", ""),
				Error: err.Error(),
			})
			continue
		}

		key, publicURL, err := s.UploadFileToS3(fileHeader, scope, id)
		if err != nil {
			failed = append(failed, FailedFileError{
				File:  BuildFileMeta(fileHeader, "", ""),
				Error: fmt.Sprintf("upload error: %v", err),
			})
			continue
		}

		uploaded = append(uploaded, BuildFileMeta(fileHeader, key, publicURL))
	}

	return uploaded, failed
}

func (s *Service) UploadFileToS3(
	fh *multipart.FileHeader,
	scope string,
	id uuid.UUID,
) (key string, publicURL string, err error) {

	file, err := fh.Open()
	if err != nil {
		return "", "", fmt.Errorf("file open error: %v", err)
	}
	defer file.Close()

	key = fmt.Sprintf("%s/%s-%s", scope, id.String(), fh.Filename)

	_, err = s.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:      aws.String("solveit"),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(fh.Header.Get("Content-Type")),
	})
	if err != nil {
		return "", "", err
	}

	publicURL = fmt.Sprintf("%s/%s", PublicS3Location, key)
	return key, publicURL, nil
}

// Helper
func validateSize(fh *multipart.FileHeader) error {
	if fh.Size >= 50<<20 { // 50MB
		return fmt.Errorf("Exceeded server limit (50MB)")
	}
	return nil
}
