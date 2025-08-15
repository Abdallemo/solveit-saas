package api

import (
	"context"
	"fmt"
	"log"
	"net/http"
)

func (s *Server) hanleOpenAi(w http.ResponseWriter, r *http.Request) {
	// resp, err := s.openaiClient.CreateChatCompletion(
	// 	context.Background(),
	// 	openai.ChatCompletionRequest{
	// 		Model: openai.GPT4oMini,
	// 		Messages: []openai.ChatCompletionMessage{
	// 			{
	// 				Role:    openai.ChatMessageRoleUser,
	// 				Content: "Hello!",
	// 			},
	// 		},
	// 	},
	// )

	// if err != nil {
	// 	fmt.Printf("ChatCompletion error: %v\n", err)
	// 	return
	// }
	// resCont := resp.Choices[0].Message.Content
	// w.Write([]byte(resCont))
	rules, err := s.store.GetAIRules(context.Background())
	if err != nil {
		log.Println("error in finding rules", err.Error())
	}
	for _, rule := range rules {

		fmt.Printf("%v,", rule)
	}

}
