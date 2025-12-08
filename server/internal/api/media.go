package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type FileMeta struct {
	FileName        string  `json:"fileName"`
	FileType        string  `json:"fileType"`
	FileSize        float64 `json:"fileSize"`
	FilePath        string  `json:"filePath"`
	StorageLocation string  `json:"storageLocation"`
}

const PublicS3Location = "https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev"

type DeleteKey struct {
	Key string `json:"key"`
}
type JSONError struct {
	Message string `json:"message"`
}
type failedFileError struct {
	File  FileMeta `json:"file"`
	Error string   `json:"error"`
}
type uploadResp struct {
	FailedFiles   []failedFileError `json:"failed_files"`
	UploadedFiles []FileMeta        `json:"uploaded_files"`
}

func sendHTTPError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(JSONError{Message: message})
}

func (s *Server) handleDeleteMedia(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()
	deletePayload := DeleteKey{}
	err = json.Unmarshal(body, &deletePayload)
	if err != nil {
		http.Error(w, "Error unmarshaling JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	_, err = s.s3Client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String("solveit"),
		Key:    aws.String(deletePayload.Key),
	})
	if err != nil {
		http.Error(w, "Error Deleting from S3: "+err.Error(), http.StatusBadRequest)
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Item successfully deleted based on key: "+deletePayload.Key)
}

func (s *Server) handleUploadMedia(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		sendHTTPError(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	scope := r.FormValue("scope")
	id := uuid.New()

	uploaded := []FileMeta{}
	failed := []failedFileError{}

	for _, fileHeader := range files {
		if err := validateSize(fileHeader); err != nil {
			failed = append(failed, failedFileError{
				File:  buildFileMeta(fileHeader, "", ""),
				Error: err.Error(),
			})
			continue
		}

		key, publicURL, err := s.uploadFileToS3(fileHeader, scope, id)
		if err != nil {
			failed = append(failed, failedFileError{
				File:  buildFileMeta(fileHeader, "", ""),
				Error: fmt.Sprintf("upload error: %v", err),
			})
			continue
		}

		uploaded = append(uploaded, buildFileMeta(fileHeader, key, publicURL))
	}

	status := http.StatusOK
	if len(failed) > 0 {
		status = http.StatusMultiStatus
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(uploadResp{UploadedFiles: uploaded, FailedFiles: failed})
}

func validateSize(fh *multipart.FileHeader) error {
	if fh.Size >= 50<<20 { // 50MB
		return fmt.Errorf("Exceeded server limit (50MB)")
	}
	return nil
}
func (s *Server) uploadFileToS3(
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

func buildFileMeta(fh *multipart.FileHeader, key, publicURL string) FileMeta {
	return FileMeta{
		FileName:        fh.Filename,
		FileType:        fh.Header.Get("Content-Type"),
		FileSize:        float64(fh.Size),
		FilePath:        key,
		StorageLocation: publicURL,
	}
}

func (s *Server) handleMediaDownload(w http.ResponseWriter, r *http.Request) {
	Key := r.URL.Query().Get("key")
	if Key == "" {
		http.Error(w, "Missing key", http.StatusBadRequest)
		return
	}

	obj, err := s.s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String("solveit"),
		Key:    aws.String(Key),
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("error fetching object: %v", err), http.StatusInternalServerError)
		return
	}
	defer obj.Body.Close()

	key := Key
	slashIdx := strings.LastIndex(key, "/")
	fileName := key
	if slashIdx != -1 {
		fileName = key[slashIdx+1:]
	}
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", fileName))
	w.Header().Set("Content-Type", "application/octet-stream")

	io.Copy(w, obj.Body)
}

func (s *Server) handleMedia(w http.ResponseWriter, r *http.Request) {
	Key := r.URL.Query().Get("key")
	if Key == "" {
		http.Error(w, "Missing key", http.StatusBadRequest)
		return
	}
	obj, err := s.s3Client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String("solveit"),
		Key:    aws.String(Key),
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("error fetching object: %v", err), http.StatusInternalServerError)
		return
	}
	defer obj.Body.Close()

	contentType := "application/octet-stream"
	if obj.ContentType != nil {
		contentType = *obj.ContentType
	}

	filename := filepath.Base(Key)

	contentDisposition := fmt.Sprintf("attachment; filename=\"%s\"", filename)
	if obj.ContentDisposition != nil {
		contentDisposition = *obj.ContentDisposition
	}
	if obj.ContentLength != nil {
		w.Header().Set("Content-Length", strconv.FormatInt(*obj.ContentLength, 10))
	}
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Content-Disposition", contentDisposition)
	_, err = io.Copy(w, obj.Body)
	if err != nil {
		fmt.Printf("Error during streaming: %v\n", err)
	}
}
