package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github/abdallemo/solveit-saas/internal/cache"
	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/utils" // Assuming cache keys are here

	"github.com/sashabaranov/go-openai"
)

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
	AutoSuggestionBlogPrompt = `Given content , output JSON with:
- "title" ≤7 words
- "description" ≤15 words
- "readTime": estimated read time of blog in min (e.g 10) minimum number is 1
- "category": accurate catagory for the blog`
)

const (
	DefaultAICache = 24 * time.Hour
)

type Service struct {
	openaiClient *openai.Client
	store        *database.Queries
	cache        *cache.Service
}

func NewService(oa *openai.Client, store *database.Queries, cache *cache.Service) *Service {
	return &Service{
		openaiClient: oa,
		store:        store,
		cache:        cache,
	}
}

type ResContent struct {
	ViolatesRules   bool     `json:"violatesRules"`
	Reason          string   `json:"reason"`
	TriggeredRules  []string `json:"triggeredRules"`
	ConfidenceScore int      `json:"confidenceScore"`
}

type ResAutoSuggest struct {
	Title      string  `json:"title"`
	Descripton string  `json:"description"`
	Category   string  `json:"category"`
	Price      float64 `json:"price"`
}

type ResBlogAutoSuggest struct {
	Title      string  `json:"title"`
	Descripton string  `json:"description"`
	Category   string  `json:"category"`
	ReadTime   float64 `json:"readTime"`
}

func (s *Service) CheckModeration(ctx context.Context, content string) (*ResContent, error) {

	cacheKey := utils.MakeCacheKey("openai:moderation:", content)
	var cached ResContent
	if s.cache.GetCachedValue(ctx, cacheKey, &cached) {
		return &cached, nil
	}

	rules, err := s.store.GetAIRules(ctx)
	if err != nil {
		log.Println("error finding rules:", err)
	}

	systemPrompt := fmt.Sprintf(ModerationPrompt, strings.Join(rules, ", "))
	var result ResContent
	if err := s.callOpenAI(ctx, systemPrompt, content, &result); err != nil {
		return nil, err
	}

	if result.ViolatesRules {
		s.store.AddAIFlags(ctx, database.AddAIFlagsParams{
			HashedContent:   cacheKey,
			Reason:          result.Reason,
			ConfidenceScore: int32(result.ConfidenceScore),
		})
	}

	s.cache.SetCachedValue(ctx, cacheKey, result, DefaultAICache)

	return &result, nil
}

func (s *Service) GetTaskSuggestion(ctx context.Context, content string) (*ResAutoSuggest, error) {

	cacheKey := utils.MakeCacheKey("openai:autosuggestion:", content)
	var cached ResAutoSuggest
	if s.cache.GetCachedValue(ctx, cacheKey, &cached) {
		return &cached, nil
	}

	categories, _ := s.store.GetTaskCategories(ctx)
	systemPrompt := fmt.Sprintf(AutoSuggestionPrompt, strings.Join(categories, ", "))

	var result ResAutoSuggest
	if err := s.callOpenAI(ctx, systemPrompt, content, &result); err != nil {
		return nil, err
	}

	s.cache.SetCachedValue(ctx, cacheKey, result, DefaultAICache)
	return &result, nil
}

func (s *Service) GetBlogSuggestion(ctx context.Context, content string) (*ResBlogAutoSuggest, error) {

	cacheKey := utils.MakeCacheKey("openai:autosuggestion_blog:", content)
	var cached ResBlogAutoSuggest
	if s.cache.GetCachedValue(ctx, cacheKey, &cached) {
		return &cached, nil
	}

	var result ResBlogAutoSuggest
	if err := s.callOpenAI(ctx, AutoSuggestionBlogPrompt, content, &result); err != nil {
		return nil, err
	}

	s.cache.SetCachedValue(ctx, cacheKey, result, DefaultAICache)
	return &result, nil
}

func (s *Service) callOpenAI(ctx context.Context, prompt, content string, data any) error {
	resp, err := s.openaiClient.CreateChatCompletion(
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
		return err
	}
	return json.Unmarshal([]byte(resp.Choices[0].Message.Content), data)
}
