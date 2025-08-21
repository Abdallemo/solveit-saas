export class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
        super(message);
        this.name = "UnauthorizedError";
    }
}

export class SubscriptionError extends Error {
    constructor(message = "Subscription required") {
        super(message);
        this.name = "SubscriptionError";
    }
}
export class MentorError extends Error {
    constructor(message = "Please upgrade your subscription to solver++ to access this feature") {
        super(message);
        this.name = "MentorError";
    }
}

export class RoleError extends Error {
    constructor(message = "Invalid role") {
        super(message);
        this.name = "RoleError";
    }
}