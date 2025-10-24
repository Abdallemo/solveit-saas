package websocket

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"slices"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var allowedHost = map[string]bool{
	"http://localhost:3000":          true,
	"https://solveit.up.railway.app": true,
}

const (
	pongWait   = 60 * time.Second    // Time allowed to wait for the next pong from client
	pingPeriod = (pongWait * 9) / 10 // Send pings every 54s (before the read deadline expires)
	writeWait  = 30 * time.Second    // Time allowed to write a message to the client
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1 << 10,
	WriteBufferSize: 1 << 10,
	CheckOrigin: func(r *http.Request) bool {
		//allowedUrl := os.Getenv("NEXTAUTH_URL")
		origin := r.Header.Get("Origin")
		return allowedHost[origin] || os.Getenv("NEXTAUTH_URL") == origin
	},
}

type WsHub struct {
	conns map[string][]*websocket.Conn
	mu    sync.RWMutex
}

func NewHub() *WsHub {
	return &WsHub{
		conns: make(map[string][]*websocket.Conn),
	}
}

func (h *WsHub) handleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("failed to upgrade conn:", err)
		return
	}
	conn.SetReadLimit(5 << 20)
	conn.SetReadDeadline(time.Now().Add(pongWait))
	conn.SetPongHandler(func(string) error {
		conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
	channelID := r.URL.Query().Get("channel")
	if channelID == "" {
		conn.Close()
		return
	}
	h.mu.Lock()
	h.conns[channelID] = append(h.conns[channelID], conn)
	h.mu.Unlock()

	go h.cleanUp(conn, channelID)
	go func() {
		ticker := time.NewTicker(pingPeriod)
		defer ticker.Stop()

		for range ticker.C {
			h.mu.RLock()
			stillActive := slices.Contains(h.conns[channelID], conn)
			h.mu.RUnlock()
			if !stillActive {
				return
			}

			conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := conn.WriteControl(websocket.PingMessage, []byte{}, time.Now().Add(writeWait)); err != nil {
				log.Printf("Ping failed for %s: %v", channelID, err)
				conn.Close()

				// Ensure cleanup runs now
				h.mu.Lock()
				conns := h.conns[channelID]
				active := conns[:0]
				for _, c := range conns {
					if c != conn {
						active = append(active, c)
					}
				}
				h.conns[channelID] = active
				h.mu.Unlock()

				return
			}
		}
	}()

	log.Println("New connection for channel:", channelID)

}
func (h *WsHub) cleanUp(conn *websocket.Conn, channelID string) {
	defer conn.Close()
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			h.mu.Lock()
			conns := h.conns[channelID]
			active := conns[:0]
			for _, c := range conns {
				if c != conn {
					active = append(active, c)
				}
			}
			h.conns[channelID] = active
			h.mu.Unlock()
			break
		}
	}
}

func (h *WsHub) sendToChannel(channelID string, payload any) {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns := h.conns[channelID]
	active := conns[:0]
	for _, conn := range conns {
		if err := conn.WriteJSON(payload); err != nil {
			log.Println("Write error:", err)
			continue
		}
		active = append(active, conn)
	}
	h.conns[channelID] = active
}
func (h *WsHub) sendToChannels(channelIDs []string, payload any) {
	for _, id := range channelIDs {
		h.sendToChannel(id, payload)
	}
}
