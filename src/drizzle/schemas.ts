import { relations } from "@/drizzle/relations";
import { AvailabilitySlot } from "@/features/mentore/server/types";
import { Address, Business } from "@/features/users/server/user-types";
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  json,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

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
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
  "REFUNDED",
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
export const RefundStatusEnum = pgEnum("refund_status", [
  "PENDING",
  "PROCESSING",
  "REFUNDED",
  "REJECTED",
  "FAILED",
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

export const FeedbackType = pgEnum("feedback_category", ["TASK", "MENTORING"]);
export const TaskVisibility = pgEnum("visibility", ["public", "private"]);
export type taskTableType = typeof TaskTable.$inferInsert;
export type PaymentPorposeType = (typeof PaymentPorposeEnum.enumValues)[number];
export type TierType = (typeof TierEnum.enumValues)[number];
export type UserRoleType = (typeof UserRole.enumValues)[number];
export type TaskCategoryType = typeof TaskCategoryTable.$inferSelect;
export type TaskStatusType = (typeof TaskStatusEnum.enumValues)[number];
export type MentorChatStatusType = (typeof MentorChatStatus.enumValues)[number];
export type MentorChatFileStatusType =
  (typeof MentorChatFileStatus.enumValues)[number];
export type PaymentStatusType = (typeof PaymentStatus.enumValues)[number];
export type RefundStatusEnumType = (typeof RefundStatusEnum.enumValues)[number];
export type PaymentPorposeEnumType =
  (typeof PaymentPorposeEnum.enumValues)[number];

export const UserTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  role: UserRole("role").default("POSTER"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeAccountId: text("stripe_account_id"),
  stripeAccountLinked: boolean("stripe_account_linked")
    .notNull()
    .default(false),

  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
export const UserDetails = pgTable("user_details", {
  userId: uuid("user_id")
    .primaryKey()
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  firstName: text("first_name"),
  lastName: text("last_name"),
  dateOfBirth: date("date_of_birth"),
  address: json("address").$type<Address>(),
  business: json("business").$type<Business>(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const AccountTable = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const VerificationTokenTable = pgTable(
  "verificationToken",
  {
    id: uuid().defaultRandom().notNull(),
    email: text("email"),
    token: text("token").unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.email, verificationToken.token],
      }),
    },
  ]
);

export const UserSubscriptionTable = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  stripeSubscriptionItemId: text("stripe_subscription_item_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  tier: TierEnum("tier").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

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
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
export const PaymentTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  status: PaymentStatus("status").default("HOLD"),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
  stripeChargeId: text("stripe_charge_id"),
  purpose: text("purpose"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  releaseDate: timestamp("release_date", { mode: "date" }),
});

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
    feedbackType: FeedbackType("feedback_type").notNull(),
    mentorBookingId: uuid("mentor_booking_id").references(
      () => MentorshipBookingTable.id
    ),
    taskId: uuid("task_id").references(() => TaskTable.id, {
      onDelete: "cascade",
    }),
    rating: integer("rating").default(0).notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    feedbackSourceCheck: check(
      "feedback_source_check",
      sql`(feedback_type = 'TASK' AND task_id IS NOT NULL AND mentor_booking_id IS NULL) OR 
        (feedback_type = 'MENTORING' AND task_id IS NULL AND mentor_booking_id IS NOT NULL)`
    ),
  })
);

export const TaskTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  price: integer("price"),
  posterId: uuid("poster_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  solverId: uuid("solver_id").references(() => UserTable.id, {
    onDelete: "cascade",
  }),
  visibility: TaskVisibility("visibility").default("public"),
  categoryId: uuid("category_id")
    .references(() => TaskCategoryTable.id, { onDelete: "no action" })
    .notNull(),
  paymentId: uuid("payment_id").references(() => PaymentTable.id, {
    onDelete: "cascade",
  }),
  deadline: text("deadline").default("12h"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  status: TaskStatusEnum("task_status").default("OPEN"),
  assignedAt: timestamp("assigned_at", { mode: "date" }),
});
export const BlockedTasksTable = pgTable("blocked_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  reason: text("reason"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
export const TaskDraftTable = pgTable("task_drafts", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  title: text("title").default("").notNull(),
  description: text("description").default("").notNull(),
  content: text("content").default("").notNull(),
  category: text("category").default("").notNull(),
  deadline: text("deadline").default("12h").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  uploadedFiles: json("uploadedFiles").default("[]").notNull(),
  visibility: TaskVisibility("visibility").default("public").notNull(),
  price: integer("price").default(10).notNull(),
});

