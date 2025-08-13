package auth

import (
	"errors"
	"net/http"
	"strings"
)

func IsAuthorized(r *http.Request, expectedToken string) error {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return errors.New("missing Authorization header")
	}

	parts := strings.SplitN(authHeader, "Bearer ", 2)
	if len(parts) != 2 {
		return errors.New("invalid Authorization format")
	}
	token := strings.TrimSpace(parts[1])
	if token != expectedToken {
		return errors.New("invalid token")
	}
	return nil
}
