import {
    timestamp,
    pgTable,
    text,
    primaryKey,
    integer,
    pgEnum,
    uuid,
    boolean,
} from "drizzle-orm/pg-core"

export const UserRole = pgEnum('role',['ADMIN','MODERATOR','POSTER','SOLVER'])
export const TierEnum = pgEnum('tier',['BASIC','PREMIUM'])
export const TaskCatagory = pgEnum('catagory',['mathematics','technology','....'])//will add other catagories later
export const PaymentStatus = pgEnum('payment_status', [
  'PENDING',
  'SUCCEEDED',
  'FAILED',
  'CANCELED',
  'REFUNDED'
])
export const TaskStatusEnum = pgEnum('task_status', ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']);


export type TierType = (typeof TierEnum.enumValues)[number];
export type UserRoleType = (typeof UserRole.enumValues)[number];


export const UserTable = pgTable("user", {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text("name"),
    email: text("email").unique(),
    password:text("password"),
    role:UserRole("role").default('POSTER'),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
})


export const AccountTable = pgTable(
    "account",
    {
        userId: uuid('userId').notNull()
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
)

export const VerificationTokenTable = pgTable(
    "verificationToken",
    {
      id: uuid().defaultRandom().notNull(),
      email: text("email"),
      token: text("token").unique(),
      expires: timestamp("expires", { mode: "date" }).notNull()

    },
    (verificationToken) => [
      {
        compositePk: primaryKey({
          columns: [verificationToken.email, verificationToken.token],
        }),
      },
    ]
  )

export const UserSubscriptionTable = pgTable('subscription',{
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid('userId').notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
    stripeSubscriptionItemId: text("stripe_subscription_item_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripeCustomerId: text("stripe_customer_id"),
    tier: TierEnum("tier").notNull(),
})


export const PaymentTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => UserTable.id), 
  amount: integer("amount").notNull(), 
  status: PaymentStatus("status").default("PENDING"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  purpose: text("purpose"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});


export const TaskTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  description: text("description"),
  content: text('content'),
  posterId: uuid("poster_id").references(() => UserTable.id).notNull(),
  solverId: uuid("solver_id").references(() => UserTable.id),
  isPublic: boolean("is_public").default(true), 
  category: TaskCatagory("category"),
  paymentId: uuid("payment_id").references(() => PaymentTable.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  status: TaskStatusEnum("status").default("OPEN"),
  deadline: timestamp("deadline", { mode: "date" }),
});
export const TaskFileTable = pgTable("task_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => TaskTable.id),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});

export const RefundTable = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").notNull().references(() => PaymentTable.id),
  taskId: uuid('task_id').notNull().references(()=>TaskTable.id),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at", { mode: "date" }).defaultNow(),
  stripeRefundId: text("stripe_refund_id"),
});


export const TaskCommentTable = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => TaskTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => UserTable.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});


export const WorkspaceTable = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => TaskTable.id),
  solverId: uuid("solver_id").notNull().references(() => UserTable.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const WorkspaceFilesTable = pgTable("workspace_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => WorkspaceTable.id),
  uploadedById: uuid("uploaded_by_id").notNull().references(() => UserTable.id),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  isDraft: boolean("is_draft").default(true),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});


export const SolutionTable = pgTable("solutions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id").notNull().references(() => WorkspaceTable.id),
  content: text("content"),
  fileUrl: text("file_url"),
  isFinal: boolean("is_final").default(false), 
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});


export const MentorshipProfileTable = pgTable("mentorship_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => UserTable.id),
  title: text("title"),
  description: text("description"),
  ratePerHour: integer("rate_per_hour"),
  availableTimes: text("available_times"), 
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),

});

export const MentorshipChatTable = pgTable("mentorship_chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  mentorId: uuid("mentor_id").notNull().references(() => UserTable.id,{onDelete:'cascade'}),
  posterId: uuid("poster_id").notNull().references(() => UserTable.id,{onDelete:'cascade'}),
  message: text("message"),
  sentBy: uuid("sent_by").notNull().references(() => UserTable.id),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});


export const MentorshipChatFilesTable = pgTable("mentorship_chat_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id").notNull().references(() => MentorshipChatTable.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).defaultNow(),
});

export const MentorSessionTable = pgTable("mentor_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id").notNull().references(() => TaskTable.id),
  posterId: uuid("poster_id").notNull().references(() => UserTable.id),
  solverId: uuid("solver_id").notNull().references(() => UserTable.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});


export const MentorshipBookingTable = pgTable("mentorship_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  solverId: uuid("solver_id").notNull().references(() => UserTable.id),
  posterId: uuid("student_id").notNull().references(() => UserTable.id),
  bookingTime: timestamp("booking_time", { mode: "date" }).notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  paymentId: uuid("payment_id").references(() => PaymentTable.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
export const RulesTable = pgTable("ai_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruleList:text('rule_list').notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
