package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/sashabaranov/go-openai"
)

type ReqContent struct {
	Content string `json:"content"`
}
type ResContnet struct {
	Title         string `json:"title"`
	ViolatesRules bool   `json:"violatesRules"`
}

var openAiCache = make(map[string]*ResContnet)

func (s *Server) hanleOpenAi(w http.ResponseWriter, r *http.Request) {
	content := ReqContent{}
	resJson := ResContnet{}
	if err := json.NewDecoder(r.Body).Decode(&content); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	rules, err := s.store.GetAIRules(context.Background())
	if err != nil {
		log.Println("error in finding rules", err.Error())
	}
	systemContent := fmt.Sprintf(
		"You are a content moderation AI. Check the input against these rules:\n%s\nRespond in JSON with 'violatesRules': true/false, and 'title': a 7-word relevent title for the content.",
		strings.Join(rules, ", "),
	)
	fmt.Println(systemContent)
	fmt.Println(content.Content)

	if cachedRes, ok := openAiCache[content.Content]; ok {
		log.Println("using Cached Version")
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(cachedRes)
		return
	}

	// --Testing--
	resp, err := s.openaiClient.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT4oMini,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: systemContent,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: content.Content,
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: "json_object",
			},
		},
	)
	if err != nil {
		http.Error(w, "AI request failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	aiContent := resp.Choices[0].Message.Content
	if err := json.Unmarshal([]byte(aiContent), &resJson); err != nil {
		log.Println("failed to parse AI JSON:", aiContent)
		http.Error(w, "Failed to parse AI response", http.StatusInternalServerError)
		return
	}
	openAiCache[content.Content] = &resJson
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resJson)

}
