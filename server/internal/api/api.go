package api

import (
	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/middleware"
	"github/abdallemo/solveit-saas/internal/storage"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/sashabaranov/go-openai"
)

type Server struct {
	addr         string
	hub          *websocket.WsHub
	wsNotif      *websocket.WsNotification
	wsComm       *websocket.WsComments
	wsSig        *websocket.WsSignalling
	wsChat       *websocket.WsMentorChat
	s3Client     *s3.Client
	openaiClient *openai.Client
	store        storage.Storage
	redisClient  *redis.Client
}

func NewServer(addr string, s3Client *s3.Client,
	openaiClient *openai.Client,
	store storage.Storage,
	redisClient *redis.Client) *Server {
	hub := websocket.NewHub()

	return &Server{
		addr:         addr,
		hub:          hub,
		wsNotif:      websocket.NewWsNotification(hub),
		wsComm:       websocket.NewWsComments(hub),
		wsChat:       websocket.NewMentorChat(hub),
		wsSig:        websocket.NewWsWsSignalling(hub),
		s3Client:     s3Client,
		openaiClient: openaiClient,
		store:        store,
		redisClient:  redisClient,
	}
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()

	apiMux := http.NewServeMux()

	s.registerPublicRoutes(apiMux)

	securedMux := http.NewServeMux()
	s.registerSecuredRoutes(securedMux)
	authStack := middleware.CreateStack(middleware.IsAuthorized)

	apiMux.Handle("/", authStack(securedMux))

	mux.Handle("/api/v1/", http.StripPrefix("/api/v1", apiMux))

	globalStack := middleware.CreateStack(middleware.Logging)
	return globalStack(mux)

}

func (s *Server) registerPublicRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /notification", s.wsNotif.HandleNotification)
	mux.HandleFunc("GET /comments", s.wsComm.HandleComments)
	mux.HandleFunc("GET /mentorship", s.wsChat.HandleMentorChats)
	mux.HandleFunc("GET /signaling", s.wsSig.HandleSignaling)
}

func (s *Server) registerSecuredRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /send-notification", s.wsNotif.HandleSendNotification)
	mux.HandleFunc("POST /send-comment", s.wsComm.HandleSendComments)
	mux.HandleFunc("POST /send-mentorshipChats", s.wsChat.HandleSendMentorChats)
	mux.HandleFunc("POST /send-signal", s.wsSig.HandleSendSignalingMessage)
	mux.HandleFunc("POST /media", s.handleUploadMedia)
	mux.HandleFunc("DELETE /media", s.handleDeleteMedia)
	mux.HandleFunc("GET /media/download", s.handleMediaDownload)
	mux.HandleFunc("GET /media", s.handleMedia)
	mux.HandleFunc("POST /openai", s.hanleOpenAi)
}

func (s *Server) Run() error {
	log.Printf("server running on port:%s", s.addr)
	return http.ListenAndServe(s.addr, s.routes())
}
