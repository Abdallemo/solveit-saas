package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github/abdallemo/solveit-saas/internal/user"
)

type ChatFile struct {
	ID              string  `json:"id"`
	FileName        string  `json:"fileName"`
	FileType        string  `json:"fileType"`
	FileSize        float64 `json:"fileSize"`
	StorageLocation string  `json:"storageLocation"`
	FilePath        string  `json:"filePath"`
	UploadedAt      string  `json:"uploadedAt"`
	UploadedByID    string  `json:"uploadedById"`
	ChatID          string  `json:"chatId"`
	Status          string  `json:"status"`
}

type Chat struct {
	ID          string          `json:"id"`
	SessionID   string          `json:"sessionId"`
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
	hub               *WsHub
	chats             []Chat
	mentorChatChannel chan IncomingMessage
}

func NewMentorChat(hub *WsHub) *WsMentorChat {
	s := &WsMentorChat{
		hub:               hub,
		chats:             make([]Chat, 0, 1<<10),
		mentorChatChannel: make(chan IncomingMessage, 100),
	}
	go s.listenForMessages()
	return s
}

func (s *WsMentorChat) listenForMessages() {
	for incMsg := range s.mentorChatChannel {

		var chat Chat
		if err := json.Unmarshal(incMsg.Payload, &chat); err != nil {
			log.Printf("Chat Unmarshal Failed: %v", err)
			continue
		}
		s.sendToUser(chat.SessionID, chat.SentTo, chat)
	}
}

func (s *WsMentorChat) HandleMentorChats(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, "Missing session_id", http.StatusBadRequest)
		return
	}
	q := r.URL.Query()
	q.Set("channel", "chat:"+sessionID)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r, s.mentorChatChannel)
}

func (s *WsMentorChat) HandleSendMentorChats(w http.ResponseWriter, r *http.Request) {
	msg := Chat{}
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	chat := Chat{
		ID:          msg.ID,
		SessionID:   msg.SessionID,
		SentBy:      msg.SentBy,
		SentTo:      msg.SentTo,
		Message:     msg.Message,
		CreatedAt:   msg.CreatedAt,
		ReadAt:      msg.ReadAt,
		ChatFile:    msg.ChatFile,
		ChatOwner:   msg.ChatOwner,
		MessageType: msg.MessageType,
	}

	s.sendToUser(msg.SessionID, msg.SentTo, chat)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *WsMentorChat) sendToUser(sessionID, sentTo string, msg Chat) {
	s.hub.sendToChannel(fmt.Sprintf("chat:%s:%s", sessionID, sentTo), msg)
}
