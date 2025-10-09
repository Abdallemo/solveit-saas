package websocket

import (
	"encoding/json"
	"github/abdallemo/solveit-saas/internal/user"
	"net/http"
)

type Message struct {
	ID         string `json:"id"`
	Content    string `json:"content"`
	ReceiverId string `json:"receiverId"`
	SenderId   string `json:"senderId"`
	Subject    string `json:"subject"`
	Method     string `json:"method"`
	Read       bool   `json:"read"`
	CreatedAt  string `json:"createdAt"`
}

type Comment struct {
	ID        string          `json:"id"`
	Content   string          `json:"content"`
	CreatedAt string          `json:"createdAt"`
	UserId    string          `json:"userId"`
	TaskId    string          `json:"taskId"`
	Owner     user.PublicUser `json:"owner"`
}
type SignalMessage struct {
	From           string          `json:"from"`
	To             string          `json:"to"`
	Type           string          `json:"type"`
	Payload        json.RawMessage `json:"payload"`
	SessionId      string          `json:"sessionId"`
	ConnectionType string          `json:"connectionType"`
}

type WsNotification struct {
	hub      *WsHub
	messages []Message
}
type WsSignalling struct {
	hub    *WsHub
	signal []SignalMessage
}

func NewWsNotification(hub *WsHub) *WsNotification {
	return &WsNotification{
		hub:      hub,
		messages: make([]Message, 0, 1<<10),
	}
}
func NewWsWsSignalling(hub *WsHub) *WsSignalling {
	return &WsSignalling{
		hub:    hub,
		signal: make([]SignalMessage, 0, 1<<10),
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

	s.hub.handleWS(w, r)
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
		ReceiverId: msg.ReceiverId,
		SenderId:   msg.SenderId,
		Subject:    msg.Subject,
		Method:     msg.Method,
		Read:       msg.Read,
		CreatedAt:  msg.CreatedAt,
	}

	s.sendToUser(msg.ReceiverId, notification)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *WsNotification) sendToUser(userID string, msg Message) {
	s.hub.sendToChannel("notif:"+userID, msg)
}

// -------------------- Comments WS --------------------

type WsComments struct {
	hub     *WsHub
	comment []Comment
}

func NewWsComments(hub *WsHub) *WsComments {
	return &WsComments{
		hub:     hub,
		comment: make([]Comment, 0, 1<<10),
	}
}

func (s *WsComments) HandleComments(w http.ResponseWriter, r *http.Request) {
	taskID := r.URL.Query().Get("task_id")
	if taskID == "" {
		http.Error(w, "Missing task_id", http.StatusBadRequest)
		return
	}

	q := r.URL.Query()
	q.Set("channel", "comments:"+taskID)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r)
}

func (s *WsComments) HandleSendComments(w http.ResponseWriter, r *http.Request) {
	comment := Comment{}
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	s.sendToTask(comment.TaskId, comment)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Comment sent"))
}

func (s *WsComments) sendToTask(taskID string, comment Comment) {
	s.hub.sendToChannel("comments:"+taskID, comment)
}

// -------------------- WebRTC Signalling WS --------------------
func (s *WsSignalling) HandleSignaling(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, "Missing session_id", http.StatusBadRequest)
		return
	}

	q := r.URL.Query()
	q.Set("channel", "signaling:"+sessionID)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r)
}
func (s *WsSignalling) HandleSendSignalingMessage(w http.ResponseWriter, r *http.Request) {
	var msg SignalMessage
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	s.sendToSignalSession(msg.SessionId, msg)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Signal sent"))
}
func (s *WsSignalling) sendToSignalSession(signalId string, message SignalMessage) {
	s.hub.sendToChannel("signaling:"+signalId, message)
}
