"use server";
import { workspaceFileType } from "./task-types";
import db from "@/drizzle/db";
import {
  BlockedTasksTable,
  PaymentPorposeType,
  PaymentStatusType,
  PaymentTable,
  RefundTable,
  SolutionFilesTable,
  SolutionTable,
  TaskCategoryTable,
  TaskCommentTable,
  TaskDraftTable,
  TaskFileTable,
  TaskTable,
  UserRoleType,
  WorkspaceFilesTable,
  WorkspaceTable,
} from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import { deleteFileFromR2 } from "@/features/media/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import {
  getServerUserSubscriptionById,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { isError, truncateText } from "@/lib/utils";
import { SolutionError } from "@/features/tasks/lib/errors";
import {
  and,
  asc,
  count,
  eq,
  ilike,
  inArray,
  isNull,
  not,
  or,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
  catagoryType,
  userTasksType,
  allTasksFiltredType,
  SolutionById,
  WorkpaceSchemReturnedType,
  TaskReturnType,
  assignTaskReturnType,
  taskRefundSchemaType,
  FlatDispute,
} from "@/features/tasks/server/task-types";
import { taskRefundSchema } from "@/features/tasks/server/task-types";
import { sendNotification } from "@/features/notifications/server/action";
import { logger } from "@/lib/logging/winston";
import { env } from "@/env/server";
import { GoHeaders } from "@/lib/go-config";
import { validateContentWithAi } from "@/features/Ai/server/action";
export type {
  catagoryType,
  userTasksType,
  allTasksFiltredType,
  SolutionById,
  WorkpaceSchemReturnedType,
  TaskReturnType,
  assignTaskReturnType,
  taskRefundSchemaType,
};

