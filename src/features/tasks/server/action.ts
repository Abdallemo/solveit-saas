"use server";
import { TaskFormSchema } from "./auth-types";
import db from "@/drizzle/db";
import { TaskFileTable, TaskTable } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";
import { UploadedFileMeta } from "@/features/media/server/action";
import { parseDeadline } from "@/lib/utils";
import { redirect } from "next/navigation";

export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;


export async function getAllTaskCatagories() {
  const catagoryName = await db.query.TaskCategoryTable.findMany({
    columns: { id: true, name: true },
  });
  return catagoryName;
}
export async function getTaskCatagory(name: string) {
  const catagoryId = await db.query.TaskCategoryTable.findFirst({
    where: (table, fn) => fn.eq(table.name, name),
    columns: { id: true },
  });
  return catagoryId;
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
  const uploadedFiles = JSON.parse(formData.get('uploadedFiles')?.toString()||"[]") as UploadedFileMeta[]


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
  const categoryId = await getTaskCatagory(category);
  if (!categoryId || categoryId == undefined) return;

  const [taskId] = await db.insert(TaskTable).values({
    categoryId: categoryId.id,
    posterId:currentUser.id!,
    title: title,
    content:content,
    description: description,
    price: Number(price),
    status:'OPEN',
    visibility: visibility =='public' ?  "public" : "private", 
    deadline:deadline,

  }).returning({taskId:TaskTable.id})

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
