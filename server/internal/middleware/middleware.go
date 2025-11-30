package middleware

import (
	"errors"
	"github/abdallemo/solveit-saas/internal/utils"
	"net/http"
	"os"
	"strings"

	"github.com/rs/cors"
)

type Middleware func(http.Handler) http.Handler

var CoresOptions = cors.Options{
	AllowedOrigins:   []string{utils.GetenvWithDefault("NEXTAUTH_URL", "http://localhost:3000")},
	AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
	AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	AllowCredentials: true,
	MaxAge:           5 * 60,
}

func CORS() Middleware {
	c := cors.New(CoresOptions)
	return func(next http.Handler) http.Handler {
		return c.Handler(next)
	}
}

func CreateStack(xs ...Middleware) Middleware {
	return func(next http.Handler) http.Handler {
		for i := len(xs) - 1; i >= 0; i-- {
			x := xs[i]
			next = x(next)
		}
		return next
	}
}
func IsAuthorized(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "missing Authorization header", http.StatusBadRequest)
			return
		}
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "invalid Authorization format", http.StatusBadRequest)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token != os.Getenv("GO_API_AUTH") {
			http.Error(w, "invalid Authorization Token", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
func IsAuthorizedWs(r *http.Request) error {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return errors.New("unauthorized: session token not found")
	}
	if cookie.Value != os.Getenv("GO_API_AUTH") {
		return errors.New("unauthorized: invalid session token")
	}
	return nil
}