function parseDeadline(value: string, baseTime: Date): Date | null {
  const base = baseTime.getTime();
  switch (value) {
    case "12h":
      return new Date(base + 12 * 60 * 60 * 1000);
    case "24h":
      return new Date(base + 24 * 60 * 60 * 1000);
    case "48h":
      return new Date(base + 48 * 60 * 60 * 1000);
    case "3days":
      return new Date(base + 3 * 24 * 60 * 60 * 1000);
    case "7days":
      return new Date(base + 7 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}
export async function calculateTaskProgress(solverId: string, taskId: string) {
  const workspace = await getWorkspaceByTaskId(taskId, solverId);
  if (!workspace) return -1;

  const deadline = parseDeadline(
    workspace.task.deadline!,
    workspace.createdAt!
  );
  if (!deadline) return -1;

  const startTime = workspace.createdAt!.getTime();
  const currentTime = Date.now();

  const timePassed = currentTime - startTime;
  const totalTime = deadline.getTime() - startTime;


  return Math.min(Math.max((timePassed / totalTime) * 100, 0), 100);
}
//the Magic Parts 🪄
export async function createTaskAction(
  userId: string,
  title: string,
  description: string,
  category: string,
  content: string,
  visibility: string,
  deadline: string,
  price: number,
  uploadedFiles: UploadedFileMeta[],
  paymentId: string
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
          }))
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
    const res = await validateContentWithAi(content);
    if (res.violatesRules) return;
    const currentUser = await getServerUserSession();
    if (!currentUser?.id) redirect("/login");
    const userSubscription = await getServerUserSubscriptionById(
      currentUser?.id!
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
      await UpdateUserField({
        id: user.id,
        data: { stripeCustomerId: customerId },
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId!,

      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: `Task Payment`,
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
        type: "task_payment",
        draftTaskId: draftTaskId,
      },
      cancel_url: `${referer}`,
      success_url: `${env.NEXTAUTH_URL}/dashboard/poster/yourTasks/?session_id={CHECKOUT_SESSION_ID}&id=${draftTaskId}`,
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
export async function autoSaveDraftTask(
  title: string,
  description: string,
  content: string,
  userId: string,
  category: string,
  price: number,
  visibility: "public" | "private",
  deadline: string,
  uploadedFiles?: string
) {
  try {
    let parsedFiles: UploadedFileMeta[] = [];
    if (uploadedFiles) {
      try {
        const temp = JSON.parse(uploadedFiles);
        if (Array.isArray(temp)) {
          parsedFiles = temp as UploadedFileMeta[];
        }
      } catch {
        parsedFiles = [];
      }
    }
    const oldTask = await db.query.TaskDraftTable.findFirst({
      where: (table, fn) => fn.eq(table.userId, userId),
    });

    if (oldTask) {
      await db
        .update(TaskDraftTable)
        .set({
          title,
          description,
          content,
          category,
          price,
          visibility,
          deadline,
          uploadedFiles: parsedFiles,
        })
        .where(eq(TaskDraftTable.userId, userId));
    } else {
      await db.insert(TaskDraftTable).values({
        title,
        description,
        userId,
        content,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles: parsedFiles,
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
}): Promise<assignTaskReturnType> {
  const { solverId, taskId } = values;
  try {
    const oldTask = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
    });
    if (!oldTask) throw new Error("no such task available");
    if (oldTask.solverId) throw new Error("task already assigned to solver");

    const result = await db.transaction(async (tx) => {
      const updated = await tx
        .update(TaskTable)
        .set({
          solverId: solverId,
          status: "ASSIGNED",
          updatedAt: new Date(),
          assignedAt: new Date(),
        })
        .where(and(eq(TaskTable.id, taskId), isNull(TaskTable.solverId)))
        .returning();

      if (!updated.length) return null;

      return await tx.query.TaskTable.findFirst({
        where: (table, fn) => fn.eq(table.id, taskId),
        with: {
          poster: true,
          solver: true,
          workspace: true,
        },
      });
    });

    if (!result) {
      throw new Error("unable to assign task");
    }
    const newWorkspace = await createWorkspace(result);
    sendNotification({
      sender: "solveit@org.com",
      receiverId: result?.poster.id!,
      receiverEmail: result?.poster.email!,
      method: ["system", "email"],
      body: {
        subject: "task Picked",
        content: `you Task titiled ${result?.title} is picked by ${result?.solver?.name}\n you will reciev your solution on `,
      },
    });
    revalidatePath(`/yourTasks/${taskId}`);
    return {
      success: "Task successfully assigned to you!",
      newTask: result,
    };
  } catch (error) {
    console.error(error);
    throw new Error("unable to assign task");
  }
}
export async function createWorkspace(task: TaskReturnType) {
  const newWorkspace = await db
    .insert(WorkspaceTable)
    .values({
      solverId: task?.solverId!,
      taskId: task?.id!,
    })
    .returning();
  return newWorkspace[0];
}
export async function addSolverToTaskBlockList(
  userId: string,
  taskId: string,
  reason: string
) {
  await db.insert(BlockedTasksTable).values({
    userId,
    taskId,
    reason,
  });
}
export async function createCatagory(name: string) {
  await db.insert(TaskCategoryTable).values({
    name,
  });
  revalidatePath("dashboard/moderator/categories");
}

// getters 🥱
export async function getBlockedSolver(solverId: string, taskId: string) {
  const result = db.query.BlockedTasksTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.userId, solverId), fn.eq(table.taskId, taskId)),
  });
  return [result][0];
}
export async function getAllTaskCatagories() {
  const catagoryName = await db.query.TaskCategoryTable.findMany({
    columns: { id: true, name: true, createdAt: true },
  });
  return catagoryName;
}
export async function getTaskCatagoryId(name: string) {
  const catagoryId = await db.query.TaskCategoryTable.findFirst({
    where: (table, fn) => fn.eq(table.name, name),
    columns: { id: true },
  });
  return catagoryId;
}

export async function getAllCategoryMap(): Promise<Record<string, string>> {
  const categories = await db.query.TaskCategoryTable.findMany({
    columns: { id: true, name: true },
  });

  return Object.fromEntries(categories.map((cat) => [cat.id, cat.name]));
}

