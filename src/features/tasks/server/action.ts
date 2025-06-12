"use server";
import { TaskFormSchema } from "./auth-types";
import { z } from "zod";

import db from "@/drizzle/db";
import { TaskTable } from "@/drizzle/schemas";
import { getServerUserSession } from "@/features/auth/server/actions";

export type catagoryType = Awaited<ReturnType<typeof getAllTaskCatagories>>;

export async function getAllTaskCatagories() {
  const catagoryName = await db.query.TaskCategoryTable.findMany({
    columns: { id: true, name: true },
  });
  return catagoryName;
}

export async function createTaskAction(formData: FormData): Promise<void> {
  const currentUser = await getServerUserSession()
  if (!currentUser) return

  
  const files: File[] = [];
  const rawData = {
    deadline: formData.get("deadline"),
    visibility: formData.get("visibility"),
    category: formData.get("category"),
    price: formData.get("price"),
    content: formData.get("taskContent"),
    title: formData.get("title"),
    description: formData.get("description"),
    files
  };


  const result = TaskFormSchema.safeParse(rawData);

  if (!result.success) {
    console.log("Validation failed", result.error.flatten().fieldErrors);
    return;
  }
    for (const [key, value] of formData.entries()) {
    if (key === "files" && value instanceof File) {
      files.push(value);
    }
  }

  console.log("ROW DATA")
  console.log(rawData)

  // const insertResult = await db.insert(TaskTable).values({
  //   title: "",
  //   categoryId: "",
  //   posterId: "",
  //   content: "",
  //   deadline: "",
  //   description: "",
  //   isPublic: "",
  //   paymentId: "",
  //   status: "OPEN",
  // });

  console.log("✅ Task created successfully!");
}
