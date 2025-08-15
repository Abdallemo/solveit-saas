package api

import (
	"github/abdallemo/solveit-saas/internal/middleware"
	"github/abdallemo/solveit-saas/internal/storage"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/sashabaranov/go-openai"
)

type Server struct {
	addr         string
	hub          *WsHub
	wsNotif      *wsNotification
	wsComm       *wsComments
	s3Client     *s3.Client
	openaiClient *openai.Client
	store        storage.Storage
}

func NewServer(addr string, s3Client *s3.Client, openaiClient *openai.Client, store storage.Storage) *Server {
	hub := NewHub()

	return &Server{
		addr:         addr,
		hub:          hub,
		wsNotif:      NewWsNotification(hub),
		wsComm:       NewWsComments(hub),
		s3Client:     s3Client,
		openaiClient: openaiClient,
		store:        store,
	}
}

func (s *Server) routes() *http.ServeMux {
	mux := http.NewServeMux()

	s.registerPublicRoutes(mux)

	securedMux := http.NewServeMux()
	s.registerSecuredRoutes(securedMux)

	authStack := middleware.CreateStack(middleware.IsAuthorized)
	mux.Handle("/", authStack(securedMux))

	return mux
}

func (s *Server) registerPublicRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/v1/notification", s.wsNotif.handleNotification)
	mux.HandleFunc("GET /api/v1/comments", s.wsComm.handleComments)
}

func (s *Server) registerSecuredRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/v1/media", s.handleUploadMedia)
	mux.HandleFunc("DELETE /api/v1/media", s.handleDeleteMedia)
	mux.HandleFunc("POST /api/v1/send-notification", s.wsNotif.handleSendNotification)
	mux.HandleFunc("POST /api/v1/send-comment", s.wsComm.handleSendComments)
	mux.HandleFunc("GET /api/v1/openai", s.hanleOpenAi)
}

func (s *Server) Run() error {
	log.Printf("server running on port:%s", s.addr)
	return http.ListenAndServe(s.addr, s.routes())
}
