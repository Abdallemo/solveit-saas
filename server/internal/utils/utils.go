package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

func MakeCacheKey(prefix, content string) string {
	// hash the content
	hash := sha256.Sum256([]byte(content))
	// convert to hex string
	hashStr := hex.EncodeToString(hash[:])
	// return prefix + hash
	return prefix + hashStr
}
