package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

type APIServer struct {
	addr string
	db   *sql.DB
}

type FileMeta struct {
	FileName        string  `json:"file_name"`
	FileType        string  `json:"file_type"`
	FileSize        float64 `json:"file_size"`
	FilePath        string  `json:"file_path"`
	StorageLocation string  `json:"file_location"`
}

func NewAPIServer(addr string, db *sql.DB) *APIServer {
	return &APIServer{addr: addr, db: db}
}

func (s *APIServer) Run() error {
	router := http.NewServeMux()
	router.HandleFunc("POST /api/v1/media", s.handleUploadMedia)

	log.Printf("Server listening at %s\n", s.addr)
	return http.ListenAndServe(s.addr, router)
}

func (s *APIServer) handleUploadMedia(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) //10 * (2^20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	var uploadedFiles []FileMeta

	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			log.Println("file open error:", err)
			continue
		}

		savePath := filepath.Join("uploaded", fileHeader.Filename)
		dst, err := os.Create(savePath)
		if err != nil {
			log.Println("file create error:", err)
			file.Close()
			continue
		}

		size, err := io.Copy(dst, file)
		if err != nil {
			log.Println("file save error:", err)
		}

		file.Close()
		dst.Close()

		meta := FileMeta{
			FileName:        fileHeader.Filename,
			FileType:        fileHeader.Header.Get("Content-Type"),
			FileSize:        float64(size),
			FilePath:        "/" + savePath,
			StorageLocation: "local",
		}

		log.Printf("Uploaded: %+v\n", meta)
		uploadedFiles = append(uploadedFiles, meta)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(uploadedFiles)
}
