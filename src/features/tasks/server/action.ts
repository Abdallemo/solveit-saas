"use server";
import {
  SolutionReturnErrorType,
  TaskFormSchema,
  workspaceFileType,
} from "./task-types";
import db from "@/drizzle/db";
import {
  PaymentStatusType,
  PaymentTable,
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
import { and, asc, count, eq, ilike, isNull, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SolutionError } from "../lib/errors";

export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;
export type userTasksType = Awaited<ReturnType<typeof getUserTasksbyId>>;
export type allTasksFiltredType = Awaited<ReturnType<typeof getAllTasksbyId>>;

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
type assignTaskReturnType = {
  error?:
    | "no such task available"
    | "unable to assign task"
    | "task already assigned to solver";
  success?: "Task successfully assigned to you!";
};
export async function assignTaskToSolverById(
  taskId: string,
  solverId: string
): Promise<assignTaskReturnType> {
  try {
    const oldTask = await db.query.TaskTable.findFirst({
      where: (table, fn) => fn.eq(table.id, taskId),
    });
    if (!oldTask) return { error: "no such task available" };
    if (oldTask.solverId) return { error: "task already assigned to solver" };

    const updatedTask = await db
      .update(TaskTable)
      .set({
        solverId: solverId,
        status: "ASSIGNED",
        updatedAt: new Date(Date.now()),
      })
      .where(and(eq(TaskTable.id, taskId), isNull(TaskTable.solverId)));
    revalidatePath(`/yourTasks/${taskId}`);
    return { success: "Task successfully assigned to you!" };
  } catch (error) {
    console.error(error);
    return { error: "unable to assign task" };
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

// getters 🥱
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
export type TaskReturnType = Awaited<ReturnType<typeof getTasksbyId>>;
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

export async function getAllTasksbyId() {
  const allTasksFiltred = db.query.TaskTable.findMany({
    where: (table, fn) =>
      fn.and(
        fn.not(fn.eq(table.status, "IN_PROGRESS")),
        fn.not(fn.eq(table.status, "ASSIGNED"))
      ),
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
      },
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}
export async function getAssignedTasksbyIdPaginated(
  userId: string,
  { search, limit, offset }: { search?: string; limit: number; offset: number }
) {
  const where = and(
    eq(TaskTable.solverId, userId),
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

  if (role === "POSTER") {
    where = and(
      not(eq(TaskTable.posterId, userId)),

      not(eq(TaskTable.visibility, "private")),
      search ? ilike(TaskTable.title, `%${search}%`) : undefined
    );
  } else if (role === "SOLVER") {
    where = and(
      not(eq(TaskTable.posterId, userId)),
      not(eq(TaskTable.status, "ASSIGNED")),
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
export async function getWorkspaceByTaskId(taskId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) => fn.eq(table.taskId, taskId),
    with: {
      solver: true,
      task: true,
    },
  });
  return workspace;
}
export type WorkpaceSchemReturnedType = Awaited<
  ReturnType<typeof getWorkspaceById>
>;
export async function getWorkspaceById(workspaceId: string) {
  const workspace = await db.query.WorkspaceTable.findFirst({
    where: (table, fn) => fn.eq(table.id, workspaceId),
    with: {
      solver: true,
      task: true,
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
//=> error type

//=> im thinking to eaither ditch the throw new error and use above or use both so that client recive it (which is another me )
export async function publishSolution(workspaceId: string, content: string) {
  try {
    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new SolutionError(
        "Unable to locate the specified workspace. Please verify the ID and try again."
      );
    }
    const deadlinePercentage = calculateProgress(
      workspace.task.deadline!,
      workspace.createdAt!
    );
    if (deadlinePercentage >= 100) {
      throw new SolutionError(
        "Submission window has closed. You can no longer publish a solution for this task."
      );
    }
    const workspaceStats = workspace.task.status;
    if (workspaceStats === "COMPLETED") {
      throw new SolutionError(
        "This solution has already been marked as completed. No further submissions are allowed."
      );
    }
    if (workspaceStats === "CANCELED") {
      throw new SolutionError(
        "This solution has been canceled and cannot be submitted."
      );
    }
    await db.transaction(async (dx) => {
      const solution = await dx
        .insert(SolutionTable)
        .values({
          workspaceId,
          content: content,
          isFinal: true,
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
        .set({ status: "COMPLETED" })
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
