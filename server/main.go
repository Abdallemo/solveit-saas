package main

import (
	"log"
)

func main() {
	server := NewWsNotification()
	log.Fatal(server.run())
}
