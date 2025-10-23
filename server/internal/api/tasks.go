package api

import (
	"context"
	"fmt"
	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/database"
	"log"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

var re = regexp.MustCompile(`^(\d+)([hdwmy])$`)

func parseDuration(lowerValue string, assignedAt pgtype.Timestamptz) (int, string, time.Time, error) {

	if !assignedAt.Valid {
		return 0, "", time.Time{}, fmt.Errorf("assignedAt is not a valid timestamp")
	}
	baseTime := assignedAt.Time

	match := re.FindStringSubmatch(lowerValue)

	if len(match) == 0 {
		return 0, "", time.Time{}, fmt.Errorf("invalid duration format: %s", lowerValue)
	}

	_, numStr, unit := match[0], match[1], match[2]

	num, err := strconv.Atoi(numStr)
	if err != nil {
		return 0, "", time.Time{}, fmt.Errorf("failed to parse number %s: %w", numStr, err)
	}

	var newTime time.Time

	switch unit {
	case "h": // Hours
		newTime = baseTime.Add(time.Duration(num) * time.Hour)
	case "d": // Days
		newTime = baseTime.Add(time.Duration(num) * 24 * time.Hour)
	case "w": // Weeks
		newTime = baseTime.Add(time.Duration(num) * 7 * 24 * time.Hour)
	case "m": // Months
		newTime = baseTime.AddDate(0, num, 0)
	case "y": // Years
		newTime = baseTime.AddDate(num, 0, 0)
	default:
		return num, unit, time.Time{}, fmt.Errorf("unsupported duration unit: %s", unit)
	}

	return num, unit, newTime, nil
}

func (s *Server) StartTaskBackgroundCheckup(ctx context.Context, concurrency int, timeBetweenChecks time.Duration) {
	log.Println("Starting Background Job for task checkup")
	ticker := time.NewTicker(timeBetweenChecks)
	for {
		select {
		case <-ctx.Done():
			log.Println("Task background checkup shutting down...")
			return
		case <-ticker.C:
			log.Println("Running scheduled task check.")
			tasks, err := s.store.GetAvailbleTasks(ctx, int32(concurrency))
			if err != nil {
				log.Println("error getting tasks")
				continue
			}
			wg := &sync.WaitGroup{}

			nowUTC := time.Now().In(time.UTC)
			for _, task := range tasks {
				wg.Add(1)
				_, _, tm, _ := parseDuration(task.Deadline, task.AssignedAt)
				tmUTC := tm.In(time.UTC)

				go s.processTask(ctx, task, nowUTC, tmUTC, wg)

			}
			wg.Wait()
		}
	}

}
func (s *Server) processTask(ctx context.Context, task database.Task, nowUTC, tmUTC time.Time, wg *sync.WaitGroup) {
	defer wg.Done()
	log.Printf("starting process on task %v on %v", task.ID, nowUTC)

	if nowUTC.Before(tmUTC) {
		return
	}

	log.Printf("deadline is passed for task %v ", task.ID)
	blockedSolver, err := s.store.AddSolverToTaskBlockList(ctx, database.AddSolverToTaskBlockListParams{
		UserID: task.SolverID,
		TaskID: task.ID,
		Reason: pgtype.Text{String: "Missed Deadline", Valid: true},
	})
	if err != nil {
		log.Printf("error in adding , skipping..")
		return
	}

	if blockedSolver.ID.Valid {

		log.Printf("blcoked %v from task %v", blockedSolver.UserID, blockedSolver.TaskID)
		notif, err := s.transactionTaskUpdate(ctx, task.SolverID.String(), task.Title, task.ID)
		if err != nil {
			log.Print(err)
			return
		}

		s.wsNotif.SendToUser(task.SolverID.String(), websocket.Message{
			ID:         notif.ID.String(),
			Content:    notif.Content,
			ReceiverId: notif.ReceiverID,
			SenderId:   notif.SenderID,
			Subject:    notif.Subject.String,
			Method:     string(notif.Method),
			Read:       notif.Read,
			CreatedAt:  notif.CreatedAt.Time.String(),
		})
	}

}

func (s *Server) transactionTaskUpdate(ctx context.Context, SolverID, Title string, TaskID pgtype.UUID) (database.Notification, error) {
	tx, err := s.dbConn.Begin(ctx)
	if err != nil {
		return database.Notification{}, err
	}
	defer tx.Rollback(ctx)
	qtx := s.store.WithTx(tx)

	notif, err := qtx.ProcessSystemNotification(ctx, database.ProcessSystemNotificationParams{
		SenderID:   "solveit@org.com",
		ReceiverID: SolverID,
		Subject:    pgtype.Text{String: "Blocked From A Task", Valid: true},
		Content:    fmt.Sprintf("You are blocked from task: %v you no longer able to submit it but you can still access your previouse work", Title),
		Read:       false,
	})
	if err != nil {
		log.Printf("failed to save notificaotn , skipping..")
		return database.Notification{}, fmt.Errorf("failed to save notificaotn , skipping")
	}
	err = s.store.ResetTaskInfo(ctx, TaskID)
	if err != nil {
		return database.Notification{}, fmt.Errorf("failed to reset task , skipping")
	}

	return notif, tx.Commit(ctx)
}