export async function getWalletInfo(solverId: string) {
  let pending = 0;
  let availabel = 0;
  if (!solverId) {
    throw new Error("error! user id is empty");
  }
  const solverInfo = await db.query.WorkspaceTable.findMany({
    with: { solver: true, task: true },
    where: (table, fn) => fn.eq(table.solverId, solverId),
  });
  for (const record of solverInfo) {
    switch (record.task.status) {
      case "ASSIGNED":
      case "IN_PROGRESS":
      case "SUBMITTED":
        pending += record.task.price!;
        break;
      case "COMPLETED":
        availabel += record.task.price!;
        break;
    }
  }
  return { pending, availabel };
}
export async function taskPaymentInsetion(
  status: PaymentStatusType,
  amount: number,
  userId: string,
  stripePaymentIntentId: string,
  purpose?: PaymentPorposeType,
  releaseDate?: Date,
  stripeChargeId?: string
) {
  logger.info("Saving into Payment table");
  const payment = await db
    .insert(PaymentTable)
    .values({
      amount,
      userId,
      purpose,
      releaseDate,
      status,
      stripeChargeId,
      stripePaymentIntentId,
    })
    .returning({ paymentId: PaymentTable.id });
  return [payment][0][0].paymentId;
}

export async function getUserTasksbyId(userId: string) {
  const userTasks = await db.query.TaskTable.findMany({
    where: (table, fn) => fn.eq(table.posterId, userId),
    orderBy: [asc(TaskTable.title)],
  });
  return userTasks;
}
export async function getTasksbyId(id: string) {
  const Task = await db.query.TaskTable.findFirst({
    where: (table, fn) => fn.eq(table.id, id),
    with: {
      poster: true,
      solver: true,
      workspace: true,
    },
  });
  if (!Task || !Task.id) return;
  return Task;
}

export async function getAllTasks() {
  const allTasksFiltred = db.query.TaskTable.findMany({
    where: (table, fn) =>
      fn.and(
        fn.not(fn.eq(table.status, "IN_PROGRESS")),
        fn.not(fn.eq(table.status, "ASSIGNED"))
      ),
    with: {
      poster: true,
      solver: true,
      workspace: true,
    },
  });
  return allTasksFiltred;
}

