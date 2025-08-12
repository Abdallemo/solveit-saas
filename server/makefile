APP_NAME := main.exe
BIN_DIR := bin
SRC_DIR := ./cmd/api

.PHONY: all build run watch clean test fmt install-tools

all: build

# Build binary into bin/
build:
	mkdir -p $(BIN_DIR)
	go build -o $(BIN_DIR)/$(APP_NAME) $(SRC_DIR)

# Run directly from bin/ (after building)
run: build
	./$(BIN_DIR)/$(APP_NAME)

# Live reload with Air
watch:
	air -c air.toml

clean:
	go clean -r $(SRC_DIR)
	rm -f $(BIN_DIR)/$(APP_NAME)
	rm -rf tmp

test:
	go test ./...

fmt:
	go fmt ./...

install-tools:
	go install github.com/air-verse/air@latest
