package api

import (
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Server struct {
	addr     string
	hub      *WsHub
	wsNotif  *wsNotification
	wsComm   *wsComments
	s3Client *s3.Client
}

func NewServer(addr string, s3Client *s3.Client) *Server {
	hub := NewHub()

	return &Server{
		addr:     addr,
		hub:      hub,
		wsNotif:  NewWsNotification(hub),
		wsComm:   NewWsComments(hub),
		s3Client: s3Client,
	}
}

func (s *Server) routes() *http.ServeMux {
	mux := http.NewServeMux()

	// WebSocket endpoints
	mux.HandleFunc("GET /api/v1/notification", s.wsNotif.handleNotification)
	mux.HandleFunc("POST /api/v1/send-notification", s.wsNotif.handleSendNotification)

	// comments WebSocket endpoints
	mux.HandleFunc("GET /api/v1/comments", s.wsComm.handleComments)
	mux.HandleFunc("POST /api/v1/send-comment", s.wsComm.handleSendComments)

	// Media upload endpoint
	mux.HandleFunc("POST /api/v1/media", s.handleUploadMedia)
	mux.HandleFunc("DELETE /api/v1/media", s.handleDeleteMedia)
	return mux
}

func (s *Server) Run() error {
	log.Printf("server running on port:%s", s.addr)
	return http.ListenAndServe(s.addr, s.routes())
}