export async function getPosterTasksbyIdPaginated(
  userId: string,
  { search, limit, offset }: { search?: string; limit: number; offset: number }
) {
  const where = and(
    eq(TaskTable.posterId, userId),
    search ? ilike(TaskTable.title, `%${search}%`) : undefined
  );

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.createdAt),
      with: {
        poster: true,
        solver: true,
        taskSolution: true,
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}
export async function getAssignedTasksbyIdPaginated(
  userId: string,
  { search, limit, offset }: { search?: string; limit: number; offset: number },
  showBlocked: boolean
) {
  const blockedTasks = await db.query.BlockedTasksTable.findMany({
    with: { task: true },
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  const blockedTaskIds = blockedTasks.map((t) => t.taskId);

  const where = and(
    or(
      eq(TaskTable.solverId, userId),
      showBlocked ? inArray(TaskTable.id, blockedTaskIds) : undefined
    ),
    search ? ilike(TaskTable.title, `%${search}%`) : undefined
  );

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.createdAt),
      with: {
        workspace: true,
        poster: true,
        solver: true,
        blockedSolvers: true,
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}

export async function getAllTasksByRolePaginated(
  userId: string,
  role: UserRoleType,
  {
    search,
    limit,
    offset,
  }: {
    search?: string;
    limit: number;
    offset: number;
  }
) {
  let where;
  const blockedTasks = await db.query.BlockedTasksTable.findMany({
    with: { task: true },
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  const blockedTaskIds = blockedTasks.map((t) => t.taskId);

  if (role === "POSTER") {
    where = and(
      not(eq(TaskTable.posterId, userId)),

      not(eq(TaskTable.visibility, "private")),
      search ? ilike(TaskTable.title, `%${search}%`) : undefined
    );
  } else if (role === "SOLVER") {
    where = and(
      blockedTaskIds.length > 0
        ? not(inArray(TaskTable.id, blockedTaskIds))
        : undefined,
      not(eq(TaskTable.posterId, userId)),
      and(eq(TaskTable.status, "OPEN")),
      search ? ilike(TaskTable.title, `%${search}%`) : undefined
    );
  }

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table, fn) => fn.desc(table.createdAt),
      with: { poster: true, solver: true, taskSolution: true },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}

export async function getTaskFilesById(taskId: string) {
  const files = await db.query.TaskFileTable.findMany({
    where: (table, fn) => fn.eq(table.taskId, taskId),
  });
  return files;
}
export async function getDraftTaskWithDefualtVal(userId: string) {
  const oldTask = await db.query.TaskDraftTable.findFirst({
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  if (!oldTask) return null;
  return {
    id: oldTask.id,
    userId: oldTask.userId,
    title: oldTask.title ?? "",
    description: oldTask.description ?? "",
    content: oldTask.content ?? "",
    deadline: oldTask.deadline ?? "12h",
    visibility: oldTask.visibility ?? "public",
    category: oldTask.category ?? "",
    price: oldTask.price ?? 10,
    updatedAt: oldTask.updatedAt,
  };
}

export async function getDraftTask(userId: string, draftId: string) {
  const oldTask = await db.query.TaskDraftTable.findFirst({
    where: (table, fn) =>
      fn.and(eq(table.userId, userId), eq(table.id, draftId)),
  });
  if (!oldTask) {
    return null;
  }
  return {
    ...oldTask,
  };
}
export async function deleteDraftTask(userId: string) {
  const res = await db
    .delete(TaskDraftTable)
    .where(eq(TaskDraftTable.userId, userId))
    .returning();
  logger.info("deleted task draft from user: " + userId, { result: res });
}
export async function getWorkspaceByTaskId(taskId: string, solverId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.taskId, taskId), fn.eq(table.solverId, solverId)),
    with: {
      solver: true,
      task: true,
    },
  });
  return workspace;
}
export async function getWorkspaceById(workspaceId: string, solverId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) =>
      fn.and(fn.eq(table.id, workspaceId), fn.eq(table.solverId, solverId)),
    with: {
      solver: true,
      task: {
        with: {
          solver: true,
          poster: true,
          workspace: true,
          taskComments: {
            with: {
              owner: true,
            },
          },
        },
      },
      workspaceFiles: true,
    },
  });
  return workspace;
}

