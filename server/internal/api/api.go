// Package api holds all server settings and endpoint definition
package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/middleware"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sashabaranov/go-openai"
)

type Server struct {
	addr         string
	WebSockets   *websocket.WebSockets
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
	websocket := websocket.NewWebSockets()
	return &Server{
		addr:         addr,
		s3Client:     s3Client,
		openaiClient: openaiClient,
		store:        store,
		redisClient:  redisClient,
		dbConn:       dbConn,
		WebSockets:   websocket,
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

func sendHTTPResp(w http.ResponseWriter, payload any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(payload)
}

func (s *Server) registerWebsocketRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /notification", s.WebSockets.Notif.HandleNotification)
	mux.HandleFunc("GET /comments", s.WebSockets.Comments.HandleComments)
	mux.HandleFunc("GET /mentorship", s.WebSockets.Chat.HandleMentorChats)
	mux.HandleFunc("GET /signaling", s.WebSockets.Signal.HandleSignaling)
}

func (s *Server) registerPublicRoutes(mux *http.ServeMux) {
	s.registerWebsocketRoutes(mux)
	mux.HandleFunc("GET /healthz", s.healthz)
}

func (s *Server) registerSecuredRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /send-notification", s.WebSockets.Notif.HandleSendNotification)
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
	msg := struct {
		Message string `json:"message"`
	}{Message: "alive"}

	sendHTTPResp(w, msg, 200)
}
