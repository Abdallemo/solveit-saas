"use server";
import { TaskFormSchema } from "./auth-types";
import db from "@/drizzle/db";
import { TaskFileTable, TaskTable } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import { UploadedFileMeta } from "@/features/media/server/action";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { getServerUserSubscriptionById } from "@/features/users/server/actions";
import { stripe } from "@/lib/stripe";
import { parseDeadline } from "@/lib/utils";
import { and, asc, count, eq, ilike, not } from "drizzle-orm";
import { redirect } from "next/navigation";

export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;

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

export async function createTaskAction(formData: FormData) {
  const currentUser = await getServerUserSession();
  if (!currentUser) return;

  const rawData = {
    deadline: formData.get("deadline"),
    visibility: formData.get("visibility"),
    category: formData.get("category"),
    price: formData.get("price"),
    content: formData.get("taskContent"),
    title: formData.get("title"),
    description: formData.get("description"),
  };
  const uploadedFiles = JSON.parse(
    formData.get("uploadedFiles")?.toString() || "[]"
  ) as UploadedFileMeta[];

  const result = TaskFormSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return { error: true, fieldErrors };
  }

  const {
    category,
    content,
    deadline: deadlineStr,
    description,
    price,
    title,
    visibility,
  } = result.data;

  const deadline = parseDeadline(deadlineStr);

  console.log("ROW DATA");
  console.log(rawData);
  const categoryId = await getTaskCatagoryId(category);
  if (!categoryId || categoryId == undefined) return;

  const [taskId] = await db
    .insert(TaskTable)
    .values({
      categoryId: categoryId.id,
      posterId: currentUser.id!,
      title: title,
      content: content,
      description: description,
      price: Number(price),
      status: "OPEN",
      visibility: visibility == "public" ? "public" : "private",
      deadline: deadline,
    })
    .returning({ taskId: TaskTable.id });

  if (uploadedFiles.length > 0) {
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

  console.log("Task created successfully!");
}

export type userTasksType = Awaited<ReturnType<typeof getUserTasksbyId>>;
export type allTasksFiltredType = Awaited<ReturnType<typeof getAllTasksbyId>>;

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

export async function getUserTasksbyIdPaginated(
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
      orderBy: (table) => table.createdAt,
    }),
    db.select({ count: count() }).from(TaskTable).where(where),
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;

  return { tasks, totalCount };
}

export async function getAllTasksbyIdPaginated(
  userId: string,
  { search, limit, offset }: { search?: string; limit: number; offset: number }
) {
  const where = and(
    and(
      not(eq(TaskTable.posterId, userId)), not(eq(TaskTable.status, 'ASSIGNED'))
    ),
    search ? ilike(TaskTable.title, `%${search}%`) : undefined
  );

  const [tasks, totalCountResult] = await Promise.all([
    db.query.TaskTable.findMany({
      where,
      limit,
      offset,
      orderBy: (table) => table.createdAt,
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


export async function createStripeCheckoutSession(price:number) {
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
     mode:'payment',
     customer_email:currentUser.email,
     line_items:[
      {
        price_data:{
          currency:'myr',
          product_data:{
            name:`Task Payment`,
          },
          unit_amount:price*100
        },

        quantity:1
      }
      
     ],
     metadata:{
      userId:currentUser.id,
      type: "task_payment",
     }
    });

    if (!session.url) throw new Error("Failed to create checkout session");

    console.log("session url" + session.url);
    redirect(session.url);
  } catch (error) {
    console.error(error);
    throw error;
  }
}