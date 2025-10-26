package api

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github/abdallemo/solveit-saas/internal/database"
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

// Rules are short and written by humans. Interpret them naturally and precisely.//=>my old one
// Rules are absolute and written by humans. Your sole purpose is to check for explicit violation of these rules, not to interpret general intent.
const (
	SystemRule       = "You are an AI task assistant. Always output JSON. \n"
	ModerationPrompt = `
You are a strict but fair task moderator.
Check if the user's content violates ANY of these rules:
[%s]
Rules are absolute and written by humans. Your sole purpose is to check for explicit violation of these rules, not to interpret general intent.
**[CRITICAL EXCEPTION] Do NOT flag requests that seek technical review, debugging, troubleshooting, or collaboration, even if the work is for a graded component.**
Respond only in JSON format:
{
"violatesRules": true/false,
"reason": "<short reason>"
"triggeredRules": ["<exact rule text>", ...] // Empty array if none
"confidenceScore": <number type only, 0 to 10>
}`
	AutoSuggestionPrompt = `Given content and category list, output JSON with:
- "title" ≤7 words
- "description" ≤10 words
- "price": (number type only)(choose fairly: 10-20 for simple, 20-30 for medium, 30-40 for complex,more complex etc..)
- "category": EXACTLY from [%s], else ""`
)

type ResContnet struct {
	ViolatesRules   bool     `json:"violatesRules"`
	Reason          string   `json:"reason"`
	TriggeredRules  []string `json:"triggeredRules"`
	ConfidenceScore int      `json:"confidenceScore"`
}
type ClientModerationRes struct {
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
	if resJson.ViolatesRules {
		fmt.Println("rule Violation, reason:", resJson.Reason)
		fmt.Println("triggeredRules:", resJson.TriggeredRules)
		s.store.AddAIFlags(ctx, database.AddAIFlagsParams{
			HashedContent:   cacheKey,
			Reason:          resJson.Reason,
			ConfidenceScore: int32(resJson.ConfidenceScore)})
	}
	// clientRes := ClientModerationRes{
	// 	ViolatesRules: resJson.ViolatesRules,
	// }
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
