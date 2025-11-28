package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github/abdallemo/solveit-saas/internal/user"
)

type Comment struct {
	ID        string          `json:"id"`
	Content   string          `json:"content"`
	CreatedAt string          `json:"createdAt"`
	UserID    string          `json:"userId"`
	TaskID    string          `json:"taskId"`
	Owner     user.PublicUser `json:"owner"`
}

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

		s.sendToTask(comment.TaskID, comment)
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

func (s *WsComments) sendToTask(taskID string, comment Comment) {
	s.hub.sendToChannel("comments:"+taskID, comment)
}
