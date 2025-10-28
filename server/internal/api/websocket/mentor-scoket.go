package websocket

import (
	"encoding/json"
	"fmt"
	"github/abdallemo/solveit-saas/internal/user"
	"net/http"
)

type ChatFile struct {
	ID              string  `json:"id"`
	FileName        string  `json:"fileName"`
	FileType        string  `json:"fileType"`
	FileSize        float64 `json:"fileSize"`
	StorageLocation string  `json:"storageLocation"`
	FilePath        string  `json:"filePath"`
	UploadedAt      string  `json:"uploadedAt"`
	UploadedById    string  `json:"uploadedById"`
	ChatId          string  `json:"chatId"`
	Status          string  `json:"status"`
}

type Chat struct {
	ID          string          `json:"id"`
	SessionId   string          `json:"sessionId"`
	SentBy      string          `json:"sentBy"`
	SentTo      string          `json:"sentTo"`
	Message     string          `json:"message"`
	CreatedAt   string          `json:"createdAt"`
	ReadAt      string          `json:"readAt"`
	ChatFile    []ChatFile      `json:"chatFiles"`
	ChatOwner   user.PublicUser `json:"chatOwner"`
	MessageType string          `json:"messageType"`
}
type WsMentorChat struct {
	hub   *WsHub
	chats []Chat
}

func NewMentorChat(hub *WsHub) *WsMentorChat {
	return &WsMentorChat{
		hub:   hub,
		chats: make([]Chat, 0, 1<<10),
	}
}
func (s *WsMentorChat) HandleMentorChats(w http.ResponseWriter, r *http.Request) {
	sessionId := r.URL.Query().Get("session_id")
	if sessionId == "" {
		http.Error(w, "Missing session_id", http.StatusBadRequest)
		return
	}
	q := r.URL.Query()
	q.Set("channel", "chat:"+sessionId)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r)
}
func (s *WsMentorChat) HandleSendMentorChats(w http.ResponseWriter, r *http.Request) {

	msg := Chat{}
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	chat := Chat{
		ID:          msg.ID,
		SessionId:   msg.SessionId,
		SentBy:      msg.SentBy,
		SentTo:      msg.SentTo,
		Message:     msg.Message,
		CreatedAt:   msg.CreatedAt,
		ReadAt:      msg.ReadAt,
		ChatFile:    msg.ChatFile,
		ChatOwner:   msg.ChatOwner,
		MessageType: msg.MessageType,
	}

	s.sendToUser(msg.SessionId, msg.SentTo, chat)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *WsMentorChat) sendToUser(sessionId, sentTo string, msg Chat) {
	s.hub.sendToChannel(fmt.Sprintf("chat:%s:%s", sessionId, sentTo), msg)

}
