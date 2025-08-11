"use client"
import { Suspense, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useForm, FormProvider, FieldErrors } from "react-hook-form"
import TaskPostingEditor from "./richTextEdito/Tiptap"
import NewTaskSidebar from "./newTaskSidebar"
import { useTask } from "@/contexts/TaskContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { TaskSchema, taskSchema } from "../server/task-types"
import {
  autoSaveDraftTask,
  createTaksPaymentCheckoutSession,
  validateStripeSession,
} from "../server/action"
import { toast } from "sonner"
import { CircleAlert, Loader } from "lucide-react"
import useCurrentUser from "@/hooks/useCurrentUser"
import { UploadedFileMeta } from "@/features/media/server/media-types"
import { useAutoSave } from "@/hooks/useAutoDraftSave"
import { useAuthGate } from "@/hooks/useAuthGate"
import Loading from "@/app/dashboard/solver/workspace/start/[taskId]/loading"
import AuthGate from "@/components/AuthGate"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useFileUpload } from "@/hooks/useFile"
import { env } from "@/env/client"

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
  const [isDisabled, setIsDisabled] = useState(true)
  const { isLoading:authLoading, isBlocked } = useAuthGate()
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const searchParams = useSearchParams()
  const hasShownToast = useRef(false)
  const sessionId = searchParams.get("session_id")
  const router = useRouter()

  const { data: isValidSession, isLoading} = useQuery({
    queryKey:['stripe-session', sessionId],
    enabled:!!sessionId,
    queryFn:() => validateStripeSession(sessionId!)
  })
  const { uploadMutate, isUploading } = useFileUpload();
 useEffect(()=>{
    if (isValidSession && !hasShownToast.current) {
    toast.success("Task published successfully!")
    router.replace(window.location.pathname)
    hasShownToast.current = true}
 },[isValidSession,router])

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

  if (authLoading) return <Loading />
  if (isBlocked) return <AuthGate />
  async function onSubmit(data: TaskSchema) {
    try {
      toast.loading("uploading files",{id:"file-upload"})
      let uploadedFileMetadata: UploadedFileMeta[] | undefined;
      let uploadedFilesString :string | undefined
      if (selectedFiles && selectedFiles.length > 0) {
        uploadedFileMetadata = await uploadMutate({files:selectedFiles,scope:"task",url:`${env.NEXT_PUBLIC_GO_API_URL}/media`});//golang api
        console.log(uploadedFileMetadata)
        uploadedFilesString = JSON.stringify(uploadedFileMetadata);
      } else {
      
        toast.dismiss("file-upload");
      }
      await autoSaveDraftTask(
        title,
        description,
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline,
        uploadedFilesString
        
      )
       toast.dismiss("file-upload");
      await createTaksPaymentCheckoutSession(
        {price,
        userId:user?.id!,
        deadlineStr:deadline}
      )
     
    } catch (e) {
      console.error(e)
      toast.error(`${(<CircleAlert />)}something Went Wrong`)
    }
  }
  function onError(errors: FieldErrors<TaskSchema>) {
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
            onSubmit={form.handleSubmit(onSubmit, onError)}
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
