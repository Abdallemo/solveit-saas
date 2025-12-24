// Package user holds database and system user related logic
package user

type PublicUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	Image string `json:"image"`
	Email string `json:"email"`
}
type UserMetadata struct {
	AgreedOnTerms       bool `json:"agreedOnTerms"`
	OnboardingCompleted bool `json:"onboardingCompleted"`
	StripeAccountLinked bool `json:"stripeAccountLinked"`
}

type UserClaims struct {
	PublicUser
	StripeAccountID  string       `json:"stripeAccountId"`
	StripeCustomerID string       `json:"stripeCustomerId"`
	Metadata         UserMetadata `json:"metadata"`
	ExpiresAt        int64        `json:"exp"`
	IssuedAt         int64        `json:"iat"`
}
