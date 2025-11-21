// Package utils holds all system utilities
package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

func MakeCacheKey(prefix, content string) string {
	hash := sha256.Sum256([]byte(content))
	hashStr := hex.EncodeToString(hash[:])
	return prefix + hashStr
}