export const TaskFileTable = pgTable("task_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  storageLocation: text("file_location").notNull(),
  filePath: text("file_path").notNull(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});
/* 

*/
export const TaskCategoryTable = pgTable("task_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
export const TaskDeadlineTable = pgTable("task_deadline", {
  id: uuid("id").primaryKey().defaultRandom(),
  deadline: text("deadline").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const RefundTable = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id")
    .notNull()
    .references(() => PaymentTable.id),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  refundReason: text("refund_reason"),
  refundStatus: RefundStatusEnum().default("PENDING"),
  moderatorId: uuid("moderatorId").references(() => UserTable.id),
  refundedAt: timestamp("refunded_at", { mode: "date" }),
  stripeRefundId: text("stripe_refund_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const TaskCommentTable = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const WorkspaceTable = pgTable("solution_workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  solverId: uuid("solver_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  content: text("content"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).defaultNow(),
});

export const WorkspaceFilesTable = pgTable("solution_workspace_files", {
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
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export const SolutionTable = pgTable("solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => WorkspaceTable.id, { onDelete: "cascade" }),
  taskId: uuid("task_id")
    .notNull()
    .references(() => TaskTable.id, { onDelete: "cascade" }),
  content: text("content"),
  fileUrl: text("file_url"),
  isFinal: boolean("is_final").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});
export const SolutionFilesTable = pgTable("solution_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  solutionId: uuid("solution_id")
    .notNull()
    .references(() => SolutionTable.id, { onDelete: "cascade" }),
  workspaceFileId: uuid("workspace_file_id")
    .notNull()
    .references(() => WorkspaceFilesTable.id, { onDelete: "cascade" }),
});
export const MentorshipProfileTable = pgTable("mentorship_profiles", {
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
  availableTimes: json("available_times")
    .notNull()
    .$type<AvailabilitySlot[]>()
    .default([]),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
export const MentorshipSessionTable = pgTable("mentor_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id")
    .notNull()
    .references(() => MentorshipBookingTable.id, { onDelete: "cascade" }),
  sessionDate: date("session_date").notNull(),
  timeSlot: json("time_slot").notNull().$type<AvailabilitySlot>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const MentorshipBookingTable = pgTable("mentorship_bookings", {
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
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const MentorshipChatTable = pgTable("mentorship_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  seesionId: uuid("seesion_id")
    .notNull()
    .references(() => MentorshipSessionTable.id, { onDelete: "cascade" }),
  message: text("message"),
  sentBy: uuid("sent_by")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const MentorshipChatFilesTable = pgTable("mentorship_chat_files", {
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
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});

export const RulesTable = pgTable("ai_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  rule: text("rule").notNull(),
  description: text("decription").notNull(),
  isActive: boolean("is_active").notNull(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => UserTable.id, { onDelete: "no action" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  method: NotificationMethodsEnum("method").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const logTable = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  timestamp: timestamp("timestamp").notNull(),
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
}));

export const accountRelations = relations(AccountTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [AccountTable.userId],
    references: [UserTable.id],
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
}));
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
  })
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
  })
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
  })
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
  })
);

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
  })
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
  })
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
  })
);
export const MentorshipProfileRelations = relations(
  MentorshipProfileTable,
  ({ many }) => ({
    solver: many(MentorshipBookingTable, {
      relationName: "solver",
    }),
  })
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
  })
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
  })
);
export const MentorshipChatTableRelations = relations(
  MentorshipChatTable,
  ({ one, many }) => ({
    session: one(MentorshipSessionTable, {
      fields: [MentorshipChatTable.seesionId],
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
  })
);
export const MentorshipChatFilesTableRelations = relations(
  MentorshipChatFilesTable,
  ({ one }) => ({
    chat: one(MentorshipChatTable, {
      fields: [MentorshipChatFilesTable.chatId],
      references: [MentorshipChatTable.id],
      relationName: "chatFiles",
    }),
  })
);