export async function autoSaveDraftWorkspace(
  content: string,
  solverId: string,
  taskId: string
) {
  if (!solverId || !taskId) return;

  console.info("fired autosave 🪄");
  try {
    const oldTask = await db.query.WorkspaceTable.findFirst({
      where: (table, fn) => fn.eq(table.taskId, taskId),
      with: { solver: true, task: true, workspaceFiles: true },
    });

    if (oldTask) {
      await db
        .update(WorkspaceTable)
        .set({
          content,
        })
        .where(eq(WorkspaceTable.taskId, taskId));
    } else {
      await db.insert(WorkspaceTable).values({
        content,
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
  content: string;
  solverId: string;
}) {
  const { content, solverId, workspaceId } = values;
  try {
    const workspace = await getWorkspaceById(workspaceId, solverId);
    workspace?.task;
    if (!workspace) {
      throw new SolutionError(
        "Unable to locate the specified workspace. Please verify the ID and try again."
      );
    }
    await handleTaskDeadline(workspace.task);
    const alreadyBlocked = await getBlockedSolver(
      workspace.task.solverId!,
      workspace.task.id
    );
    if (alreadyBlocked) {
      throw new SolutionError(
        "Submission window has closed. You can no longer publish a solution for this task."
      );
    }
    const workspaceStats = workspace.task.status;
    if (workspaceStats === "COMPLETED" || workspaceStats === "SUBMITTED") {
      throw new SolutionError(
        "This solution has already been marked as completed. No further submissions are allowed."
      );
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
        throw new SolutionError(
          "Failed to create a solution record. Please try again or contact support if the issue persists."
        );
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
        })
      );
      await dx
        .update(TaskTable)
        .set({ status: "SUBMITTED", updatedAt: new Date() })
        .where(eq(TaskTable.id, workspace?.taskId));
    });
    const updatedWorkspace = await getWorkspaceById(workspaceId, solverId);
    sendNotification({
      sender: "solveit@org.com",
      receiverId: workspace.task.poster.id!,
      receiverEmail: workspace.task.poster.email!,
      method: ["email", "system"],
      body: {
        subject: "Task Submited",
        content: `you Task titiled <h4>${workspace.task.title}</h4> 
          has bean submited please review it with in 7days `,
      },
    });
    return {
      success: true,
      message: "Successfully published solution!" as const,
      workspace: updatedWorkspace,
    };
  } catch (error) {
    if (isError(error)) {
      throw new SolutionError(
        "Unable to publish the solution due to an unexpected issue. Please try again later."
      );
    }
    throw new SolutionError(
      "Publishing failed due to: [error details]. Please review and retry."
    );
  }
}

export async function handleTaskDeadline(task: TaskReturnType) {
  //if this task status is assigned or on progress check these
  if (
    !task ||
    !task.solverId ||
    !task.id ||
    !task.workspace?.createdAt ||
    !task.deadline ||
    !task.updatedAt ||
    !task.assignedAt
  )
    return;
  if (task.status === "ASSIGNED" || task.status === "IN_PROGRESS") {
    const deadlinePercentage = await calculateTaskProgress(
      task.solverId,
      task.workspace.taskId
    );
    if (deadlinePercentage < 100) return;

    try {
      const alreadyBlocked = await getBlockedSolver(task.solverId, task.id);
      if (alreadyBlocked) return;

      await db
        .update(TaskTable)
        .set({ status: "OPEN", assignedAt: null })
        .where(
          and(
            eq(TaskTable.id, task.id),
            inArray(TaskTable.status, ["ASSIGNED", "IN_PROGRESS"])
          )
        );

      await addSolverToTaskBlockList(task.solverId, task.id, "Missed deadline");
      logger.warn(
        `Task ${task.id} missed deadline. Solver ${task.solverId} blocked.`
      );
    } catch (error) {
      logger.error("unable to find blocked user", { task: task });
      console.error(error);
    }
  }
}
export async function getSolutionById(solutionId: string) {
  if (!solutionId) {
    throw new Error("Solution Id is undefined");
  }

  const solution = await db.query.SolutionTable.findFirst({
    where: (table, fn) => fn.eq(table.id, solutionId),
    with: {
      taskSolution: {
        with: {
          solver: true,
          taskSolution: true,
          taskRefund: true,
          taskComments: {
            with: {
              owner: true,
            },
          },
        },
      },
      solutionFiles: {
        with: {
          solutionFile: true,
        },
      },
    },
  });
  if (!solution) {
    throw new Error("Sorry No such Solution for this Task!");
  }
  //todo ill think of other latter
  return solution;
}
export async function acceptSolution(solution: SolutionById) {
  const {
    taskId,
    taskSolution: { posterId, solverId, title, paymentId },
  } = solution;
  try {
    if (!posterId || !taskId) {
      throw new Error("all field are required ");
    }
    if (!paymentId) {
      throw new Error("No payment Record for this Task");
    }

    const updatedTask = await db
      .update(TaskTable)
      .set({ status: "COMPLETED", updatedAt: new Date() })
      .where(and(eq(TaskTable.id, taskId), eq(TaskTable.posterId, posterId)))
      .returning();

    if (!updatedTask || updatedTask.length === 0) {
      throw new Error("No such task found");
    }

    const releaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (updatedTask.length > 0) {
      await db
        .update(PaymentTable)
        .set({ status: "SUCCEEDED", releaseDate: releaseDate })
        .where(eq(PaymentTable.id, paymentId));
    }

    sendNotification({
      sender: "solveit@org.com",
      method: ["system", "email"],
      body: `Your Solution for Task "${title}" has been Accepted`,
      receiverId: solverId!,
    });
    logger.info(`solution :${solution.id} Accepted`);
  } catch (error) {
    logger.error(`unable to Accept solution ${solution.id}`, {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });
    throw new Error("Internal Error", { cause: error });
  }
}
export async function requestRefund(values: {
  solution: SolutionById;
  reason: string;
}) {
  const {
    solution: {
      taskId,
      taskSolution: { posterId, solverId, title },
    },
    reason,
  } = values;
  const result = taskRefundSchema.safeParse({ reason: reason });
  if (result.error) {
    throw new Error(result.error.message);
  }
  try {
    const task = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
      with: {
        poster: true,
        solver: true,
        workspace: true,
        taskRefund: true,
      },
    });
    if (!task) {
      throw new Error("No such task found");
    }
    if (task.posterId !== posterId) {
      throw new Error(
        "Anauthorized Request! You are not the Owner of This Task"
      );
    }
    if (task.taskRefund) {
      throw new Error("There is already a Refund Request for this Task");
    }
    const refund = await db.insert(RefundTable).values({
      paymentId: task.paymentId!,
      taskId: task.id,
      refundedAt: new Date(),
      refundReason: reason,
    });
    sendNotification({
      sender: "solveit@org.com",
      method: ["system"],
      body: {
        subject: `Your solution for the task "${title}" has been rejected by the poster.`,
        content:
          "The refund request is currently under moderator review. you currently are in block list for this task. Please check the comments for more details.",
      },
      receiverId: solverId!,
    });
  } catch (err) {
    throw new Error("unable to create a refund request Please try again");
  }
}

