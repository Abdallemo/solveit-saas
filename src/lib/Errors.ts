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
  constructor(
    message = "Please upgrade your subscription to solver++ to access this feature",
  ) {
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
export class DisputeAssignmentError extends Error {
  constructor(message = "this dispute is already assigned to a moderator") {
    super(message);
    this.name = "DisputeAssignmentError";
  }
}
export class DisputeRefundedError extends Error {
  constructor(message = "this dispute is already Refunded") {
    super(message);
    this.name = "DisputeRefundedError";
  }
}
export class DisputeUnauthorizedError extends Error {
  constructor(
    message = "You are not the assigned moderator for this dispute. Please contact the moderator currently working on it for assistance.",
  ) {
    super(message);
    this.name = "DisputeUnauthorizedError";
  }
}
export class TaskNotFoundError extends Error {
  public readonly data: { headline: string; message: string };
  public readonly digest: string = "TaskNotFoundError";

  constructor(
    data = {
      headline: "Task Not Found",
      message:
        "The requested task could not be found. It may have been removed, or the ID provided is invalid.",
    },
  ) {
    super(data.message);
    this.name = "TaskNotFoundError";
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TaskNotFoundError);
    }
  }
}
export class DisputeNotFoundError extends Error {
  public readonly data: { headline: string; message: string };
  public readonly digest: string = "DisputeNotFound";
  constructor(
    data = {
      headline: "Dispute Not Found",
      message:
        "The requested dispute could not be found. It may have been removed, resolved, or the ID provided is invalid.",
    },
  ) {
    super(data.message);
    this.name = "DisputeNotFoundError";
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DisputeNotFoundError);
    }
  }
}
export class SessionNotFoundError extends Error {
  public readonly data: { headline: string; message: string };

  constructor(
    data = {
      headline: "Unable to fetch the session info",
      message:
        "The requested sessino could not be found. It may have been removed,  or the ID provided is invalid.",
    },
  ) {
    super(data.message);
    this.name = "SessionNotFoundError";
    this.data = data;
  }
}
export class DatabaseError extends Error {
  public static readonly UNIQUE_VIOLATION_CODE = "23505";

  public readonly dbCode: string | undefined;
  public readonly dbDetail: string | undefined;

  constructor(
    message: string = "A database operation failed.",
    originalError?: any,
  ) {
    super(message);
    this.name = "DatabaseError";
    if (originalError && typeof originalError === "object") {
      if ("code" in originalError) {
        this.dbCode = originalError.code;
      }
      if ("detail" in originalError) {
        this.dbDetail = originalError.detail;
      }
    }
  }

  /**
   * Static method to check if a raw error is a Unique Constraint Violation (PostgreSQL code '23505').
   */
  static isDuplicateKeyError(error: any): boolean {
    return (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === DatabaseError.UNIQUE_VIOLATION_CODE
    );
  }
}

export class DuplicateKeyError extends DatabaseError {
  constructor(
    message: string = "A record with this unique value already exists.",
    originalError?: any,
  ) {
    super(message, originalError);
    this.name = "DuplicateKeyError";
  }
}

export type ServiceLayerErrorType = Promise<{
  error: string | null;
}>;
