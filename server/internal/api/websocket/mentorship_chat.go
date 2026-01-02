package websocket

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github/abdallemo/solveit-saas/internal/chat"
)

type WsMentorChat struct {
	hub               *WsHub
	chats             []chat.ChatWithFiles
	mentorChatChannel chan IncomingMessage
}

func NewMentorChat(hub *WsHub) *WsMentorChat {
	s := &WsMentorChat{
		hub:               hub,
		chats:             make([]chat.ChatWithFiles, 0, 1<<10),
		mentorChatChannel: make(chan IncomingMessage, 100),
	}
	go s.listenForMessages()
	return s
}

func (s *WsMentorChat) listenForMessages() {
	for incMsg := range s.mentorChatChannel {

		var chat chat.ChatWithFiles
		if err := json.Unmarshal(incMsg.Payload, &chat); err != nil {
			log.Printf("Chat Unmarshal Failed: %v", err)
			continue
		}
		s.SendToUser(chat.SessionID, chat.SentTo, chat)
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

func (s *WsMentorChat) SendToUser(sessionID, sentTo string, msg chat.ChatWithFiles) {
	s.hub.sendToChannel(fmt.Sprintf("chat:%s:%s", sessionID, sentTo), msg)
}

func (s *WsMentorChat) SendDeleteToUser(sessionID, sentTo string, msg any) {
	s.hub.sendToChannel(fmt.Sprintf("chat:%s:%s", sessionID, sentTo), msg)
}
