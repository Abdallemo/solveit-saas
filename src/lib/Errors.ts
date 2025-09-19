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
    message = "Please upgrade your subscription to solver++ to access this feature"
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
    message = "You are not the assigned moderator for this dispute. Please contact the moderator currently working on it for assistance."
  ) {
    super(message);
    this.name = "DisputeUnauthorizedError";
  }
}
export class TaskNotFoundError extends Error {
  constructor(
    message = "The requested task could not be found. It may have been removed or already opened"
  ) {
    super(message);
    this.name = "TaskNotFoundError";
  }
}
export class DisputeNotFoundError extends Error {
  public readonly data: { headline: string; message: string };

  constructor(
    data = {
      headline: "Dispute Not Found",
      message:
        "The requested dispute could not be found. It may have been removed, resolved, or the ID provided is invalid.",
    }
  ) {
    super(data.message);
    this.name = "DisputeNotFoundError";
    this.data = data;
  }
}
