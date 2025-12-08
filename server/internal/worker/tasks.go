package worker

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strconv"
	"sync"
	"time"

	"github/abdallemo/solveit-saas/internal/api/websocket"
	"github/abdallemo/solveit-saas/internal/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

var re = regexp.MustCompile(`^(\d+)([hdwmy])$`)

// StartDeadlineEnforcerJob initializes the ticker and spawns the worker with a lock mechanism
func (w *Worker) StartDeadlineEnforcerJob(ctx context.Context, concurrency int, timeBetweenChecks time.Duration) {
	ticker := time.NewTicker(timeBetweenChecks)
	log.Println("Starting Background Job for task deadline enforcement")
	defer ticker.Stop()

	go w.runDeadlineCheck(ctx, concurrency)

	for {
		select {
		case <-ctx.Done():
			log.Println("Task deadline enforcement shutting down...")
			return
		case <-ticker.C:
			go w.runDeadlineCheck(ctx, concurrency)
		}
	}
}

func (w *Worker) runDeadlineCheck(ctx context.Context, concurrency int) {
	if !w.mu.TryLock() {
		log.Println("Skipping scheduled deadline check. Previous run is still active.")
		return
	}
	defer w.mu.Unlock()

	log.Println("Running scheduled task deadline check.")

	tasks, err := w.store.GetAvailbleTasks(ctx, int32(concurrency))
	if err != nil {
		log.Printf("Error getting tasks: %v", err)
		return
	}

	wg := &sync.WaitGroup{}
	nowUTC := time.Now().In(time.UTC)

	for _, task := range tasks {
		wg.Add(1)

		_, _, tm, err := parseDuration(task.Deadline, task.AssignedAt)
		if err != nil {
			log.Printf("Skipping task %v: invalid duration format", task.ID)
			wg.Done()
			continue
		}

		tmUTC := tm.In(time.UTC)
		go w.checkAndEnforceDeadline(ctx, task, nowUTC, tmUTC, wg)
	}

	wg.Wait()
	log.Println("Deadline check cycle finished.")
}

func (w *Worker) checkAndEnforceDeadline(ctx context.Context, task database.Task, nowUTC, tmUTC time.Time, wg *sync.WaitGroup) {
	defer wg.Done()

	// log.Printf("Processing task %v check against %v", task.ID, nowUTC)

	if nowUTC.Before(tmUTC) {
		return
	}

	log.Printf("Deadline passed for task %v", task.ID)

	blockedSolver, err := w.store.AddSolverToTaskBlockList(ctx, database.AddSolverToTaskBlockListParams{
		UserID: *task.SolverID,
		TaskID: task.ID,
		Reason: pgtype.Text{String: "Missed Deadline", Valid: true},
	})
	if err != nil {
		log.Printf("Error adding solver to block list for task %v: %v", task.ID, err)
		return
	}

	if blockedSolver.ID != uuid.Nil {
		log.Printf("Blocked user %v from task %v", blockedSolver.UserID, blockedSolver.TaskID)

		notif, err := w.notifySolverAndResetTaskTx(ctx, *task.SolverID, task.Title, task.ID)
		if err != nil {
			log.Printf("Error notifying solver/resetting task: %v", err)
			return
		}

		w.wsNotif.SendToUser(task.SolverID.String(), websocket.Message{
			ID:         notif.ID.String(),
			Content:    notif.Content,
			ReceiverID: notif.ReceiverID,
			SenderID:   notif.SenderID,
			Subject:    notif.Subject.String,
			Method:     string(notif.Method),
			Read:       notif.Read,
			CreatedAt:  notif.CreatedAt.String(),
		})
	}
}

func (w *Worker) notifySolverAndResetTaskTx(ctx context.Context, SolverID uuid.UUID, Title string, TaskID uuid.UUID) (database.Notification, error) {
	tx, err := w.dbConn.Begin(ctx)
	if err != nil {
		return database.Notification{}, err
	}
	defer tx.Rollback(ctx)

	qtx := w.store.WithTx(tx)

	notif, err := qtx.ProcessSystemNotification(ctx, database.ProcessSystemNotificationParams{
		SenderID:   "solveit@org.com",
		ReceiverID: SolverID.String(),
		Subject:    pgtype.Text{String: "Blocked From A Task", Valid: true},
		Content:    fmt.Sprintf("You are blocked from task: %v. You can no longer submit it but you can still access your previous work.", Title),
		Read:       false,
	})
	if err != nil {
		return database.Notification{}, fmt.Errorf("failed to save notification: %w", err)
	}

	err = w.store.ResetTaskInfo(ctx, TaskID)
	if err != nil {
		return database.Notification{}, fmt.Errorf("failed to reset task info: %w", err)
	}

	return notif, tx.Commit(ctx)
}

func parseDuration(lowerValue string, assignedAt *time.Time) (int, string, time.Time, error) {
	if assignedAt == nil {
		return 0, "", time.Time{}, fmt.Errorf("assignedAt is not a valid timestamp")
	}
	baseTime := assignedAt

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
	case "h":
		newTime = baseTime.Add(time.Duration(num) * time.Hour)
	case "d":
		newTime = baseTime.Add(time.Duration(num) * 24 * time.Hour)
	case "w":
		newTime = baseTime.Add(time.Duration(num) * 7 * 24 * time.Hour)
	case "m":
		newTime = baseTime.AddDate(0, num, 0)
	case "y":
		newTime = baseTime.AddDate(num, 0, 0)
	default:
		return num, unit, time.Time{}, fmt.Errorf("unsupported duration unit: %s", unit)
	}

	return num, unit, newTime, nil
}
