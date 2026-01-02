package api

import (
	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/middleware"
	"log"
	"net/http"

	"github.com/google/uuid"
)

// Chat Resource
func (s *Server) handleCreateChat(w http.ResponseWriter, r *http.Request) {
	// parse form
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		sendHTTPError(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	userID, _ := middleware.GetUserID(r.Context())
	files := r.MultipartForm.File["files"]
	message := r.FormValue("message")
	sessionIDStr := r.FormValue("sessionId")
	sentToStr := r.FormValue("sentTo")

	if sessionIDStr == "" || sentToStr == "" {
		sendHTTPError(w, "sessionId and sentTo are required", http.StatusBadRequest)
		return
	}

	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		sendHTTPError(w, "Invalid session ID", http.StatusBadRequest)
		return
	}

	sentTo, err := uuid.Parse(sentToStr)
	if err != nil {
		sendHTTPError(w, "Invalid sentTo ID", http.StatusBadRequest)
		return
	}

	uploadedFiles, _ := s.FileService.ProcessBatchUpload(files, "mentorship", uuid.New())

	chatWithFiles, err := s.ChatService.CreateChatWithFiles(r.Context(),
		message,
		"chat_message",
		sessionID,
		userID,
		sentTo,
		uploadedFiles)

	if err != nil {
		log.Printf("failed to create chat: %v", err)
		sendHTTPError(w, "Failed to create chat", http.StatusInternalServerError)
		return
	}
	s.WebSockets.Chat.SendToUser(chatWithFiles.SessionID, chatWithFiles.SentTo, chatWithFiles)
	s.WebSockets.Chat.SendToUser(chatWithFiles.SessionID, chatWithFiles.SentBy, chatWithFiles)

	WriteJSON(w, chatWithFiles, 201)
}

// Chat Resource
func (s *Server) handleDeleteChat(w http.ResponseWriter, r *http.Request) {

	ChatId := r.PathValue("chatId")
	filePath := r.PathValue("filePath")

	if ChatId == "" {
		http.Error(w, "ChatId is required", http.StatusBadRequest)
	}
	ChatIdUUID, err := uuid.Parse(ChatId)
	if err != nil {
		http.Error(w, "Invalid user ID format", http.StatusBadRequest)
	}

	deletedChat, err := s.ChatService.DeleteChatWithFiles(r.Context(), ChatIdUUID, filePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	s.WebSockets.Chat.SendDeleteToUser(
		deletedChat.SeesionID.String(),
		deletedChat.SentTo.String(),
		struct {
			database.DeleteChatWithFilesRow
			MessageType string `json:"messageType"`
		}{
			DeleteChatWithFilesRow: deletedChat,
			MessageType:            "chat_deleted",
		},
	)

	s.WebSockets.Chat.SendDeleteToUser(
		deletedChat.SeesionID.String(),
		deletedChat.SentTo.String(),
		struct {
			database.DeleteChatWithFilesRow
			MessageType string `json:"messageType"`
		}{
			DeleteChatWithFilesRow: deletedChat,
			MessageType:            "chat_deleted",
		},
	)
	s.WebSockets.Chat.SendDeleteToUser(
		deletedChat.SeesionID.String(),
		deletedChat.SentBy.String(),
		struct {
			database.DeleteChatWithFilesRow
			MessageType string `json:"messageType"`
		}{
			DeleteChatWithFilesRow: deletedChat,
			MessageType:            "chat_deleted",
		},
	)

	w.WriteHeader(http.StatusOK)

}
