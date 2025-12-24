import { UploadedFileMeta } from "@/features/media/server/media-types";
import { AvailabilitySlot } from "@/features/mentore/server/types";
import {
  Address,
  Business,
  defaultUserMetadata,
  UserMetadata,
} from "@/features/users/server/user-types";
import { JSONContent } from "@tiptap/react";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgSequence,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "./relations";

export const UserRole = pgEnum("role", [
  "ADMIN",
  "MODERATOR",
  "POSTER",
  "SOLVER",
]);
export const NotificationMethodsEnum = pgEnum("method", ["SYSTEM", "EMAIL"]);
export const TierEnum = pgEnum("tier", ["POSTER", "SOLVER", "SOLVER++"]);
export const PaymentStatus = pgEnum("payment_status", [
  "HOLD",
  "RELEASED",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "REFUNDED",
  "PENDING_USER_ACTION",
]);
export const MentorChatStatus = pgEnum("status", ["PENDING", "SENT"]);
export const MentorChatFileStatus = pgEnum("status", ["UPLOADING", "DONE"]);
export const TaskStatusEnum = pgEnum("task_status", [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "SUBMITTED",
]);
export const fileUploadStatusEnum = pgEnum("file_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);
export const RefundStatusEnum = pgEnum("refund_status", [
  "PENDING",
  "PROCESSING",
  "REFUNDED",
  "REJECTED",
  "FAILED",
  "PENDING_USER_ACTION",
]);
export const PaymentPorposeEnum = pgEnum("payment_porpose", [
  "Task Payment",
  "Mentor Booking",
]);
export const BookingSatatusEnum = pgEnum("booking_status", [
  "PENDING",
  "PAID",
  "CANCELED",
]);

export const FeedbackCategory = pgEnum("feedback_category", [
  "TASK",
  "MENTORING",
]);
export const TaskVisibility = pgEnum("visibility", ["public", "private"]);
export type taskTableType = typeof TaskTable.$inferInsert;
export type PaymentPorposeType = (typeof PaymentPorposeEnum.enumValues)[number];
export type TierType = (typeof TierEnum.enumValues)[number];
export type UserRoleType = (typeof UserRole.enumValues)[number];
export type FeedbackType = (typeof FeedbackCategory.enumValues)[number];
export type TaskCategoryType = typeof TaskCategoryTable.$inferSelect;
export type TaskType = typeof TaskTable.$inferSelect;
export type taskFileType = typeof TaskFileTable.$inferSelect;
export type BlockedSolverType = typeof BlockedTasksTable.$inferSelect;
export type TaskStatusType = (typeof TaskStatusEnum.enumValues)[number];
export type FileUploadStatusType =
  (typeof fileUploadStatusEnum.enumValues)[number];
export type MentorChatStatusType = (typeof MentorChatStatus.enumValues)[number];
export type MentorChatFileStatusType =
  (typeof MentorChatFileStatus.enumValues)[number];
export type PaymentStatusType = (typeof PaymentStatus.enumValues)[number];
export type RefundStatusEnumType = (typeof RefundStatusEnum.enumValues)[number];
export type PaymentPorposeEnumType =
  (typeof PaymentPorposeEnum.enumValues)[number];

export const AiTestAmountSequence = pgSequence("ai_test_amount_sequence", {
  startWith: 1,
  increment: 1,
});
export const UserTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    password: text("password"),
    role: UserRole("role").default("POSTER").notNull().$type<UserRoleType>(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeAccountId: text("stripe_account_id"),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    metadata: jsonb("metadata")
      .$type<UserMetadata>()
      .notNull()
      .default(defaultUserMetadata),
  },
  (user) => [index("user_role_idx").on(user.role)],
);
export const UserDetails = pgTable("user_details", {
  userId: uuid("user_id")
    .primaryKey()
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: date("date_of_birth"),
  address: jsonb("address").$type<Address>(),
  business: jsonb("business").$type<Business>(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
});

export const AccountTable = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
    mode: "date",
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
    mode: "date",
    withTimezone: true,
  }),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }),
  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }),

  session_state: text("session_state"),
});

