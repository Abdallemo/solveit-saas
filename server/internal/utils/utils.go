// Package utils holds all system utilities
package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
)

func MakeCacheKey(prefix, content string) string {
	hash := sha256.Sum256([]byte(content))
	hashStr := hex.EncodeToString(hash[:])
	return prefix + hashStr
}

func GetenvWithDefault(key, defaultVal string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultVal
	}
	return value
}

func LoadEnvs() {
	_, b, _, _ := runtime.Caller(0)
	basepath := filepath.Join(filepath.Dir(b), "..", "..")
	dotenvPath := filepath.Join(basepath, ".env")
	if err := godotenv.Load(dotenvPath); err != nil {
		log.Println("No .env file found, falling back to system env")
	}
}
