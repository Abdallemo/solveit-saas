package websocket

import (
	"encoding/json"
	"net/http"
)

type Message struct {
	ID         string `json:"id"`
	Content    string `json:"content"`
	ReceiverID string `json:"receiverId"`
	SenderID   string `json:"senderId"`
	Subject    string `json:"subject"`
	Method     string `json:"method"`
	Read       bool   `json:"read"`
	CreatedAt  string `json:"createdAt"`
}

type WsNotification struct {
	hub                 *WsHub
	messages            []Message
	notificationChannel chan IncomingMessage
}

func NewWsNotification(hub *WsHub) *WsNotification {
	return &WsNotification{
		hub:                 hub,
		messages:            make([]Message, 0, 1<<10),
		notificationChannel: make(chan IncomingMessage, 100),
	}
}

func (s *WsNotification) HandleNotification(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "Missing user_id", http.StatusBadRequest)
		return
	}

	q := r.URL.Query()
	q.Set("channel", "notif:"+userID)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r, s.notificationChannel)
}

func (s *WsNotification) HandleSendNotification(w http.ResponseWriter, r *http.Request) {
	msg := Message{}
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	notification := Message{
		ID:         msg.ID,
		Content:    msg.Content,
		ReceiverID: msg.ReceiverID,
		SenderID:   msg.SenderID,
		Subject:    msg.Subject,
		Method:     msg.Method,
		Read:       msg.Read,
		CreatedAt:  msg.CreatedAt,
	}

	s.SendToUser(msg.ReceiverID, notification)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *WsNotification) SendToUser(userID string, msg Message) {
	s.hub.sendToChannel("notif:"+userID, msg)
}
