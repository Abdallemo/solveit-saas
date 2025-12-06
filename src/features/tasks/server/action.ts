"use server";
import db, { DBTransaction } from "@/drizzle/db";
import {
  BlockedTasksTable,
  PaymentPorposeEnumType,
  PaymentPorposeType,
  PaymentStatusType,
  PaymentTable,
  RefundTable,
  SolutionFilesTable,
  SolutionTable,
  TaskCategoryTable,
  TaskCommentTable,
  TaskDeadlineTable,
  TaskDraftTable,
  TaskFileTable,
  TaskTable,
  WorkspaceFilesTable,
  WorkspaceTable,
} from "@/drizzle/schemas";
import { env } from "@/env/server";
import { validateContentWithAi } from "@/features/Ai/server/action";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import { deleteFileFromR2 } from "@/features/media/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { Notifier } from "@/features/notifications/server/notifier";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { SolutionError } from "@/features/tasks/lib/errors";
import {
  getAllModertorIDs,
  getBlockedSolver,
  getTaskCatagoryId,
  getWorkspaceById,
  getWorkspaceByTaskId,
} from "@/features/tasks/server/data";
import type {
  SolutionById,
  WorkpaceWithRelationType,
} from "@/features/tasks/server/task-types";
import {
  taskRefundSchema,
  workspaceFileType,
} from "@/features/tasks/server/task-types";
import {
  getServerUserSubscriptionById,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { publicUserColumns } from "@/features/users/server/user-types";
import { withRevalidateTag } from "@/lib/cache";
import { generateRefundNotificationEmail } from "@/lib/email/templates/refunds";
import {
  DatabaseError,
  ServiceLayerErrorType,
  TaskNotFoundError,
  UnauthorizedError,
} from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { stripe } from "@/lib/stripe";
import { to } from "@/lib/utils/async";
import {
  getCurrentServerTime,
  parseDeadlineV2,
  truncateText,
} from "@/lib/utils/utils";
import { JSONContent } from "@tiptap/react";
import {
  addDays,
  differenceInMilliseconds,
  isAfter,
  isBefore,
  isPast,
} from "date-fns";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//the Magic Parts 🪄

export async function calculateTaskProgress(solverId: string, taskId: string) {
  const workspace = await getWorkspaceByTaskId(taskId, solverId);
  if (!workspace) return -1;

  const deadline = parseDeadlineV2(
    workspace.task.deadline!,
    workspace.createdAt!,
  );
  if (!deadline) return -1;

  const startTime = workspace.createdAt!.getTime();
  const currentTime = Date.now();

  const timePassed = currentTime - startTime;
  const totalTime = deadline.getTime() - startTime;

  return Math.min(Math.max((timePassed / totalTime) * 100, 0), 100);
}
export async function calculateTaskProgressV2(
  solverId: string,
  taskId: string,
) {
  const currentTime = new Date();

  const workspace = await getWorkspaceByTaskId(taskId, solverId);

  if (!workspace) {
    return { timePassed: null, percentage: null, totalTime: null };
  }
  const startTime = workspace.createdAt;
  const deadline = parseDeadlineV2(workspace.task.deadline, startTime);

  if (!deadline) {
    return { timePassed: null, percentage: null, totalTime: null };
  }

  const totalTime = differenceInMilliseconds(deadline, startTime);

  const timePassed = differenceInMilliseconds(currentTime, startTime);

  let percentage;

  if (isBefore(currentTime, startTime)) {
    percentage = 0;
  } else if (isAfter(currentTime, deadline)) {
    percentage = 100;
  } else if (totalTime <= 0) {
    percentage = 100;
  } else {
    percentage = (timePassed / totalTime) * 100;
  }

  percentage = Math.min(Math.max(percentage, 0), 100);

  return {
    timePassed: timePassed,
    percentage: percentage,
    totalTime,
    deadline,
  };
}
export async function createTaskAction(
  userId: string,
  title: string,
  description: string,
  category: string,
  content: JSONContent,
  visibility: string,
  deadline: string,
  price: number,
  uploadedFiles: UploadedFileMeta[],
  paymentId: string,
) {
  logger.info("starting creat Task prosess");
  const categoryId = await getTaskCatagoryId(category);
  logger.info("passed userId in create Task action is:" + userId);
  if (!categoryId || categoryId == undefined) return;
  try {
    await db.transaction(async (dx) => {
      const [taskId] = await dx
        .insert(TaskTable)
        .values({
          categoryId: categoryId.id,
          posterId: userId,
          title: title,
          content: content,
          description: description,
          price: price,
          status: "OPEN",
          visibility: visibility == "public" ? "public" : "private",
          deadline,
          paymentId,
        })
        .returning({ taskId: TaskTable.id });

      if (uploadedFiles.length > 0) {
        logger.info("inserting into Task files Table", { taskId: taskId });
        await dx.insert(TaskFileTable).values(
          uploadedFiles.map((file) => ({
            taskId: taskId.taskId,
            fileName: file.fileName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            filePath: file.filePath,
            storageLocation: file.storageLocation,
          })),
        );
      }
      await dx
        .delete(TaskDraftTable)
        .where(eq(TaskDraftTable.userId, userId))
        .returning();
    });
    logger.info("Task created successfully!");
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Failed to Create Task", { error: error });
      throw new Error("Failed to Create Task , error:+" + error.message, {
        cause: error,
      });
    }
    logger.error("Failed to Create Task", { error: error });
    throw new Error("Failed to Create Task , internal error ");
  }
}
export async function taskPaymentInsetion(
  status: PaymentStatusType,
  amount: number,
  userId: string,
  stripePaymentIntentId: string,
  purpose?: PaymentPorposeType,
  stripeChargeId?: string,
) {
  logger.info("Saving into Payment table");
  const payment = await db
    .insert(PaymentTable)
    .values({
      amount,
      userId,
      purpose,
      status,
      stripeChargeId,
      stripePaymentIntentId,
    })
    .returning({ paymentId: PaymentTable.id });
  return [payment][0][0].paymentId;
}
export async function createTaksPaymentCheckoutSession(values: {
  content: string;
  price: number;
  userId: string;
  deadlineStr: string;
  draftTaskId: string;
}) {
  const { price, userId, deadlineStr, draftTaskId, content } = values;
  const referer = await getServerReturnUrl();
  try {
    const res = await validateContentWithAi({
      content: content,
      adminMode: false,
    });

    if (res.violatesRules) return;
    const currentUser = await getServerUserSession();
    if (!currentUser?.id) redirect("/login");
    const userSubscription = await getServerUserSubscriptionById(
      currentUser?.id!,
    );
    const user = await getUserById(userId);
    if (!user || !user.id) return;
    if (!currentUser.email || !currentUser!.id) return;
    if (userSubscription?.tier == "SOLVER") return;
    let customerId = user.stripeCustomerId;
    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: currentUser.email,
        name: user.name ?? "",
        metadata: {
          userId: userId,
        },
      });
      customerId = newCustomer.id;
      await UpdateUserField(
        {
          id: user.id,
        },
        { stripeCustomerId: customerId },
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId!,

      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: "Task Payment" as PaymentPorposeEnumType,
            },
            unit_amount: price * 100,
          },

          quantity: 1,
        },
      ],

      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          setup_future_usage: "off_session",
        },
      },
      payment_intent_data: {
        setup_future_usage: "off_session",
      },

      metadata: {
        userId,
        deadlineStr,
        type: "Task Payment" as PaymentPorposeEnumType,
        draftTaskId: draftTaskId,
      },
      cancel_url: `${env.NEXTAUTH_URL}/dashboard/poster/new-task?cancel=true`,
      success_url: `${env.NEXTAUTH_URL}/dashboard/poster/your-tasks/?session_id={CHECKOUT_SESSION_ID}&id=${draftTaskId}`,
      saved_payment_method_options: {
        allow_redisplay_filters: ["always", "limited", "unspecified"],
        payment_method_save: "enabled",
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    redirect(session.url);
  } catch (error) {
    throw error;
  }
}
export async function validatePaymentIntent(piId: string) {
  const intent = await stripe.paymentIntents.retrieve(piId);
  return intent.status === "succeeded";
}
export async function saveDraftTask(
  title: string,
  description: string,
  content: string,
  contentText: string,
  userId: string,
  category: string,
  price: number,
  visibility: "public" | "private",
  deadline: string,
  uploadedFiles: UploadedFileMeta[] = [],
) {
  const now = new Date();
  try {
    const oldTask = await db.query.TaskDraftTable.findFirst({
      where: (table, fn) => fn.eq(table.userId, userId),
    });
    const transform: JSONContent = JSON.parse(content);
    if (oldTask) {
      await db
        .update(TaskDraftTable)
        .set({
          title,
          description,
          content: transform,
          category,
          price,
          visibility,
          deadline,
          uploadedFiles,
          updatedAt: now,
          contentText,
        })
        .where(eq(TaskDraftTable.userId, userId));
    } else {
      await db.insert(TaskDraftTable).values({
        title,
        description,
        userId,
        content: transform,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles,
        contentText,
      });
    }
    return await db.query.TaskDraftTable.findFirst({
      where: (table, fn) => fn.eq(table.userId, userId),
    });
  } catch (e) {
    await db.delete(TaskDraftTable).where(eq(TaskDraftTable.userId, userId));
  }
}
export async function assignTaskToSolverById(values: {
  taskId: string;
  solverId: string;
}) {
  const { solverId, taskId } = values;
  try {
    const startDateOperation = new Date(); //new stratgy
    const oldTask = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
      with: { blockedSolvers: true },
    });
    if (!oldTask) throw new Error("no such task available");
    if (oldTask.solverId) throw new Error("task already assigned to solver");
    if (oldTask.blockedSolvers && oldTask.blockedSolvers.length > 0)
      throw new Error(
        `you are blocked From this Task, Reason:${
          oldTask.blockedSolvers[0].reason ?? "unknown"
        }`,
      );

    const result = await db.transaction(async (tx) => {
      const updated = await tx
        .update(TaskTable)
        .set({
          solverId: solverId,
          status: "ASSIGNED",
          updatedAt: startDateOperation,
          assignedAt: startDateOperation,
        })
        .where(and(eq(TaskTable.id, taskId), isNull(TaskTable.solverId)))
        .returning();

      if (!updated.length) return null;
      const [_, freshVerison] = await Promise.all([
        createWorkspace(tx, solverId, taskId, startDateOperation),
        tx.query.TaskTable.findFirst({
          where: (table, fn) => fn.eq(table.id, taskId),
          with: {
            poster: true,
            solver: true,
          },
        }),
      ]);

      return freshVerison;
    });

    if (!result) {
      throw new Error("unable to assign task");
    }

    const deadline = parseDeadlineV2(
      result.deadline,
      startDateOperation,
    )?.toLocaleString(undefined);
    Notifier()
      .email({
        receiverEmail: result?.poster.email!,
        subject: "task Picked",
        content: `you Task titled <h4>"${result?.title}"</h4> is picked by ${result?.solver?.name}\n you will reciev your solution on ${deadline}`,
      })
      .system({
        receiverId: result?.poster.id!,
        subject: "Task Picked",
        content: `you Task titled "${result?.title}" is picked by ${result?.solver?.name}\n you will reciev your solution on ${deadline}`,
      });

    revalidatePath(`/your-tasks/${taskId}`);
    return {
      success: "Task successfully assigned to you!",
    };
  } catch (error) {
    console.error(error);
    throw new Error("unable to assign task");
  }
}
export async function createWorkspace(
  dx: DBTransaction,
  solverId: string,
  taskId: string,
  startDateOperation: Date,
) {
  const newWorkspace = await dx
    .insert(WorkspaceTable)
    .values({
      solverId: solverId,
      taskId: taskId,
      createdAt: startDateOperation,
    })
    .returning();
  return newWorkspace[0];
}
export async function addSolverToTaskBlockList(
  userId: string,
  taskId: string,
  reason: string,
  dx?: DBTransaction,
) {
  if (dx) {
    await dx.insert(BlockedTasksTable).values({
      userId,
      taskId,
      reason,
    });
  } else {
    await db.insert(BlockedTasksTable).values({
      userId,
      taskId,
      reason,
    });
  }
}
export async function createCatagory(name: string): ServiceLayerErrorType {
  const [_, error] = await to(
    db.insert(TaskCategoryTable).values({
      name,
    }),
  );
  if (error) {
    if (DatabaseError.isDuplicateKeyError(error)) {
      return {
        error: "The provided catagory value conflicts with an existing record.",
      };
    }
    return { error: "unable to create deadline" };
  }

  withRevalidateTag("category-data-cache");
  return { error: null };
}
export async function deleteCatagory(id: string): ServiceLayerErrorType {
  const [_, error] = await to(
    db.delete(TaskCategoryTable).where(eq(TaskCategoryTable.id, id)),
  );
  if (error) {
    logger.error(
      `unable to delete category. cause:${(error as Error).message}`,
      {
        message: (error as Error).message,
        cause: (error as Error).cause,
      },
    );
    return {
      error: "unable to delete category",
    };
  }
  withRevalidateTag("category-data-cache");
  return {
    error: null,
  };
}
export async function createDeadline(deadline: string): ServiceLayerErrorType {
  const match = deadline.match(/^(\d+)([hdwmy])$/);
  if (!match) {
    return { error: "invalid deadline format" };
  }
  const [_, error] = await to(
    db.insert(TaskDeadlineTable).values({
      deadline,
    }),
  );
  if (error) {
    if (DatabaseError.isDuplicateKeyError(error)) {
      return {
        error: "The provided deadline value conflicts with an existing record.",
      };
    }
    return { error: "unable to create deadline" };
  }
  withRevalidateTag("deadline-data-cache");
  return { error: null };
}
export async function deleteDeadline(id: string): ServiceLayerErrorType {
  const [_, error] = await to(
    db.delete(TaskDeadlineTable).where(eq(TaskDeadlineTable.id, id)),
  );
  if (error) {
    return { error: "unable to delete deadline" };
  }
  withRevalidateTag("deadline-data-cache");
  return { error: null };
}

