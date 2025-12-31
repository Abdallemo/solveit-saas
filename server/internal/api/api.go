// Package api holds all server settings and endpoint definition
package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github/abdallemo/solveit-saas/internal/ai"
	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/chat"
	"github/abdallemo/solveit-saas/internal/editor"
	"github/abdallemo/solveit-saas/internal/file"
	"github/abdallemo/solveit-saas/internal/middleware"
	"github/abdallemo/solveit-saas/internal/task"
	"github/abdallemo/solveit-saas/internal/utils"
	"github/abdallemo/solveit-saas/internal/workspace"
)

type Services struct {
	FileService      *file.Service
	ChatService      *chat.Service
	TaskService      *task.Service
	AIService        *ai.Service
	WorkspaceService *workspace.Service
	EditorService    *editor.Service
}

type Configs struct {
	addr string
}

func NewConfigs(addr string) *Configs {
	return &Configs{
		addr: addr,
	}
}

type Server struct {
	configs *Configs
	*Services
	WebSockets *websocket.WebSockets

	middleware *middleware.Middleware
}

func NewServer(
	configs *Configs,
	services *Services,
) *Server {
	websocket := websocket.NewWebSockets()

	jwksUrl := utils.GetenvWithDefault("BETTER_AUTH_JWKS_URL",
		"http://localhost:3000/api/auth/jwks")
	allowedOrigins := []string{utils.GetenvWithDefault(
		"BETTER_AUTH_URL",
		"http://localhost:3000")}

	md, err := middleware.NewMiddleware(jwksUrl, allowedOrigins)
	if err != nil {
		log.Fatalf("failed to init middleware: %v", err)
	}
	return &Server{
		configs:    configs,
		WebSockets: websocket,
		middleware: md,
		Services:   services,
	}
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()

	apiMux := http.NewServeMux()

	s.registerPublicRoutes(apiMux)

	securedMux := http.NewServeMux()
	s.registerSecuredRoutes(securedMux)

	authStack := s.middleware.CreateStack(s.middleware.IsAuthorized)

	apiMux.Handle("/", authStack(securedMux))

	mux.Handle("/api/v1/", http.StripPrefix("/api/v1", apiMux))

	globalStack := s.middleware.CreateStack(s.middleware.CORS(), middleware.Logging)
	return globalStack(mux)
}

func WriteJSON(w http.ResponseWriter, payload any, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("json encode error: %v", err)
	}
}
func sendHTTPError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(JSONError{Message: message})
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

	mux.HandleFunc("GET /media/{filePath}", s.handleGetFiles) //done

	mux.HandleFunc("POST /tasks/draft/files", s.handleCreateDraftTaskFiles)             //done
	mux.HandleFunc("DELETE /tasks/draft/files/{filePath}", s.handleDeleteDraftTaskFile) //yet

	mux.HandleFunc("POST /editor/files", s.handleCreateEditorFiles)
	mux.HandleFunc("DELETE /editor/files/{filePath}", s.handleDeleteEditorFile)

	mux.HandleFunc("POST /chats", s.handleCreateChat)
	mux.HandleFunc("DELETE /chats/{chatId}/{filePath}", s.handleDeleteChat)

	mux.HandleFunc("POST /workspaces/{workspaceId}/files", s.handleCreateWorkspaceFiles)              //done
	mux.HandleFunc("DELETE /workspaces/{workspaceId}/files/{filePath}", s.handleDeleteWorkspaceFiles) //yet

	mux.HandleFunc("POST /openai", s.hanleOpenAi)
}

func (s *Server) Run() error {
	log.Printf("server running on port:%s", s.configs.addr)
	return http.ListenAndServe(s.configs.addr, s.routes())
}

func (s *Server) healthz(w http.ResponseWriter, r *http.Request) {
	msg := struct {
		Message string `json:"message"`
	}{Message: "alive"}

	WriteJSON(w, &msg, 200)
}
