package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github/abdallemo/solveit-saas/internal/utils"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/sashabaranov/go-openai"
)

type ReqContent struct {
	Content string `json:"content"`
}

const (
	SystemRule           = "You are an AI task assistant. Always output JSON. \n"
	ModerationPrompt     = "Check the input against these rules:\n[%s]\nRespond with 'violatesRules': true/false"
	AutoSuggestionPrompt = `Given content and category list, output JSON with:
- "title" ≤7 words
- "description" ≤10 words
- "price": (number type only)(choose fairly: 10-20 for simple, 20-30 for medium, 30-40 for complex,more complex etc..)
- "category": EXACTLY from [%s], else ""`
)

type ResContnet struct {
	ViolatesRules bool `json:"violatesRules"`
}
type ResAutoSuggest struct {
	Title      string  `json:"title"`
	Descripton string  `json:"description"`
	Category   string  `json:"category"`
	Price      float64 `json:"price"`
}

func (s *Server) hanleOpenAi(w http.ResponseWriter, r *http.Request) {

	content := ReqContent{}
	if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	ctx := r.Context()
	task := r.URL.Query().Get("task")
	switch task {
	case "moderation":
		handleModeration(s, ctx, w, &content)
	case "autosuggestion":
		handleAutoSuggestion(s, ctx, w, &content)
	default:
		http.Error(w, "Invalid parameter: task not recognized", http.StatusBadRequest)
		return
	}

}

func handleModeration(s *Server, ctx context.Context, w http.ResponseWriter, content *ReqContent) {
	resJson := ResContnet{}
	cacheKey := utils.MakeCacheKey("openai:moderation:", content.Content)

	if s.GetCachedValue(ctx, cacheKey, &resJson) {
		log.Println("using cached version for moderation")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resJson)
		return
	}

	rules, err := s.store.GetAIRules(ctx)
	if err != nil {
		log.Println("error in finding rules", err.Error())
	}
	fmt.Printf("rules :%+v", rules)

	systemPrompt := fmt.Sprintf(
		ModerationPrompt,
		strings.Join(rules, ", "),
	)
	if err = NewOpenAiReq(ctx, s.openaiClient, systemPrompt, content.Content, &resJson); err != nil {
		log.Println("AI request failed:", err)
		http.Error(w, "AI request failed, please try again later", http.StatusInternalServerError)
	}

	s.SetCachedValue(ctx, cacheKey, resJson, 24*time.Hour)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resJson)

}

func handleAutoSuggestion(s *Server, ctx context.Context, w http.ResponseWriter, content *ReqContent) {
	resAutoSuggest := ResAutoSuggest{}
	cacheKey := utils.MakeCacheKey("openai:autosuggestion:", content.Content)

	if s.GetCachedValue(ctx, cacheKey, &resAutoSuggest) {
		log.Println("using cached version for autosuggestion")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resAutoSuggest)
		return
	}
	categories, err := s.store.GetTaskCategories(ctx)
	if err != nil {
		log.Println("error in finding categories", err.Error())
	}
	systemPrompt := fmt.Sprintf(
		AutoSuggestionPrompt,
		strings.Join(categories, ", "),
	)
	if err = NewOpenAiReq(ctx, s.openaiClient, systemPrompt, content.Content, &resAutoSuggest); err != nil {
		log.Println("AI request failed:", err)
		http.Error(w, "AI request failed, please try again later", http.StatusInternalServerError)
	}
	fmt.Printf("%+v\n", resAutoSuggest)
	s.SetCachedValue(ctx, cacheKey, resAutoSuggest, 24*time.Hour)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resAutoSuggest)

}

func NewOpenAiReq(ctx context.Context, openaiClient *openai.Client, prompt, content string, data any) error {
	resp, err := openaiClient.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: openai.GPT4oMini,
			Messages: []openai.ChatCompletionMessage{
				{Role: openai.ChatMessageRoleSystem, Content: SystemRule},
				{Role: openai.ChatMessageRoleSystem, Content: prompt},
				{Role: openai.ChatMessageRoleUser, Content: content},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{Type: "json_object"},
		},
	)
	if err != nil {
		return errors.New("AI request failed: " + err.Error())
	}

	aiRes := resp.Choices[0].Message.Content
	if err := json.Unmarshal([]byte(aiRes), data); err != nil {
		return fmt.Errorf("failed to parse AI JSON: %w", err)

	}
	return nil
}
