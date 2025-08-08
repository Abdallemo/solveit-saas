package main

import "log"

func main() {
	server := NewAPIServer(":8080", nil)
	log.Fatal(server.Run())
}