export async function autoSaveDraftWorkspace(
  content: string,
  solverId: string,
  taskId: string,
) {
  if (!solverId || !taskId) return;

  try {
    const oldTask = await db.query.WorkspaceTable.findFirst({
      where: (table, fn) => fn.eq(table.taskId, taskId),
    });
    const transform: JSONContent = JSON.parse(content);
    if (oldTask) {
      await db
        .update(WorkspaceTable)
        .set({
          content: transform,
        })
        .where(eq(WorkspaceTable.taskId, taskId));
    } else {
      await db.insert(WorkspaceTable).values({
        content: transform,
        solverId,
        taskId,
      });
    }
  } catch (e) {
    await db.delete(WorkspaceTable).where(eq(WorkspaceTable.taskId, taskId));
  }
}
export async function deleteFileFromWorkspace(fileId: string) {
  try {
    const file = await db.query.WorkspaceFilesTable.findFirst({
      where: eq(WorkspaceFilesTable.id, fileId),
    });

    if (!file) {
      return { error: "File not found" };
    }
    await deleteFileFromR2(file.filePath);
    await db
      .delete(WorkspaceFilesTable)
      .where(eq(WorkspaceFilesTable.id, fileId));
    revalidatePath(`workspace/${file.workspaceId}`);
    return {
      file: file.fileName,
      success: `${truncateText(file.fileName, 10)} Deleted Successfuly`,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Something went Wrong", { cause: error });
  }
}
export async function saveFileToWorkspaceDB({
  fileName,
  fileType,
  fileSize,
  filePath,
  storageLocation,
  workspaceId,
  isDraft,
  uploadedById,
}: workspaceFileType) {
  if (isDraft == false) return;

  const newFile = await db
    .insert(WorkspaceFilesTable)
    .values({
      fileName,
      filePath,
      fileSize,
      fileType,
      storageLocation,
      workspaceId,
      isDraft,
      uploadedById,
    })
    .returning();
  return newFile[0];
}
export async function publishSolution(values: {
  workspaceId: string;
  content: JSONContent;
  solverId: string;
}) {
  const { content, solverId, workspaceId } = values;
  try {
    const workspace = await getWorkspaceById(workspaceId, solverId);

    if (!workspace?.task) {
      return {
        success: null,
        workspace: workspace,
        error: new TaskNotFoundError().data.message,
      };
    }
    if (!workspace) {
      return {
        success: null,
        workspace: workspace,
        error: new SolutionError(
          "Unable to locate the specified workspace. Please verify the ID and try again.",
        ).code,
      };
    }
    await handleTaskDeadline(workspace);
    const alreadyBlocked = await getBlockedSolver(
      workspace.solverId,
      workspace.task.id,
    );

    if (alreadyBlocked) {
      return {
        success: null,
        workspace: workspace,
        error: new SolutionError(
          "Submission window has closed. You can no longer publish a solution for this task.",
        ).code,
      };
    }
    const workspaceStats = workspace.task.status;
    if (
      workspaceStats === "COMPLETED" ||
      workspaceStats === "SUBMITTED" ||
      workspaceStats === "OPEN"
    ) {
      return {
        success: null,
        workspace: workspace,
        error: new SolutionError(
          "This solution has already been marked as completed. No further submissions are allowed.",
        ).code,
      };
    }
    await db.transaction(async (dx) => {
      const solution = await dx
        .insert(SolutionTable)
        .values({
          workspaceId,
          taskId: workspace.taskId,
          content: content,
          isFinal: true,
          updatedAt: new Date(),
        })
        .returning();

      if (!solution || solution.length === 0 || !solution[0].id) {
        return {
          success: null,
          workspace: workspace,
          error: new SolutionError(
            "Failed to create a solution record. Please try again or contact support if the issue persists.",
          ).code,
        };
      }
      await Promise.all(
        workspace?.workspaceFiles.map(async (workspaceFile) => {
          await dx.insert(SolutionFilesTable).values({
            solutionId: solution[0].id,
            workspaceFileId: workspaceFile.id,
          });

          await dx
            .update(WorkspaceFilesTable)
            .set({ isDraft: false })
            .where(eq(WorkspaceFilesTable.id, workspaceFile.id));
        }),
      );
      await dx
        .update(TaskTable)
        .set({ status: "SUBMITTED", updatedAt: new Date() })
        .where(eq(TaskTable.id, workspace?.taskId));
    });
    const updatedWorkspace = await getWorkspaceById(workspaceId, solverId);

    Notifier()
      .email({
        subject: "Task Submited",
        content: `you Task titiled ${workspace.task.title}
          has bean submited please review it with in 7days `,
        receiverEmail: workspace.task.poster.email!,
      })
      .system({
        subject: "Task Submited",
        content: `you Task titiled ${workspace.task.title}
          has bean submited please review it with in 7days `,
        receiverId: workspace.task.poster.id!,
      });

    return {
      success: "Successfully published solution!" as const,
      workspace: updatedWorkspace,
      error: null,
    };
  } catch (error) {
    return {
      success: null,
      workspace: null,
      error: new SolutionError(
        "Unable to publish the solution due to an unexpected issue. Please try again later.",
      ).code,
    };
  }
}
export async function handleTaskDeadline(
  solverWorksapce: WorkpaceWithRelationType,
) {
  const status = solverWorksapce.task.status;

  if (!(status === "IN_PROGRESS" || status === "ASSIGNED")) {
    return;
  }

  const { percentage, deadline } = await calculateTaskProgressV2(
    solverWorksapce.solverId,
    solverWorksapce.taskId,
  );
  console.log("in this");
  if (deadline && !isPast(deadline)) return;

  try {
    const alreadyBlocked = await getBlockedSolver(
      solverWorksapce.solverId,
      solverWorksapce.taskId,
    );
    if (alreadyBlocked) return;
    Notifier()
      .system({
        receiverId: solverWorksapce.solverId,
        content: `You are blocked from task: "${solverWorksapce.task.title}" you no longer able to submit it but you can still access your previouse work `,
        subject: `Blocked From A Task`,
      })
      .email({
        receiverEmail: solverWorksapce.solver?.email!,
        content: `You are blocked from task: "${solverWorksapce.task.title}" you no longer able to submit it but you can still access your previouse work `,
        subject: `Blocked From A Task`,
      });

    await db
      .update(TaskTable)
      .set({ status: "OPEN", assignedAt: null, solverId: null })
      .where(
        and(
          eq(TaskTable.id, solverWorksapce.taskId),
          inArray(TaskTable.status, ["ASSIGNED", "IN_PROGRESS"]),
        ),
      );

    await addSolverToTaskBlockList(
      solverWorksapce.solverId,
      solverWorksapce.taskId,
      "Missed deadline",
    );
    logger.warn(
      `Task ${solverWorksapce.taskId} missed deadline. Solver ${solverWorksapce.solverId} blocked.`,
    );
  } catch (error) {
    logger.error("unable to find blocked user", {
      task: solverWorksapce.taskId,
    });
    console.error(error);
  }
}

export async function acceptSolution(solution: SolutionById) {
  const {
    taskId,
    taskSolution: { posterId, solverId, title, paymentId, solver },
  } = solution;
  try {
    if (!posterId || !taskId) {
      return {
        error: "all field are required ",
        success: null,
      };
    }
    if (!paymentId) {
      return {
        error: "No payment Record for this Task",
        success: null,
      };
    }

    const updatedTask = await db
      .update(TaskTable)
      .set({ status: "COMPLETED", updatedAt: new Date() })
      .where(and(eq(TaskTable.id, taskId), eq(TaskTable.posterId, posterId)))
      .returning();

    if (!updatedTask || updatedTask.length === 0) {
      return {
        error: "No such task found",
        success: null,
      };
    }

    const releaseDate = addDays(getCurrentServerTime(), 7);

    await db
      .update(PaymentTable)
      .set({ status: "PENDING_USER_ACTION", releaseDate: releaseDate })
      .where(eq(PaymentTable.id, paymentId));

    Notifier()
      .email({
        content: `<h3>Your Solution for Task "${title}" has been Accepted</h3>`,
        subject: "Solution Accepted",
        receiverEmail: solver?.email!,
      })
      .system({
        content: `Your Solution for Task "${title}" has been Accepted`,
        subject: "Solution Accepted",
        receiverId: solverId!,
      });

    logger.info(`solution :${solution.id} Accepted`);
    return {
      error: null,
      success: "You have successfully accepted this task to be Complete",
    };
  } catch (error) {
    logger.error(`unable to Accept solution ${solution.id}`, {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });

    return {
      error: "Internal Error",
      success: null,
    };
  }
}
export async function requestRefund(values: {
  solution: SolutionById;
  reason: string;
}) {
  const {
    solution: {
      taskId,
      taskSolution: { posterId, solverId, title, solver },
    },
    reason,
  } = values;
  const result = taskRefundSchema.safeParse({ reason: reason });
  if (result.error) {
    return {
      error: result.error.message,
      success: null,
    };
  }
  try {
    const task = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
      with: {
        solver: { columns: publicUserColumns },
        workspace: true,
        taskRefund: true,
      },
    });
    if (!task) {
      throw new Error("No such task found");
    }
    if (task.posterId !== posterId) {
      return {
        error: "Anauthorized Request! You are not the Owner of This Task",
        success: null,
      };
    }
    if (task.taskRefund) {
      return {
        error: "There is already a Refund Request for this Task",
        success: null,
      };
    }
    await db.transaction(async (dx) => {
      await dx.insert(RefundTable).values({
        paymentId: task.paymentId!,
        taskId: task.id,
        refundReason: reason,
      });
      addSolverToTaskBlockList(solverId!, taskId, "Blocked For Refund", dx);
    });

    Notifier()
      .system({
        subject: `Your solution for the task "${title}" has been rejected by the poster.`,
        content:
          "The refund request is currently under moderator review. you currently are in block list for this task. Please check the comments for more details.",
        receiverId: solverId!,
      })
      .email({
        subject: `Your solution for the task "${title}" has been rejected by the poster.`,
        content:
          "The refund request is currently under moderator review. you currently are in block list for this task. Please check the comments for more details.",
        receiverEmail: solver?.email!,
      });
    (async () => {
      const mods = await getAllModertorIDs();
      mods.forEach(({ email, id }) => {
        Notifier()
          .system({
            subject: `New Refund Request: Task "${title}"`,
            content: `Task: "${title}" (ID: [Task ID]) has a new refund request. The request requires moderator review.`,
            receiverId: id,
          })
          .email({
            subject: `New Refund Request for Task: ${title}`,
            content: generateRefundNotificationEmail({ title }),
            receiverEmail: email,
          });
      });
    })();

    withRevalidateTag("dispute-data-cache");
    return {
      error: null,
      success: "Your refund Request Has bean submited",
    };
  } catch (err) {
    return {
      error: "unable to create a refund request Please try again",
      success: null,
    };
  }
}

