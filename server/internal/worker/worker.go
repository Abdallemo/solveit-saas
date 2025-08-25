package worker

import "sync"

type Task interface {
	Process()
}

type WorkerPool struct {
	Tasks        []Task
	councurrency int
	tasksChan    chan Task
	wg           sync.WaitGroup
}

func (wp *WorkerPool) worker() {
	for task := range wp.tasksChan {
		task.Process()
		wp.wg.Done()
	}

}
func (wp *WorkerPool) Run() {
	wp.tasksChan = make(chan Task, len(wp.Tasks))
	defer close(wp.tasksChan)

	for i := 0; i < wp.councurrency; i++ {
		go wp.worker()
	}
	wp.wg.Add(len(wp.Tasks))

	for _, task := range wp.Tasks {
		wp.tasksChan <- task
	}
	wp.wg.Wait()
}