export const VerificationTable = pgTable("verification", {
  id: uuid().defaultRandom().notNull(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),

  expiresAt: timestamp("expires_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),

  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),

  updatedAt: timestamp("updatedAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
});

export const SessionTable = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const JWKSTable = pgTable("jwks", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const UserSubscriptionTable = pgTable(
  "subscription",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    tier: TierEnum("tier").notNull(),
    cancelAt: timestamp("cancel_at", { mode: "date" }),
    isCancelScheduled: boolean("is_cancel_scheduled").default(false).notNull(),
    status: text("status").default("inactive").notNull(),
    interval: text("interval").default("month").notNull(),
    nextBilling: timestamp("next_billing", { mode: "date" }),
    price: integer("price").default(0).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (subscription) => [index("subscription_userId_idx").on(subscription.userId)],
);

export const SolverProfileTable = pgTable("solver_profile", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  protfolioUrl: text("portfolio_url"),
  skills: text("skills").array().default([]),
  avgRating: numeric("avg_rating", { precision: 3, scale: 1 })
    .default("0o0")
    .notNull(),
  taskSolved: integer("task_solved").default(0),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
});
export const PaymentTable = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    status: PaymentStatus("status").default("HOLD"),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
    stripeChargeId: text("stripe_charge_id"),
    purpose: text("purpose"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    releaseDate: timestamp("release_date", {
      mode: "date",
      withTimezone: true,
    }),
  },
  (payments) => [
    index("payments_userId_idx").on(payments.userId),
    index("payments_status_idx").on(payments.status),
  ],
);

export const FeedbackTable = pgTable(
  "feedback",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    posterId: uuid("poster_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    solverId: uuid("solver_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    feedbackType: FeedbackCategory("feedback_type").notNull(),
    mentorBookingId: uuid("mentor_booking_id").references(
      () => MentorshipBookingTable.id,
    ),
    taskId: uuid("task_id").references(() => TaskTable.id, {
      onDelete: "cascade",
    }),
    rating: integer("rating").default(0).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    feedbackSourceCheck: check(
      "feedback_source_check",
      sql`(feedback_type = 'TASK' AND task_id IS NOT NULL AND mentor_booking_id IS NULL) OR
          (feedback_type = 'MENTORING' AND task_id IS NULL AND mentor_booking_id IS NOT NULL)`,
    ),
  }),
);

export const TaskTable = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: jsonb("content").notNull().$type<JSONContent>(),
    price: integer("price").notNull(),
    posterId: uuid("poster_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    solverId: uuid("solver_id").references(() => UserTable.id, {
      onDelete: "no action",
    }),
    visibility: TaskVisibility("visibility").default("public").notNull(),
    categoryId: uuid("category_id")
      .references(() => TaskCategoryTable.id, { onDelete: "cascade" })
      .notNull(),
    paymentId: uuid("payment_id")
      .references(() => PaymentTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
    deadline: text("deadline")
      .references(() => TaskDeadlineTable.deadline, { onDelete: "cascade" })
      .notNull()
      .default("12h"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    status: TaskStatusEnum("task_status").default("OPEN").notNull(),
    assignedAt: timestamp("assigned_at", { mode: "date", withTimezone: true }),
  },
  (task) => [
    index("task_poster_idx").on(task.posterId),
    index("task_solver_idx").on(task.solverId),
    index("task_status_idx").on(task.status),
    index("task_created_idx").on(task.assignedAt),
  ],
);
export const BlockedTasksTable = pgTable(
  "blocked_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => TaskTable.id, { onDelete: "cascade" }),
    reason: text("reason"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (blokedTask) => [
    index("blocked_taskId_idx").on(blokedTask.taskId),
    index("blocked_userId_idx").on(blokedTask.userId),
    uniqueIndex("unique_blocked_task").on(blokedTask.userId, blokedTask.taskId),
  ],
);
export const TaskDraftTable = pgTable(
  "task_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    userId: uuid("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    title: text("title").default("").notNull(),
    description: text("description").default("").notNull(),
    content: jsonb("content").default("{}").notNull().$type<JSONContent>(),
    contentText: text("contentText").default("").notNull(),
    category: text("category").default("").notNull(),
    deadline: text("deadline").default("12h").notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    uploadedFiles: jsonb("uploadedFiles")
      .default("[]")
      .notNull()
      .$type<UploadedFileMeta[]>(),
    visibility: TaskVisibility("visibility").default("public").notNull(),
    price: integer("price").default(10).notNull(),
  },
  (taskDraft) => [index("task_drafts_userId_idx").on(taskDraft.userId)],
);

