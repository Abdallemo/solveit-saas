// Package user holds database and system user related logic
package user

type PublicUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	Image string `json:"image"`
	Email string `json:"email"`
}
