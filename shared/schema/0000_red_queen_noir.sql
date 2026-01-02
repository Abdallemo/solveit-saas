CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'PAID', 'CANCELED');--> statement-breakpoint
CREATE TYPE "public"."feedback_category" AS ENUM('TASK', 'MENTORING');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('PENDING', 'SENT');--> statement-breakpoint
CREATE TYPE "public"."method" AS ENUM('SYSTEM', 'EMAIL');--> statement-breakpoint
CREATE TYPE "public"."payment_porpose" AS ENUM('Task Payment', 'Mentor Booking');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('HOLD', 'RELEASED', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PENDING_USER_ACTION');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('PENDING', 'PROCESSING', 'REFUNDED', 'REJECTED', 'FAILED', 'PENDING_USER_ACTION');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'SUBMITTED');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."tier" AS ENUM('POSTER', 'SOLVER', 'SOLVER++');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MODERATOR', 'POSTER', 'SOLVER');--> statement-breakpoint
CREATE TYPE "public"."file_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."product_feedback_type" AS ENUM('feature_request', 'bug_report', 'improvement', 'general');--> statement-breakpoint
CREATE TYPE "public"."support_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE SEQUENCE "public"."ai_test_amount_sequence" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp with time zone,
	"updatedAt" timestamp with time zone,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "ai_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hashed_content" text NOT NULL,
	"reason" text NOT NULL,
	"confidence_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_test_sandbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"admin_id" uuid NOT NULL,
	"test_amount" serial NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blocked_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"description" text NOT NULL,
	"content" jsonb NOT NULL,
	"category" text NOT NULL,
	"author" uuid NOT NULL,
	"publishedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"readTime" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editor_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poster_id" uuid NOT NULL,
	"solver_id" uuid NOT NULL,
	"feedback_type" "feedback_category" NOT NULL,
	"mentor_booking_id" uuid,
	"task_id" uuid,
	"rating" integer DEFAULT 0 NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_source_check" CHECK ((feedback_type = 'TASK' AND task_id IS NOT NULL AND mentor_booking_id IS NULL) OR
          (feedback_type = 'MENTORING' AND task_id IS NULL AND mentor_booking_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mentorship_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solver_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"price" integer,
	"status" "booking_status" DEFAULT 'PENDING' NOT NULL,
	"payment_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_chat_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"uploaded_by_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"is_deleted" boolean DEFAULT false,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mentorship_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seesion_id" uuid NOT NULL,
	"message" text,
	"sent_by" uuid NOT NULL,
	"sent_to" uuid NOT NULL,
	"read_at" timestamp with time zone,
	"pending" boolean,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mentorship_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text DEFAULT '' NOT NULL,
	"avatar" text DEFAULT '/avatars/avatar-4.svg' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"rate_per_hour" real DEFAULT 0 NOT NULL,
	"available_times" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'Asia/Kuala_Lumpur' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mentorship_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mentor_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"session_date" date NOT NULL,
	"time_slot" jsonb NOT NULL,
	"session_start" timestamp with time zone NOT NULL,
	"session_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'HOLD',
	"stripe_payment_intent_id" text NOT NULL,
	"stripe_charge_id" text,
	"purpose" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"release_date" timestamp with time zone,
	CONSTRAINT "payments_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "product_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "product_feedback_type" NOT NULL,
	"subject" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"payment_id" uuid NOT NULL,
	"task_id" uuid,
	"refund_reason" text,
	"refundStatus" "refund_status" DEFAULT 'PENDING',
	"moderatorId" uuid,
	"refunded_at" timestamp with time zone,
	"stripe_refund_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule" text NOT NULL,
	"decription" text NOT NULL,
	"is_active" boolean NOT NULL,
	"admin_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "solution_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solution_id" uuid NOT NULL,
	"workspace_file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"content" jsonb,
	"file_url" text,
	"is_final" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "solver_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"portfolio_url" text,
	"skills" text[] DEFAULT '{}',
	"avg_rating" numeric(3, 1) DEFAULT '0o0' NOT NULL,
	"task_solved" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text NOT NULL,
	"priority" "support_priority" DEFAULT 'low' NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "task_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_deadline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deadline" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_deadline_deadline_unique" UNIQUE("deadline")
);
--> statement-breakpoint
CREATE TABLE "task_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"content" jsonb DEFAULT '{}' NOT NULL,
	"contentText" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"deadline" text DEFAULT '12h' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"uploadedFiles" jsonb DEFAULT '[]' NOT NULL,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"price" integer DEFAULT 10 NOT NULL,
	CONSTRAINT "task_drafts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "task_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" jsonb NOT NULL,
	"price" integer NOT NULL,
	"poster_id" uuid NOT NULL,
	"solver_id" uuid,
	"visibility" "visibility" DEFAULT 'public' NOT NULL,
	"category_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"deadline" text DEFAULT '12h' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"task_status" "task_status" DEFAULT 'OPEN' NOT NULL,
	"assigned_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_details" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"first_name" text,
	"last_name" text,
	"date_of_birth" date,
	"address" jsonb,
	"business" jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"stripe_subscription_item_id" text,
	"stripe_subscription_id" text,
	"tier" "tier" NOT NULL,
	"cancel_at" timestamp,
	"is_cancel_scheduled" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'inactive' NOT NULL,
	"interval" text DEFAULT 'month' NOT NULL,
	"next_billing" timestamp,
	"price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"role" "role" DEFAULT 'POSTER' NOT NULL,
	"stripe_customer_id" text,
	"stripe_account_id" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{"agreedOnTerms":false,"onboardingCompleted":false,"stripeAccountLinked":false}'::jsonb NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solution_workspace_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"uploaded_by_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"is_draft" boolean DEFAULT true,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "file_status" DEFAULT 'PENDING',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solution_workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"solver_id" uuid NOT NULL,
	"content" jsonb DEFAULT '{}',
	"contentText" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp with time zone NOT NULL,
	"level" varchar(10) NOT NULL,
	"message" text NOT NULL,
	"error" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"method" "method" NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_test_sandbox" ADD CONSTRAINT "ai_test_sandbox_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_tasks" ADD CONSTRAINT "blocked_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_tasks" ADD CONSTRAINT "blocked_tasks_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_users_id_fk" FOREIGN KEY ("author") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_poster_id_users_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_solver_id_users_id_fk" FOREIGN KEY ("solver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_mentor_booking_id_mentorship_bookings_id_fk" FOREIGN KEY ("mentor_booking_id") REFERENCES "public"."mentorship_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_bookings" ADD CONSTRAINT "mentorship_bookings_solver_id_users_id_fk" FOREIGN KEY ("solver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_bookings" ADD CONSTRAINT "mentorship_bookings_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_bookings" ADD CONSTRAINT "mentorship_bookings_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_chat_files" ADD CONSTRAINT "mentorship_chat_files_chat_id_mentorship_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."mentorship_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_chat_files" ADD CONSTRAINT "mentorship_chat_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_chats" ADD CONSTRAINT "mentorship_chats_seesion_id_mentor_session_id_fk" FOREIGN KEY ("seesion_id") REFERENCES "public"."mentor_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_chats" ADD CONSTRAINT "mentorship_chats_sent_by_users_id_fk" FOREIGN KEY ("sent_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_chats" ADD CONSTRAINT "mentorship_chats_sent_to_users_id_fk" FOREIGN KEY ("sent_to") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_profiles" ADD CONSTRAINT "mentorship_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_session" ADD CONSTRAINT "mentor_session_booking_id_mentorship_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."mentorship_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_feedback" ADD CONSTRAINT "product_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_moderatorId_users_id_fk" FOREIGN KEY ("moderatorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_rules" ADD CONSTRAINT "ai_rules_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_files" ADD CONSTRAINT "solution_files_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_files" ADD CONSTRAINT "solution_files_workspace_file_id_solution_workspace_files_id_fk" FOREIGN KEY ("workspace_file_id") REFERENCES "public"."solution_workspace_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_workspace_id_solution_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."solution_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solver_profile" ADD CONSTRAINT "solver_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_drafts" ADD CONSTRAINT "task_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_files" ADD CONSTRAINT "task_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_poster_id_users_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_solver_id_users_id_fk" FOREIGN KEY ("solver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_category_id_task_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."task_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deadline_task_deadline_deadline_fk" FOREIGN KEY ("deadline") REFERENCES "public"."task_deadline"("deadline") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_details" ADD CONSTRAINT "user_details_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_workspace_files" ADD CONSTRAINT "solution_workspace_files_workspace_id_solution_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."solution_workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_workspace_files" ADD CONSTRAINT "solution_workspace_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ADD CONSTRAINT "solution_workspaces_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_workspaces" ADD CONSTRAINT "solution_workspaces_solver_id_users_id_fk" FOREIGN KEY ("solver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "blocked_taskId_idx" ON "blocked_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "blocked_userId_idx" ON "blocked_tasks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_blocked_task" ON "blocked_tasks" USING btree ("user_id","task_id");--> statement-breakpoint
CREATE INDEX "media_files_filePath_idx" ON "editor_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "mentorship_bookings_solverId_idx" ON "mentorship_bookings" USING btree ("solver_id");--> statement-breakpoint
CREATE INDEX "mentorship_bookings_posterId_idx" ON "mentorship_bookings" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "mentorship_bookings_paymentId_idx" ON "mentorship_bookings" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "mentorship_bookings_status_idx" ON "mentorship_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "mentorship_chat_files_chatId_idx" ON "mentorship_chat_files" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "mentorship_chat_files_filePath_idx" ON "mentorship_chat_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "mentorship_chats_sessionId_idx" ON "mentorship_chats" USING btree ("seesion_id");--> statement-breakpoint
CREATE INDEX "mentorship_profiles_userId_idx" ON "mentorship_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "mentor_session_bookingId_idx" ON "mentor_session" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "payments_userId_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "refunds_moderatorId_idx" ON "refunds" USING btree ("moderatorId");--> statement-breakpoint
CREATE INDEX "refunds_paymentId_idx" ON "refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "refunds_taskId_idx" ON "refunds" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "refund_status_idx" ON "refunds" USING btree ("refundStatus");--> statement-breakpoint
CREATE INDEX "solution_files_solutionId_idx" ON "solution_files" USING btree ("solution_id");--> statement-breakpoint
CREATE INDEX "solution_files_workspaceFileId_idx" ON "solution_files" USING btree ("workspace_file_id");--> statement-breakpoint
CREATE INDEX "solutions_taskId_idx" ON "solutions" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "solutions_workspaceId_idx" ON "solutions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "task_comments_taskId_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_comments_userId_idx" ON "task_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_deadline_idx" ON "task_deadline" USING btree ("deadline");--> statement-breakpoint
CREATE INDEX "task_drafts_userId_idx" ON "task_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_files_taskId_idx" ON "task_files" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_files_filePath_idx" ON "task_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "task_poster_idx" ON "tasks" USING btree ("poster_id");--> statement-breakpoint
CREATE INDEX "task_solver_idx" ON "tasks" USING btree ("solver_id");--> statement-breakpoint
CREATE INDEX "task_status_idx" ON "tasks" USING btree ("task_status");--> statement-breakpoint
CREATE INDEX "task_created_idx" ON "tasks" USING btree ("assigned_at");--> statement-breakpoint
CREATE INDEX "subscription_userId_idx" ON "subscription" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "user_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "solution_workspace_files_workspaceId_idx" ON "solution_workspace_files" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "solution_workspace_files_uploadedById_idx" ON "solution_workspace_files" USING btree ("uploaded_by_id");--> statement-breakpoint
CREATE INDEX "solution_workspace_files_filePath_idx" ON "solution_workspace_files" USING btree ("file_path");--> statement-breakpoint
CREATE INDEX "solution_workspaces_taskId_idx" ON "solution_workspaces" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "solution_workspaces_solverId_idx" ON "solution_workspaces" USING btree ("solver_id");