export const TaskFileTable = pgTable(
  "task_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => TaskTable.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageLocation: text("file_location").notNull(),
    filePath: text("file_path").notNull(),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (taskFiles) => [
    index("task_files_taskId_idx").on(taskFiles.taskId),
    index("task_files_filePath_idx").on(taskFiles.filePath),
  ],
);
export const GlobalMediaFiles = pgTable(
  "global_media_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageLocation: text("file_location").notNull(),
    filePath: text("file_path").notNull(),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (mediaFiles) => [index("media_files_filePath_idx").on(mediaFiles.filePath)],
);

export const TaskCategoryTable = pgTable("task_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export const TaskDeadlineTable = pgTable(
  "task_deadline",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    deadline: text("deadline").unique().notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (taskDeadline) => [index("task_deadline_idx").on(taskDeadline.deadline)],
);

export const RefundTable = pgTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => PaymentTable.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => TaskTable.id, {
      onDelete: "set null",
    }),
    refundReason: text("refund_reason"),
    refundStatus: RefundStatusEnum().default("PENDING"),
    moderatorId: uuid("moderatorId").references(() => UserTable.id, {
      onDelete: "no action",
    }),
    refundedAt: timestamp("refunded_at", { mode: "date", withTimezone: true }),
    stripeRefundId: text("stripe_refund_id"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (refunds) => [
    index("refunds_moderatorId_idx").on(refunds.moderatorId),
    index("refunds_paymentId_idx").on(refunds.paymentId),
    index("refunds_taskId_idx").on(refunds.taskId),
    index("refund_status_idx").on(refunds.refundStatus),
  ],
);

export const TaskCommentTable = pgTable(
  "task_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => TaskTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (taskComments) => [
    index("task_comments_taskId_idx").on(taskComments.taskId),
    index("task_comments_userId_idx").on(taskComments.userId),
  ],
);

