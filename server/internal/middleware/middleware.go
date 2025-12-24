// Package middleware implements and hold all server middleware logic
package middleware

import (
	"context"
	"errors"
	"fmt"
	"github/abdallemo/solveit-saas/internal/user"
	"github/abdallemo/solveit-saas/internal/utils"
	"log"
	"net/http"
	"os"

	"time"

	"github.com/google/uuid"
	"github.com/lestrrat-go/httprc/v3"
	"github.com/lestrrat-go/jwx/v3/jwk"
	"github.com/lestrrat-go/jwx/v3/jwt"
	"github.com/rs/cors"
)

type contextKey string

const UserClaim contextKey = "UserClaim"

// MiddlewareFunc is the standard signature for middleware
type MiddlewareFunc func(http.Handler) http.Handler

type Middleware struct {
	jwksURL     string
	fetcher     *jwk.CachedFetcher
	corsHandler *cors.Cors
}

func NewMiddleware(jwksURL string, allowedOrigins []string) (*Middleware, error) {
	ctx := context.Background()

	client := httprc.NewClient()
	cache, err := jwk.NewCache(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("failed to create jwk cache: %w", err)
	}

	if err := cache.Register(ctx, jwksURL, jwk.WithConstantInterval(15*time.Minute)); err != nil {
		return nil, fmt.Errorf("failed to register jwks url: %w", err)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return &Middleware{
		jwksURL:     jwksURL,
		fetcher:     jwk.NewCachedFetcher(cache),
		corsHandler: c,
	}, nil
}

func (m *Middleware) IsAuthorized(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		keyset, err := m.fetcher.Fetch(r.Context(), m.jwksURL)
		if err != nil {
			log.Printf("failed to fetch JWKS: %v", err)
			http.Error(w, "auth system unavailable", http.StatusServiceUnavailable)
			return
		}

		token, err := jwt.ParseRequest(
			r,
			jwt.WithKeySet(keyset),
			jwt.WithValidate(true),
		)
		if err != nil {
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}
		user, err := utils.ExtractUserClaims(token)
		if err != nil {
			http.Error(w, "invalid or expired token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserClaim, user)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *Middleware) IsAuthorizedWs(r *http.Request) error {
	cookie, err := r.Cookie("session_token")
	if err != nil {
		return errors.New("unauthorized: session token not found")
	}

	if cookie.Value != os.Getenv("GO_API_AUTH") {
		return errors.New("unauthorized: invalid session token")
	}
	return nil
}

func (m *Middleware) CORS() MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return m.corsHandler.Handler(next)
	}
}

func (m *Middleware) CreateStack(xs ...MiddlewareFunc) MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		for i := len(xs) - 1; i >= 0; i-- {
			x := xs[i]
			next = x(next)
		}
		return next
	}
}

func GetUserID(ctx context.Context) (uuid.UUID, error) {
	user, ok := ctx.Value(UserClaim).(*user.UserClaims)
	if !ok {
		return uuid.UUID{}, fmt.Errorf("User not authenticated")
	}
	userUUID, err := uuid.Parse(user.ID)
	if err != nil {
		return uuid.UUID{}, fmt.Errorf("Invalid user ID format")
	}
	return userUUID, nil
}
