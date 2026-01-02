package api

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
)

type DeleteKey struct {
	Key string `json:"key"`
}
type JSONError struct {
	Message string `json:"message"`
}

// All Resources
func (s *Server) handleGetFiles(w http.ResponseWriter, r *http.Request) {
	filePath := r.PathValue("filePath")
	respType := r.URL.Query().Get("type")

	if filePath == "" {
		http.Error(w, "Missing File Id", http.StatusBadRequest)
		return
	}

	if respType == "presigned" {
		res, err := s.FileService.GetPresignedURL(r.Context(), filePath)
		log.Println("requested presigned ur")
		if err != nil {
			http.Error(w, "Error generating link", http.StatusInternalServerError)
			return
		}
		WriteJSON(w, res, http.StatusOK)
		return
	}

	fileData, err := s.FileService.GetFile(r.Context(), filePath)
	if err != nil {

		http.Error(w, fmt.Sprintf("error fetching file: %v", err), http.StatusInternalServerError)
		return
	}

	defer fileData.Body.Close()

	disposition := "inline"
	if respType == "download" {
		disposition = "attachment"
	}

	filename := filepath.Base(filePath)
	contentDisposition := fmt.Sprintf("%s; filename=\"%s\"", disposition, filename)

	w.Header().Set("Content-Type", fileData.ContentType)
	w.Header().Set("Content-Length", strconv.FormatInt(fileData.ContentLength, 10))
	w.Header().Set("Content-Disposition", contentDisposition)

	if _, err := io.Copy(w, fileData.Body); err != nil {
		fmt.Printf("Stream error for %s: %v\n", filePath, err)
	}
}