export const WorkspaceTable = pgTable(
  "solution_workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => TaskTable.id, { onDelete: "cascade" }),
    solverId: uuid("solver_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    content: jsonb("content").default("{}").$type<JSONContent>(),
    contentText: text("contentText").default("").notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (solutionWorkspaces) => [
    index("solution_workspaces_taskId_idx").on(solutionWorkspaces.taskId),
    index("solution_workspaces_solverId_idx").on(solutionWorkspaces.solverId),
  ],
);

export const WorkspaceFilesTable = pgTable(
  "solution_workspace_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => WorkspaceTable.id, { onDelete: "cascade" }),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageLocation: text("file_location").notNull(),
    filePath: text("file_path").notNull(),
    isDraft: boolean("is_draft").default(true),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
    status: fileUploadStatusEnum().default("PENDING"),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (solutionWorkspaceFiles) => [
    index("solution_workspace_files_workspaceId_idx").on(
      solutionWorkspaceFiles.workspaceId,
    ),
    index("solution_workspace_files_uploadedById_idx").on(
      solutionWorkspaceFiles.uploadedById,
    ),
    index("solution_workspace_files_filePath_idx").on(
      solutionWorkspaceFiles.filePath,
    ),
  ],
);

export const SolutionTable = pgTable(
  "solutions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => WorkspaceTable.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => TaskTable.id, { onDelete: "cascade" }),
    content: jsonb("content").$type<JSONContent>(),
    fileUrl: text("file_url"),
    isFinal: boolean("is_final").default(false),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (solutions) => [
    index("solutions_taskId_idx").on(solutions.taskId),
    index("solutions_workspaceId_idx").on(solutions.workspaceId),
  ],
);

export const SolutionFilesTable = pgTable(
  "solution_files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    solutionId: uuid("solution_id")
      .notNull()
      .references(() => SolutionTable.id, { onDelete: "cascade" }),
    workspaceFileId: uuid("workspace_file_id")
      .notNull()
      .references(() => WorkspaceFilesTable.id, { onDelete: "cascade" }),
  },
  (solutionFiles) => [
    index("solution_files_solutionId_idx").on(solutionFiles.solutionId),
    index("solution_files_workspaceFileId_idx").on(
      solutionFiles.workspaceFileId,
    ),
  ],
);
export const MentorshipProfileTable = pgTable(
  "mentorship_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" })
      .unique(),
    displayName: text("display_name").notNull().default(""),
    avatar: text("avatar").notNull().default("/avatars/avatar-4.svg"),
    title: text("title").notNull().default(""),
    description: text("description").notNull().default(""),
    ratePerHour: real("rate_per_hour").notNull().default(0),
    availableTimes: jsonb("available_times")
      .notNull()
      .$type<AvailabilitySlot[]>()
      .default([]),
    isPublished: boolean("is_published").default(false).notNull(),
    timezone: text("timezone").notNull().default("Asia/Kuala_Lumpur"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (mentorshipProfiles) => [
    index("mentorship_profiles_userId_idx").on(mentorshipProfiles.userId),
  ],
);
export const MentorshipSessionTable = pgTable(
  "mentor_session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => MentorshipBookingTable.id, { onDelete: "cascade" }),
    sessionDate: date("session_date").notNull(),
    timeSlot: jsonb("time_slot").notNull().$type<AvailabilitySlot>(),
    sessionStart: timestamp("session_start", { withTimezone: true }).notNull(),
    sessionEnd: timestamp("session_end", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (mentorSession) => [
    index("mentor_session_bookingId_idx").on(mentorSession.bookingId),
  ],
);

export const MentorshipBookingTable = pgTable(
  "mentorship_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    solverId: uuid("solver_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    posterId: uuid("student_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    price: integer("price"),
    status: BookingSatatusEnum().default("PENDING").notNull(),
    paymentId: uuid("payment_id").references(() => PaymentTable.id, {
      onDelete: "cascade",
    }),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (mentorshipBookings) => [
    index("mentorship_bookings_solverId_idx").on(mentorshipBookings.solverId),
    index("mentorship_bookings_posterId_idx").on(mentorshipBookings.posterId),
    index("mentorship_bookings_paymentId_idx").on(mentorshipBookings.paymentId),
    index("mentorship_bookings_status_idx").on(mentorshipBookings.status),
  ],
);

export const MentorshipChatTable = pgTable(
  "mentorship_chats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("seesion_id")
      .notNull()
      .references(() => MentorshipSessionTable.id, { onDelete: "cascade" }),
    message: text("message"),
    sentBy: uuid("sent_by")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    sentTo: uuid("sent_to")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { mode: "date", withTimezone: true }),
    pending: boolean("pending"),
    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (mentorshipChats) => [
    index("mentorship_chats_sessionId_idx").on(mentorshipChats.sessionId),
  ],
);

export const MentorshipChatFilesTable = pgTable(
  "mentorship_chat_files",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => MentorshipChatTable.id, { onDelete: "cascade" }),
    uploadedById: uuid("uploaded_by_id")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storageLocation: text("file_location").notNull(),
    filePath: text("file_path").notNull(),
    uploadedAt: timestamp("uploaded_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow(),
  },
  (mentorshipChatFiles) => [
    index("mentorship_chat_files_chatId_idx").on(mentorshipChatFiles.chatId),
    index("mentorship_chat_files_filePath_idx").on(
      mentorshipChatFiles.filePath,
    ),
  ],
);

export const RulesTable = pgTable("ai_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  rule: text("rule").notNull(),
  description: text("decription").notNull(),
  isActive: boolean("is_active").notNull(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "no action" }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const AiFlagsTable = pgTable("ai_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  hashedContent: text("hashed_content").notNull(),
  reason: text("reason").notNull(),
  confidenceScore: integer("confidence_score").notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
export const AiTestSandboxTable = pgTable("ai_test_sandbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull().default(""),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  testAmount: serial("test_amount").notNull(),
  // .$onUpdateFn(()=>{
  //   return sql<number>`nextval('${sql.raw(AiTestAmountSequence.seqName!)}')`
  // }).def,
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
});
export const BlogTable = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull(),
  content: jsonb("content").$type<JSONContent>().notNull(),
  category: text("category").notNull(),
  author: uuid("author")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  publishedAt: timestamp("publishedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readTime: integer("readTime").notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  method: NotificationMethodsEnum("method").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
});

export const logTable = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("createdAt", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  level: varchar("level", { length: 10 }).notNull(),
  message: text("message").notNull(),
  error: text("error").default(""),
});

//* RELATINOS

