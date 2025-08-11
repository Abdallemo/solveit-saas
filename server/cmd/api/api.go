package main

import (
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Server struct {
	addr string
	// db       *sql.DB //dont need it now
	ws       *wsNotification
	s3Client *s3.Client //
}

func NewServer(addr string, s3Client *s3.Client) *Server {
	return &Server{
		addr: addr,
		ws:   NewWsNotification(),
		// db:   db,
		s3Client: s3Client,
	}
}

func (s *Server) routes() *http.ServeMux {
	mux := http.NewServeMux()

	// WebSocket endpoints
	mux.HandleFunc("/ws/notification", s.ws.handleNotification)
	mux.HandleFunc("POST /api/v1/send-notification", s.ws.handleSendNotification)

	// Media upload endpoint
	mux.HandleFunc("POST /api/v1/media", s.handleUploadMedia)
	mux.HandleFunc("DELETE /api/v1/media", s.handleDeleteMedia)
	return mux
}

func (s *Server) Run() error {
	log.Printf("server running on port:%s", s.addr)
	return http.ListenAndServe(s.addr, s.routes())
}
