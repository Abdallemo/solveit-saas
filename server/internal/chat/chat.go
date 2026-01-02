package chat

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"time"

	"github/abdallemo/solveit-saas/internal/database"
	"github/abdallemo/solveit-saas/internal/file"
	"github/abdallemo/solveit-saas/internal/user"

	"github/abdallemo/solveit-saas/internal/utils"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	store       *database.Queries
	dbConn      *pgxpool.Pool
	fileService *file.Service
}

func NewService(store *database.Queries,
	dbConn *pgxpool.Pool, fileService *file.Service) *Service {
	return &Service{
		store:       store,
		dbConn:      dbConn,
		fileService: fileService,
	}
}

type ChatFile struct {
	ID           string     `json:"id"`
	FileName     string     `json:"fileName"`
	FileType     string     `json:"fileType"`
	FileSize     float64    `json:"fileSize"`
	FilePath     string     `json:"filePath"`
	UploadedAt   *time.Time `json:"uploadedAt"`
	UploadedByID string     `json:"uploadedById"`
	ChatID       string     `json:"chatId"`
}

type ChatWithFiles struct {
	ID          string          `json:"id"`
	CreatedAt   *time.Time      `json:"createdAt"`
	SessionID   string          `json:"sessionId"`
	Message     *string         `json:"message"`
	SentBy      string          `json:"sentBy"`
	SentTo      string          `json:"sentTo"`
	ReadAt      *time.Time      `json:"readAt"`
	Pending     *bool           `json:"pending"`
	IsDeleted   *bool           `json:"isDeleted"`
	ChatOwner   user.PublicUser `json:"chatOwner"`
	ChatFiles   []ChatFile      `json:"chatFiles"`
	MessageType string          `json:"messageType"`
}

func MapChat(row database.GetChatWithFilesByIDRow, MessageType string) (ChatWithFiles, error) {
	var owner user.PublicUser
	var files []ChatFile

	if err := json.Unmarshal(row.ChatOwner, &owner); err != nil {
		return ChatWithFiles{}, err
	}

	if err := json.Unmarshal(row.ChatFiles, &files); err != nil {
		return ChatWithFiles{}, err
	}

	return ChatWithFiles{
		ID:          row.ID.String(),
		CreatedAt:   row.CreatedAt,
		SessionID:   row.SeesionID.String(),
		Message:     row.Message,
		SentBy:      row.SentBy.String(),
		SentTo:      row.SentTo.String(),
		ReadAt:      row.ReadAt,
		Pending:     row.Pending,
		IsDeleted:   row.IsDeleted,
		ChatOwner:   owner,
		ChatFiles:   files,
		MessageType: MessageType,
	}, nil
}

// CreateChatWithFiles handles DB transaction for chat and file metadata
func (s *Service) CreateChatWithFiles(
	ctx context.Context,
	message string,
	MessageType string,
	sessionID uuid.UUID,
	sentBy uuid.UUID,
	sentTo uuid.UUID,
	files []file.FileMeta,
) (ChatWithFiles, error) {

	tx, err := s.dbConn.Begin(ctx)
	if err != nil {
		return ChatWithFiles{}, err
	}
	defer tx.Rollback(ctx)

	qtx := s.store.WithTx(tx)

	chat, err := qtx.CreateChat(ctx, database.CreateChatParams{
		Message:   utils.ToStringPtr(message),
		SeesionID: sessionID,
		SentBy:    sentBy,
		SentTo:    sentTo,
	})
	if err != nil {
		return ChatWithFiles{}, err
	}

	if len(files) > 0 {
		batch := file.NewFileBatch(files)
		err = qtx.CreateChatFiles(ctx, database.CreateChatFilesParams{
			ChatID:       chat.ID,
			UploadedByID: sentBy,
			FileName:     batch.Names,
			FileType:     batch.Types,
			FileSize:     batch.Sizes,
			FilePath:     batch.Paths,
		})
		if err != nil {
			log.Printf("failed to save file metadata: %v", err)
			return ChatWithFiles{}, err
		}

	}

	chatRow, err := qtx.GetChatWithFilesByID(ctx, chat.ID)
	if err != nil {
		return ChatWithFiles{}, err
	}

	if err = tx.Commit(ctx); err != nil {
		return ChatWithFiles{}, err
	}

	result, err := MapChat(chatRow, MessageType)
	if err != nil {
		return ChatWithFiles{}, err
	}

	return result, nil

}
func (s *Service) DeleteChatWithFiles(ctx context.Context, chatId uuid.UUID, filePath string) (database.DeleteChatWithFilesRow, error) {
	deletedChat, err := s.store.DeleteChatWithFiles(ctx,
		database.DeleteChatWithFilesParams{
			ChatID:   chatId,
			FilePath: filePath,
		})
	if err != nil {
		log.Printf("Failed To Delete %s. Error %s", chatId.String(), err.Error())
		return database.DeleteChatWithFilesRow{}, errors.New("failed to delete")
	}

	for _, filePath := range deletedChat.DeletedFilePaths {
		if filePath != "" {

			err = s.fileService.DeleteFromS3(filePath)
			if err != nil {
				log.Printf("WARNING: DB deleted but S3 failed for %s. Error: %s", filePath, err.Error())
			}

		}
	}
	return deletedChat, nil
}
