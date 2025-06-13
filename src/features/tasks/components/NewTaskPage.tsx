"use client"

import { useState,useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"



import TaskPostingEditor from "./richTextEdito/Tiptap"
import NewTaskSidebar from "./newTaskSidebar"


export default function TaskCreationPage() {
  const [files, setFiles] = useState<File[]>([])

  const handleFileChange = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  return (
    <div className="flex h-full bg-background">
     
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b p-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Post a Task</h1>
          <Button>Publish Task</Button>
        </header>

        <div className="flex-1 flex overflow-hidden">
        
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 pb-2">
              <p className="text-sm text-muted-foreground">
                Describe the task clearly so students can understand and solve it effectively.
              </p>
            </div>

            <div className="flex-1 overflow-auto p-4 pt-0">
              <Suspense>
                <TaskPostingEditor />
              </Suspense>
            </div>
          </div>
          <NewTaskSidebar files={files} />
          
        </div>
      </div>
    </div>
  )
}