//* To Many Relations Here
export const userRlations = relations(UserTable, ({ many, one }) => ({
  tasksAsPoster: many(TaskTable, {
    relationName: "poster",
  }),
  tasksAsSolver: many(TaskTable, {
    relationName: "solver",
  }),
  refundModerator: many(RefundTable, {
    relationName: "refundModerator",
  }),
  blockedSolverFromTask: many(BlockedTasksTable, {
    relationName: "solver",
  }),
  account: one(AccountTable, {
    fields: [UserTable.id],
    references: [AccountTable.userId],
  }),
  session: one(SessionTable, {
    fields: [UserTable.id],
    references: [SessionTable.userId],
    relationName: "session",
  }),
  userDetails: one(UserDetails, {
    fields: [UserTable.id],
    references: [UserDetails.userId],
  }),
  owner: many(TaskCommentTable, {
    relationName: "owner",
  }),
  payer: many(PaymentTable, {
    relationName: "payer",
  }),
  chatOwner: many(MentorshipChatTable, {
    relationName: "chatOwner",
  }),
  mentorSystemDetail: many(MentorshipProfileTable, {
    relationName: "mentorSystemDetail",
  }),
  postedBlogs: many(BlogTable, {
    relationName: "postedBlogs",
  }),
}));
export const blogsRelation = relations(BlogTable, ({ one }) => ({
  blogAuthor: one(UserTable, {
    fields: [BlogTable.author],
    references: [UserTable.id],
    relationName: "postedBlogs",
  }),
}));

export const accountRelations = relations(AccountTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [AccountTable.userId],
    references: [UserTable.id],
  }),
}));
export const sessionRelations = relations(SessionTable, ({ one }) => ({
  session: one(UserTable, {
    fields: [SessionTable.userId],
    references: [UserTable.id],
    relationName: "session",
  }),
}));
export const userDetailsRelations = relations(UserDetails, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserDetails.userId],
    references: [UserTable.id],
  }),
}));

//* To Obe Relations Here
export const taskRelations = relations(TaskTable, ({ one, many }) => ({
  poster: one(UserTable, {
    relationName: "poster",
    fields: [TaskTable.posterId],
    references: [UserTable.id],
  }),
  solver: one(UserTable, {
    relationName: "solver",
    fields: [TaskTable.solverId],
    references: [UserTable.id],
  }),
  taskSolution: one(SolutionTable, {
    relationName: "taskSolution",
    fields: [TaskTable.id],
    references: [SolutionTable.taskId],
  }),
  workspace: one(WorkspaceTable, {
    relationName: "workspace",
    fields: [TaskTable.id],
    references: [WorkspaceTable.taskId],
  }),
  taskRefund: one(RefundTable, {
    fields: [TaskTable.id],
    references: [RefundTable.taskId],
    relationName: "taskRefund",
  }),

  blockedSolvers: many(BlockedTasksTable, {
    relationName: "blockedSolvers",
  }),
  taskComments: many(TaskCommentTable, {
    relationName: "taskComments",
  }),
  taskFiles: many(TaskFileTable, {
    relationName: "taskFiles",
  }),
  category: one(TaskCategoryTable, {
    fields: [TaskTable.categoryId],
    references: [TaskCategoryTable.id],
    relationName: "category",
  }),
}));
export const TaskCategoryTableRelations = relations(
  TaskCategoryTable,
  ({ many }) => ({
    category: many(TaskTable, {
      relationName: "category",
    }),
  }),
);
export const TaskCommentTableRelations = relations(
  TaskCommentTable,
  ({ one }) => ({
    owner: one(UserTable, {
      fields: [TaskCommentTable.userId],
      references: [UserTable.id],
      relationName: "owner",
    }),
    taskComments: one(TaskTable, {
      fields: [TaskCommentTable.taskId],
      references: [TaskTable.id],
      relationName: "taskComments",
    }),
  }),
);
export const BlockedTasksTableRelation = relations(
  BlockedTasksTable,
  ({ one }) => ({
    task: one(TaskTable, {
      relationName: "blockedSolvers",
      fields: [BlockedTasksTable.taskId],
      references: [TaskTable.id],
    }),
    solver: one(UserTable, {
      relationName: "solver",

      fields: [BlockedTasksTable.userId],
      references: [UserTable.id],
    }),
  }),
);
export const workspaceRelations = relations(
  WorkspaceTable,
  ({ one, many }) => ({
    task: one(TaskTable, {
      relationName: "task",
      fields: [WorkspaceTable.taskId],
      references: [TaskTable.id],
    }),
    solver: one(UserTable, {
      relationName: "solver",
      fields: [WorkspaceTable.solverId],
      references: [UserTable.id],
    }),
    workspaceFiles: many(WorkspaceFilesTable),
  }),
);
export const workspaceFilesRelation = relations(
  WorkspaceFilesTable,
  ({ one }) => ({
    workspace: one(WorkspaceTable, {
      fields: [WorkspaceFilesTable.workspaceId],
      references: [WorkspaceTable.id],
    }),
    solutionFile: one(SolutionFilesTable, {
      fields: [WorkspaceFilesTable.id],
      references: [SolutionFilesTable.workspaceFileId],
      relationName: "solutionFile",
    }),
  }),
);
export const TaskFileTableRelation = relations(TaskFileTable, ({ one }) => ({
  taskFiles: one(TaskTable, {
    fields: [TaskFileTable.taskId],
    references: [TaskTable.id],
    relationName: "taskFiles",
  }),
}));

