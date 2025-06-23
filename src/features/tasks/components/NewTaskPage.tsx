"use client"
import { Suspense, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useForm, FormProvider, FieldErrors } from "react-hook-form"
import TaskPostingEditor from "./richTextEdito/Tiptap"
import NewTaskSidebar from "./newTaskSidebar"
import { useTask } from "@/contexts/TaskContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { TaskSchema, taskSchema } from "../server/task-types"
import { getPresignedUploadUrl } from "@/features/media/server/action"
import {
  autoSaveDraftTask,
  createTaksPaymentCheckoutSession,
} from "../server/action"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CircleAlert, Loader } from "lucide-react"
import useCurrentUser from "@/hooks/useCurrentUser"
import { PresignedUploadedFileMeta } from "@/features/media/server/media-types"
import { useAutoSave } from "@/hooks/useAutoDraftSave"
import { useAuthGate } from "@/hooks/useAuthGate"
import Loading from "@/app/dashboard/solver/workspace/start/[taskId]/loading"
import AuthGate from "@/components/AuthGate"

export default function TaskCreationPage({
  defaultValues,
}: {
  defaultValues: TaskSchema
}) {
  const {
    category,
    deadline,
    price,
    visibility,
    content,
    selectedFiles,
    description,
    title,
  } = useTask()
  const currentUser = useCurrentUser()
  const { user } = currentUser
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const { isLoading, isBlocked } = useAuthGate(2000)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useAutoSave({
    autoSaveFn: autoSaveDraftTask,
    autoSaveArgs: [
      title,
      description,
      content,
      user?.id!,
      category,
      price,
      visibility,
      deadline,
    ],
    delay: 700,
  })
  useEffect(() => {
    if (typeof window === "undefined") return

    const doc = new DOMParser().parseFromString(content, "text/html")
    const text = doc.body.textContent?.trim() || ""

    setIsDisabled(text.length < 5)
  }, [content])

  async function uploadSelectedFiles(selectedFiles: File[], state?: boolean) {
    const uploadedFileMeta: PresignedUploadedFileMeta[] = []
    for (const file of selectedFiles) {
      const presigned = await getPresignedUploadUrl(
        file.name,
        file.type,
        "task"
      )
      await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      uploadedFileMeta.push({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        filePath: presigned.filePath,
        storageLocation: presigned.publicUrl,
      })
    }
    return JSON.stringify(uploadedFileMeta)
  }

  const form = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  })

  useEffect(() => {
    form.reset({
      title,
      description,
      content,
      deadline,
      visibility,
      category,
      price,
    })
  }, [
    form,
    title,
    description,
    content,
    deadline,
    visibility,
    category,
    price,
  ])

  if (isLoading) return <Loading />
  if (isBlocked) return <AuthGate />
  async function onSubmit(data: TaskSchema) {
    try {
      setIsUploading(true)
      const uploadedFiles = await uploadSelectedFiles(selectedFiles)

      await autoSaveDraftTask(
        title,
        description,
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFiles
      )
      setIsUploading(false)
      const url = await createTaksPaymentCheckoutSession(
        price,
        user?.id!,
        deadline
      )
      router.push(url!)
    } catch (e) {
      console.error(e)
      toast.error(`${(<CircleAlert />)}something Went Wrong`)
    }
  }
  function onError(errors:FieldErrors<TaskSchema>) {
    console.warn("Validation errors ❌", errors)
    setIsSheetOpen(true) 

    
    const firstErrorField = Object.keys(errors)[0]
    const el = document.querySelector(`[name="${firstErrorField}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
  }
  return (
    <div className="flex h-full bg-background ">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <Button
            type="submit"
            form="task-form"
            disabled={isDisabled || isUploading}
            className="hover:cursor-pointer flex items-center justify-center gap-2 min-w-[140px]">
            {isUploading ? (
              <>
                <Loader className="animate-spin w-4 h-4" />
                Uploading files...
              </>
            ) : (
              "Publish Task"
            )}
          </Button>
        </header>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit,onError)}
            id="task-form"
            className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 pb-2">
                <p className="text-sm text-muted-foreground">
                  Describe the task clearly so students can understand and solve
                  it effectively.
                </p>
              </div>
              <div className="flex-1 overflow-auto p-4 pt-0">
                <Suspense>
                  <TaskPostingEditor />
                </Suspense>
              </div>
            </div>
            <NewTaskSidebar open={isSheetOpen} setOpen={setIsSheetOpen} />
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
