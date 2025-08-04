"use server";
import {
  SolutionReturnErrorType,
  TaskFormSchema,
  workspaceFileType,
} from "./task-types";
import db from "@/drizzle/db";
import {
  BlockedTasksTable,
  PaymentStatusType,
  PaymentTable,
  RefundTable,
  SolutionFilesTable,
  SolutionTable,
  TaskDraftTable,
  TaskFileTable,
  TaskTable,
  UserRoleType,
  WorkspaceFilesTable,
  WorkspaceTable,
} from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import { deleteFileFromR2 } from "@/features/media/server/action";
import { PresignedUploadedFileMeta } from "@/features/media/server/media-types";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { calculateProgress, isError, truncateText } from "@/lib/utils";
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
import { SolutionError } from "../lib/errors";
import { table } from "console";

export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;
export type userTasksType = Awaited<ReturnType<typeof getUserTasksbyId>>;
export type allTasksFiltredType = Awaited<ReturnType<typeof getAllTasks>>;
export type SolutionById = Awaited<ReturnType<typeof getSolutionById>>;
export type WorkpaceSchemReturnedType = Awaited<
  ReturnType<typeof getWorkspaceById>
>;
export type TaskReturnType = Awaited<ReturnType<typeof getTasksbyId>>;
type assignTaskReturnType = {
  error?:
    | "no such task available"
    | "unable to assign task"
    | "task already assigned to solver";
  success?: "Task successfully assigned to you!";
  newTask: TaskReturnType;
};
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
  uploadedFiles: PresignedUploadedFileMeta[],
  paymentId: string
) {
  console.log("inside a createTaskAcrion Yoo");

  const categoryId = await getTaskCatagoryId(category);

  if (!categoryId || categoryId == undefined) return;

  const [taskId] = await db
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
    console.log("inserting into Task files Table");
    await db.insert(TaskFileTable).values(
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
  await deleteDraftTask(userId);
  console.log("Task created successfully!");
}
export async function createTaksPaymentCheckoutSession(
  price: number,
  userId: string,
  deadlineStr: string
) {
  const referer = await getServerReturnUrl();
  try {
    const currentUser = await getServerUserSession();
    if (!currentUser?.id) redirect("/login");
    const userSubscription = await getServerUserSubscriptionById(
      currentUser?.id!
    );

    if (!currentUser.email || !currentUser!.id) return;
    if (userSubscription?.tier == "PREMIUM") return;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: currentUser.email,
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
      metadata: {
        userId,
        deadlineStr,
        type: "task_payment",
      },
      cancel_url: `${referer}`,
      success_url: `${referer}?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    console.log("session url" + session.url);
    return session.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function validateStripeSession(
  sessionId: string
): Promise<boolean> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_status === "paid";
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
          uploadedFiles,
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
      });
    }
  } catch (e) {
    await db.delete(TaskDraftTable).where(eq(TaskDraftTable.userId, userId));
  }
}

export async function assignTaskToSolverById(
  taskId: string,
  solverId: string
): Promise<assignTaskReturnType> {
  try {
    const oldTask = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
    });
    if (!oldTask)
      return { error: "no such task available", newTask: undefined };
    if (oldTask.solverId)
      return { error: "task already assigned to solver", newTask: undefined };

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
      return { error: "unable to assign task", newTask: undefined };
    }

    revalidatePath(`/yourTasks/${taskId}`);
    return {
      success: "Task successfully assigned to you!",
      newTask: result,
    };
  } catch (error) {
    console.error(error);
    return { error: "unable to assign task", newTask: undefined };
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
    columns: { id: true, name: true },
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
  purpose?: string,
  stripePaymentIntentId?: string,
  releaseDate?: Date,
  stripeChargeId?: string
) {
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
      with: { poster: true, solver: true },
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

export async function getDraftTask(userId: string) {
  const oldTask = await db.query.TaskDraftTable.findFirst({
    where: (table, fn) => fn.eq(table.userId, userId),
  });
  return oldTask;
}
export async function deleteDraftTask(userId: string) {
  await db.delete(TaskDraftTable).where(eq(TaskDraftTable.userId, userId));
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
      task: { with: { solver: true, poster: true, workspace: true } },
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

    await db
      .delete(WorkspaceFilesTable)
      .where(eq(WorkspaceFilesTable.id, fileId));

    await deleteFileFromR2(file.filePath);
    revalidatePath(`workspace/${file.workspaceId}`);
    return {
      file: file.fileName,
      success: `${truncateText(file.fileName, 10)} Deleted Successfuly`,
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went Wrong!!" };
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

export async function publishSolution(
  workspaceId: string,
  content: string,
  solverId: string
) {
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
    return {
      success: true,
      message: "Successfully published solution!" as const,
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
    const deadlinePercentage = calculateProgress(
      task.deadline,
      task.assignedAt
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
      console.log(
        `[Deadline] Task ${task.id} missed deadline. Solver ${task.solverId} blocked.`
      );
    } catch (error) {
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
export async function acceptSolution(taskId: string, posterId: string) {
  const updatedTask = await db
    .update(TaskTable)
    .set({ status: "COMPLETED", updatedAt: new Date() })
    .where(and(eq(TaskTable.id, taskId), eq(TaskTable.posterId, posterId)))
    .returning();
  if (!updatedTask || !updatedTask[0].paymentId) {
    //todo more secure
    return { error: true, success: false };
  }
  const releaseDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  if (updatedTask.length > 0) {
    await db
      .update(PaymentTable)
      .set({ status: "SUCCEEDED", releaseDate: releaseDate })
      .where(eq(PaymentTable.id, updatedTask[0].paymentId));
  }
  return { success: true, error: false };
}
export async function requestRefund(
  taskId: string,
  posterId: string,
  reason: string
) {
  const task = await getTasksbyId(taskId);
  if (!task) {
    throw new Error("No such task found");
  }
  if (task.posterId !== posterId) {
    throw new Error("Anauthorized Request! You are not the Owner of This Task");
  }
  try {
    const refund = await db.insert(RefundTable).values({
      paymentId: task.paymentId!,
      taskId: task.id,
      refundedAt: new Date(),
      refundReason: reason,
    });
    
  } catch (err) {
    console.log(err)
    throw new Error("unable to create a refund request Please try again")
  }
}
