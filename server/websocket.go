package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1 << 10,
	WriteBufferSize: 1 << 10,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	ID         int    `json:"id"`
	Content    string `json:"content"`
	ReceiverId string `json:"receiverId"`
	SenderId   string `json:"senderId"`
	Subject    string `json:"subject"`
	Method     string `json:"method"`
	Read       bool   `json:"read"`
	CreatedAt  string `json:"createdAt"`
}
type wsNotification struct {
	conns    map[string][]*websocket.Conn
	messages []Message
	mu       sync.RWMutex
}

func NewWsNotification() *wsNotification {
	return &wsNotification{
		conns:    make(map[string][]*websocket.Conn),
		messages: make([]Message, 0, 1<<10),
	}
}

func (s *wsNotification) handleNotification(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("faield to upgrade conn")
		return
	}
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		conn.Close()
		return
	}
	s.mu.Lock()
	s.conns[userID] = append(s.conns[userID], conn)
	s.mu.Unlock()

	fmt.Println("new Connection from client:", conn.RemoteAddr())
	for usrid := range s.conns {
		fmt.Println("current Active Users", usrid)
	}

}

func (s *wsNotification) sendToUser(userID string, msg Message) {
	s.mu.Lock()
	defer s.mu.Unlock()
	conns := s.conns[userID]
	activeConns := conns[:0]
	for _, conn := range conns {
		if err := conn.WriteJSON(msg); err != nil {
			log.Println("Write error:", err)
			conn.Close()
			continue
		}
		activeConns = append(activeConns, conn)
	}
	s.conns[userID] = activeConns
}
func (s *wsNotification) handleSendNotification(w http.ResponseWriter, r *http.Request) {
	msg := Message{}
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		fmt.Println("err decoding,", err)
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	notification := Message{
		ID:        msg.ID,
		Content:   msg.Content,
		SenderId:  msg.SenderId,
		Subject:   msg.Subject,
		Method:    msg.Method,
		Read:      msg.Read,
		CreatedAt: msg.CreatedAt,
	}
	s.sendToUser(msg.ReceiverId, notification)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Notification sent"))
}

func (s *wsNotification) run() error {
	Mux := http.NewServeMux()
	Mux.HandleFunc("/api/v1/notification", s.handleNotification)
	Mux.HandleFunc("POST /api/v1/send-notification", s.handleSendNotification)
	return http.ListenAndServe(":3030", Mux)
}
