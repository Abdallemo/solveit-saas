package api

import (
	"fmt"
	"github/abdallemo/solveit-saas/internal/middleware"
	"log"
	"net/http"

	"github.com/google/uuid"
)

func (s *Server) handleCreateWorkspaceFiles(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		sendHTTPError(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	files := r.MultipartForm.File["files"]
	userID, _ := middleware.GetUserID(r.Context())
	workspaceID, err := uuid.Parse(r.PathValue("workspaceId"))

	if err != nil {
		sendHTTPError(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	uploaded, failed, err := s.WorkspaceService.CreateFiles(r.Context(), workspaceID, userID, files)

	if err != nil {
		log.Printf("Workspace upload error: %v", err)
		sendHTTPError(w, "Failed to save files", http.StatusInternalServerError)
		return
	}

	WriteJSON(w, uploadResp{UploadedFiles: uploaded, FailedFiles: failed}, 200)
}

func (s *Server) handleDeleteWorkspaceFiles(w http.ResponseWriter, r *http.Request) {

	filePath := r.PathValue("filePath")

	if filePath == "" {
		http.Error(w, "file path is required", http.StatusBadRequest)
	}

	workspaceID, err := uuid.Parse(r.PathValue("workspaceId"))

	if err != nil {
		sendHTTPError(w, "Invalid ID", http.StatusBadRequest)
		return
	}
	err = s.WorkspaceService.DeleteWorkspaceFiles(r.Context(), filePath, workspaceID)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "Item successfully deleted based on key: "+filePath)
}