export async function getAllDisputes(): Promise<FlatDispute[]> {
  const allDisputes = await db.query.RefundTable.findMany({
    with: {
      taskRefund: {
        with: {
          taskRefund: true,
          taskSolution: true,
          poster: true,
          solver: true,
        },
      },
    },
  });
  return allDisputes.map((dispute) => ({
    id: dispute.id ?? null,
    refundReason: dispute.refundReason ?? null,
    refundedAt: dispute.refundedAt ?? null,
    paymentId: dispute.paymentId ?? null,
    taskId: dispute.taskId ?? null,
    refundStatus: dispute.refundStatus,
    assignedAt: dispute.taskRefund.assignedAt ?? null,
    taskPaymentId: dispute.taskRefund.paymentId ?? null,
    taskTitle: dispute.taskRefund.title ?? null,
    taskPrice: dispute.taskRefund.price ?? null,

    posterName: dispute.taskRefund.poster.name ?? null,
    posterEmail: dispute.taskRefund.poster.email ?? null,

    solverName: dispute.taskRefund.solver?.name ?? null,
    solverEmail: dispute.taskRefund.solver?.email ?? null,

    solutionContent: dispute.taskRefund.taskSolution.content,
  }));
}

export async function createTaskComment(values: {
  taskId: string;
  userId: string;
  comment: string;
}) {
  try {
    const { comment, taskId, userId } = values;
    if (!taskId || !userId || !comment) {
      throw new Error("all field are required ");
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
        owner: true,
      },
    });
    if (result || result !== undefined) {
      try {
        await fetch(`${env.GO_API_URL}/send-comment`, {
          method: "POST",
          headers: GoHeaders,
          body: JSON.stringify(result),
        });
      } catch (error) {
        logger.error("unable to send comment ", error);
      }
    }
    revalidatePath(`/`);
  } catch (error) {
    logger.error("unable to create comment", {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });
  }
}
