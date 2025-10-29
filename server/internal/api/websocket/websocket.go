package websocket

import (
	"encoding/json"
	"github/abdallemo/solveit-saas/internal/user"
	"log"
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
	hub                 *WsHub
	messages            []Message
	notificationChannel chan IncomingMessage
}
type WsSignalling struct {
	hub               *WsHub
	signal            []SignalMessage
	signallingChannel chan IncomingMessage
}

func NewWsNotification(hub *WsHub) *WsNotification {
	return &WsNotification{
		hub:                 hub,
		messages:            make([]Message, 0, 1<<10),
		notificationChannel: make(chan IncomingMessage, 100),
	}
}
func NewWsWsSignalling(hub *WsHub) *WsSignalling {
	s := &WsSignalling{
		hub:               hub,
		signal:            make([]SignalMessage, 0, 1<<10),
		signallingChannel: make(chan IncomingMessage, 100),
	}
	go s.listenForMessages()
	return s
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
		ReceiverId: msg.ReceiverId,
		SenderId:   msg.SenderId,
		Subject:    msg.Subject,
		Method:     msg.Method,
		Read:       msg.Read,
		CreatedAt:  msg.CreatedAt,
	}

	s.SendToUser(msg.ReceiverId, notification)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *WsNotification) SendToUser(userID string, msg Message) {
	s.hub.sendToChannel("notif:"+userID, msg)
}

// -------------------- Comments WS --------------------

type WsComments struct {
	hub             *WsHub
	comment         []Comment
	commentsChannel chan IncomingMessage
}

func NewWsComments(hub *WsHub) *WsComments {
	s := &WsComments{
		hub:             hub,
		comment:         make([]Comment, 0, 1<<10),
		commentsChannel: make(chan IncomingMessage, 100),
	}
	go s.listenForMessages()
	return s
}

func (s *WsComments) listenForMessages() {

	for incMsg := range s.commentsChannel {

		comment := Comment{}

		if err := json.Unmarshal(incMsg.Payload, &comment); err != nil {
			log.Printf("Chat Unmarshal Failed: %v", err)
			continue
		}

		s.sendToTask(comment.TaskId, comment)
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

	s.hub.handleWS(w, r, s.commentsChannel)
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
func (s *WsSignalling) listenForMessages() {

	for incMsg := range s.signallingChannel {

		msg := SignalMessage{}

		if err := json.Unmarshal(incMsg.Payload, &msg); err != nil {
			log.Printf("Chat Unmarshal Failed: %v", err)
			continue
		}

		s.sendToSignalSession(msg.SessionId, msg)
	}
}
func (s *WsSignalling) HandleSignaling(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, "Missing session_id", http.StatusBadRequest)
		return
	}

	q := r.URL.Query()
	q.Set("channel", "signaling:"+sessionID)
	r.URL.RawQuery = q.Encode()

	s.hub.handleWS(w, r, s.signallingChannel)
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
