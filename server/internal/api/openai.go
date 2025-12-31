package api

import (
	"encoding/json"
	"net/http"
)

type ReqContent struct {
	Content string `json:"content"`
}

func (s *Server) hanleOpenAi(w http.ResponseWriter, r *http.Request) {
	var input ReqContent
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	ctx := r.Context()
	scope := r.URL.Query().Get("scope")

	switch scope {
	case "moderation":
		res, err := s.AIService.CheckModeration(ctx, input.Content)
		if err != nil {
			http.Error(w, "AI Moderation failed", http.StatusInternalServerError)
			return
		}
		WriteJSON(w, res, http.StatusOK)

	case "autosuggestion":
		res, err := s.AIService.GetTaskSuggestion(ctx, input.Content)
		if err != nil {
			http.Error(w, "AI Suggestion failed", http.StatusInternalServerError)
			return
		}
		WriteJSON(w, res, http.StatusOK)

	case "autosuggestion_blog":
		res, err := s.AIService.GetBlogSuggestion(ctx, input.Content)
		if err != nil {
			http.Error(w, "AI Blog Suggestion failed", http.StatusInternalServerError)
			return
		}

		WriteJSON(w, res, http.StatusOK)

	default:
		http.Error(w, "Invalid parameter: task not recognized", http.StatusBadRequest)
	}
}
