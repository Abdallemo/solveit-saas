package api

import (
	"encoding/json"
	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/middleware"
	"log"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sashabaranov/go-openai"
)

type Server struct {
	addr         string
	hub          *websocket.WsHub
	WsNotif      *websocket.WsNotification
	wsComm       *websocket.WsComments
	wsSig        *websocket.WsSignalling
	wsChat       *websocket.WsMentorChat
	s3Client     *s3.Client
	openaiClient *openai.Client
	store        *database.Queries
	redisClient  *redis.Client
	dbConn       *pgxpool.Pool
}

func NewServer(
	addr string, s3Client *s3.Client,
	openaiClient *openai.Client,
	store *database.Queries,
	redisClient *redis.Client,
	dbConn *pgxpool.Pool,

) *Server {
	hub := websocket.NewHub()

	return &Server{
		addr:         addr,
		hub:          hub,
		WsNotif:      websocket.NewWsNotification(hub),
		wsComm:       websocket.NewWsComments(hub),
		wsChat:       websocket.NewMentorChat(hub),
		wsSig:        websocket.NewWsWsSignalling(hub),
		s3Client:     s3Client,
		openaiClient: openaiClient,
		store:        store,
		redisClient:  redisClient,
		dbConn:       dbConn,
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

func sendHttpResp(w http.ResponseWriter, payload any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(payload)
}
func (s *Server) registerPublicRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /notification", s.WsNotif.HandleNotification)
	mux.HandleFunc("GET /comments", s.wsComm.HandleComments)
	mux.HandleFunc("GET /mentorship", s.wsChat.HandleMentorChats)
	mux.HandleFunc("GET /signaling", s.wsSig.HandleSignaling)
	mux.HandleFunc("GET /healthz", s.healthz)
}

func (s *Server) registerSecuredRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /send-notification", s.WsNotif.HandleSendNotification)
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
func (s *Server) healthz(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	msg := struct {
		Message string `json:"message"`
	}{Message: "alive"}

	json.NewEncoder(w).Encode(msg)

}
