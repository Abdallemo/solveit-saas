// Package utils holds all system utilities
package utils

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"github/abdallemo/solveit-saas/internal/user"
	"log"
	"os"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
	"github.com/lestrrat-go/jwx/v3/jwt"
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

func ExtractUserClaims(t jwt.Token) (*user.UserClaims, error) {
	claims := &user.UserClaims{}

	if exp, ok := t.Expiration(); ok {
		claims.ExpiresAt = exp.Unix()
	}
	if iat, ok := t.IssuedAt(); ok {
		claims.IssuedAt = iat.Unix()
	}

	requiredFields := map[string]any{
		"id":    &claims.ID,
		"email": &claims.Email,
		"name":  &claims.Name,
		"role":  &claims.Role,
	}

	for key, dest := range requiredFields {
		if err := t.Get(key, dest); err != nil {
			return nil, errors.New("missing or invalid required claim: " + key)
		}
	}

	_ = t.Get("image", &claims.Image)
	_ = t.Get("stripeAccountId", &claims.StripeAccountID)
	_ = t.Get("stripeCustomerId", &claims.StripeCustomerID)

	if err := t.Get("metadata", &claims.Metadata); err != nil {
		return nil, errors.New("missing or invalid metadata claim")
	}

	return claims, nil
}