export const SolutionTableRelation = relations(
  SolutionTable,
  ({ many, one }) => ({
    solutionFiles: many(SolutionFilesTable, {
      relationName: "solutionFiles",
    }),
    taskSolution: one(TaskTable, {
      fields: [SolutionTable.taskId],
      references: [TaskTable.id],
      relationName: "taskSolution",
    }),
  }),
);
export const SolutionFilesTableRelations = relations(
  SolutionFilesTable,
  ({ one }) => ({
    solution: one(SolutionTable, {
      fields: [SolutionFilesTable.solutionId],
      references: [SolutionTable.id],
      relationName: "solutionFiles",
    }),
    solutionFile: one(WorkspaceFilesTable, {
      fields: [SolutionFilesTable.workspaceFileId],
      references: [WorkspaceFilesTable.id],
      relationName: "solutionFile",
    }),
  }),
);
export const RefundTableRelation = relations(RefundTable, ({ one, many }) => ({
  taskRefund: one(TaskTable, {
    fields: [RefundTable.taskId],
    references: [TaskTable.id],
    relationName: "taskRefund",
  }),
  refundModerator: one(UserTable, {
    fields: [RefundTable.moderatorId],
    references: [UserTable.id],
    relationName: "refundModerator",
  }),
}));

export const PaymentTableRelation = relations(
  PaymentTable,
  ({ many, one }) => ({
    payer: one(UserTable, {
      fields: [PaymentTable.userId],
      references: [UserTable.id],
      relationName: "payer",
    }),
  }),
);
export const MentorshipProfileRelations = relations(
  MentorshipProfileTable,
  ({ many, one }) => ({
    solver: many(MentorshipBookingTable, {
      relationName: "solver",
    }),
    mentorSystemDetail: one(UserTable, {
      fields: [MentorshipProfileTable.userId],
      references: [UserTable.id],
      relationName: "mentorSystemDetail",
    }),
  }),
);

export const MentorshipBookingRelations = relations(
  MentorshipBookingTable,
  ({ one, many }) => ({
    solver: one(MentorshipProfileTable, {
      fields: [MentorshipBookingTable.solverId],
      references: [MentorshipProfileTable.userId],
      relationName: "solver",
    }),
    poster: one(UserTable, {
      fields: [MentorshipBookingTable.posterId],
      references: [UserTable.id],
    }),
    bookedSessions: many(MentorshipSessionTable, {
      relationName: "bookedSessions",
    }),
  }),
);

export const MentorshipSessionRelations = relations(
  MentorshipSessionTable,
  ({ one, many }) => ({
    bookedSessions: one(MentorshipBookingTable, {
      fields: [MentorshipSessionTable.bookingId],
      references: [MentorshipBookingTable.id],
      relationName: "bookedSessions",
    }),
    chats: many(MentorshipChatTable, {
      relationName: "chat",
    }),
  }),
);
export const MentorshipChatTableRelations = relations(
  MentorshipChatTable,
  ({ one, many }) => ({
    session: one(MentorshipSessionTable, {
      fields: [MentorshipChatTable.sessionId],
      references: [MentorshipSessionTable.id],
      relationName: "chat",
    }),
    chatFiles: many(MentorshipChatFilesTable, {
      relationName: "chatFiles",
    }),
    chatOwner: one(UserTable, {
      fields: [MentorshipChatTable.sentBy],
      references: [UserTable.id],
      relationName: "chatOwner",
    }),
  }),
);
export const MentorshipChatFilesTableRelations = relations(
  MentorshipChatFilesTable,
  ({ one }) => ({
    chat: one(MentorshipChatTable, {
      fields: [MentorshipChatFilesTable.chatId],
      references: [MentorshipChatTable.id],
      relationName: "chatFiles",
    }),
  }),
);