export async function createTaskComment(values: {
  taskId: string;
  userId: string;
  comment: string;
  posterId?: string;
  solverId?: string | null;
}) {
  try {
    const { comment, taskId, userId, posterId, solverId } = values;
    if (!taskId || !userId || !comment || !posterId || !solverId) {
      throw new Error("all field are required ");
    }
    if (!(posterId !== userId || solverId !== userId)) {
      console.warn(
        `posterId !== userId || solverId !== userId`,
        posterId == userId,
      );
      throw new UnauthorizedError();
    }

    const id = await db
      .insert(TaskCommentTable)
      .values({
        content: comment,
        taskId,
        userId,
      })
      .returning({ id: TaskCommentTable.id });
    const result = await db.query.TaskCommentTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, id[0].id),
      with: {
        owner: {
          columns: publicUserColumns,
        },
      },
    });
    revalidatePath(`/`);
    return result;
  } catch (error) {
    logger.error("unable to create comment", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });
  }
}
export async function deleteDraftFile(values: {
  filePath: string;
  userId: string;
}) {
  const { filePath, userId } = values;
  try {
    await isAuthorized(["POSTER"]);
    await deleteFileFromR2(filePath);
    await db
      .update(TaskDraftTable)
      .set({ uploadedFiles: [] })
      .where(eq(TaskDraftTable.userId, userId));
  } catch (error) {
    throw new Error("unable to delete ");
  }
}
