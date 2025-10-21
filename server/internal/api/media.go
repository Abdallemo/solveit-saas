package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
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
type DeleteKey struct {
	Key string `json:"key"`
}
type JSONError struct {
	Message string `json:"message"`
}

func sendHttpError(w http.ResponseWriter, message string, statusCode int) {
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
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		sendHttpError(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	scope := r.FormValue("scope")
	var uploadedFiles []FileMeta
	id := uuid.New()
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if fileHeader.Size >= 200<<20 {
			log.Println(fileHeader.Size)
			sendHttpError(w, "exeded server limit", http.StatusBadRequest)
			return
		}
		if err != nil {
			log.Println("file open error:", err)
			continue
		}
		defer file.Close()
		fileBytes, err := io.ReadAll(file)
		if err != nil {
			log.Println("file read error:", err)
			continue
		}

		key := fmt.Sprintf("%s/%s-%s", scope, id.String(), fileHeader.Filename)

		_, err = s.s3Client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String("solveit"),
			Key:         aws.String(key),
			Body:        bytes.NewReader(fileBytes),
			ContentType: aws.String(fileHeader.Header.Get("Content-Type")),
		})
		if err != nil {
			log.Println("upload error:", err)
			continue
		}

		publicURL := fmt.Sprintf("https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev/solveit/%s", key)

		uploadedFiles = append(uploadedFiles, FileMeta{
			FileName:        fileHeader.Filename,
			FileType:        fileHeader.Header.Get("Content-Type"),
			FileSize:        float64(len(fileBytes)),
			FilePath:        key,
			StorageLocation: publicURL,
		})

	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(uploadedFiles)
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
