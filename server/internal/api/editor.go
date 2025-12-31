package api

import (
	"fmt"
	"net/http"
)

// Editor Resoucre
func (s *Server) handleCreateEditorFiles(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		sendHTTPError(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	files := r.MultipartForm.File["files"]

	status := http.StatusOK
	UploadFileRes, err := s.EditorService.CreateEditorFiles(r.Context(), files, "editor-images")
	if err != nil {
		status = http.StatusInternalServerError
	}

	WriteJSON(w, UploadFileRes, status)
}

// Editor Resource
func (s *Server) handleDeleteEditorFile(w http.ResponseWriter, r *http.Request) {

	filePath := r.PathValue("filePath")
	if filePath == "" {
		http.Error(w, "file path is required", http.StatusBadRequest)
	}
	err := s.EditorService.DeleteEditorFile(r.Context(), filePath)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Item successfully deleted based on key: "+filePath)
}
