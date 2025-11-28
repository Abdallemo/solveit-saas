package websocket

import (
	"encoding/json"
	"log"
	"net/http"
)

type SignalMessage struct {
	From           string          `json:"from"`
	To             string          `json:"to"`
	Type           string          `json:"type"`
	Payload        json.RawMessage `json:"payload"`
	SessionID      string          `json:"sessionId"`
	ConnectionType string          `json:"connectionType"`
}

type WsSignalling struct {
	hub               *WsHub
	signal            []SignalMessage
	signallingChannel chan IncomingMessage
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

func (s *WsSignalling) listenForMessages() {
	for incMsg := range s.signallingChannel {

		msg := SignalMessage{}

		if err := json.Unmarshal(incMsg.Payload, &msg); err != nil {
			log.Printf("Chat Unmarshal Failed: %v", err)
			continue
		}

		s.sendToSignalSession(msg.SessionID, msg)
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

func (s *WsSignalling) sendToSignalSession(signalID string, message SignalMessage) {
	s.hub.sendToChannel("signaling:"+signalID, message)
}
