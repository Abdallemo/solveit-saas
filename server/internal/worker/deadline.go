package worker

import (
	"fmt"
	"time"
)

func parseDeadline(value string, createdAt time.Time) (time.Time, error) {
	base := createdAt.UTC()

	switch value {
	case "12h":
		return base.Add(12 * time.Hour), nil
	case "24h":
		return base.Add(24 * time.Hour), nil
	case "48h":
		return base.Add(48 * time.Hour), nil
	case "3days":
		return base.Add(72 * time.Hour), nil
	case "7days":
		return base.Add(7 * 24 * time.Hour), nil
	default:
		return time.Time{}, fmt.Errorf("unknown deadline value: %s", value)
	}
}

func calculateTaskProgress(deadline string, createdAt time.Time) (float64, error) {
	end, err := parseDeadline(deadline, createdAt)
	if err != nil {
		return 0, err
	}

	start := createdAt.UTC()
	now := time.Now().UTC()

	timePassed := now.Sub(start).Minutes()
	totalTime := end.Sub(start).Minutes()

	if totalTime <= 0 {
		return 100, nil
	}

	percentage := (timePassed / totalTime) * 100
	if percentage < 0 {
		percentage = 0
	}
	if percentage > 100 {
		percentage = 100
	}

	return percentage, nil
}

// func HandleDeadline(store storage.Storage) {
// 	ctx := context.Background()

// 	// get all tasks from db
// 	tasks, err := store.GetAllTask(ctx)
// 	if err != nil {
// 		fmt.Println("error fetching tasks:", err)
// 		return
// 	}

// 	for _, task := range tasks {

// 		createdAt := task.Workspace.CreatedAt
// 		deadlineValue := task.Deadline

// 		progress, err := calculateTaskProgress(deadlineValue, createdAt)
// 		if err != nil {
// 			fmt.Println("progress calc error:", err)
// 			continue
// 		}

// 		if progress < 100 {
// 			continue
// 		}

// 		alreadyBlocked, _ := store.GetBlockedSolver(ctx, task.SolverID, task.ID)
// 		if alreadyBlocked {
// 			continue
// 		}

// 		// reopen task
// 		err = store.ReopenTask(ctx, task.ID)
// 		if err != nil {
// 			fmt.Println("error reopening task:", err)
// 			continue
// 		}

// 		// block solver
// 		err = store.AddSolverToTaskBlockList(ctx, task.SolverID, task.ID, "Missed deadline")
// 		if err != nil {
// 			fmt.Println("error blocking solver:", err)
// 			continue
// 		}

// 		fmt.Printf("Task %s missed deadline. Solver %s blocked.\n", task.ID, task.SolverID)
// 	}
// }
