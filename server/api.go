package main

import (
	"database/sql"
	"encoding/json"
	"io"
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
	return &APIServer{
		addr: addr,
		db:   db,
	}
}

type Media struct{}



func (s *APIServer) Run() error {
	router := http.NewServeMux()
	router.HandleFunc("POST /api/v1/media", uploadMedia)

	return http.ListenAndServe(s.addr, router)
}

func uploadMedia(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "multipart/form-data")
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	uploadedFile := []Media{}
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			continue
		}
		defer file.Close()
		savePath := filepath.Join("uploaded",fileHeader.Filename)

		dst, er := os.Create("./uploaded/" + fileHeader.Filename)
		if er != nil {

		}
		defer dst.Close()
		size, erro:=io.Copy(dst, file)
		if erro != nil{
			continue
		}
		fileMeta := FileMeta{
			FileName: fileHeader.Filename,
			FileType: fileHeader.Header[][],
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Files uploaded successfully",

	})

}
