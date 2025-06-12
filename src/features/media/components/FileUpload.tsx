"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  className?: string
}

export default function FileUploadUi({ onFilesChange, maxFiles = 5, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length)
    const updatedFiles = [...files, ...fileArray]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const showFiles = () => {
    if (files.length === 0) {
      toast.info("No files selected")
      return
    }

    const fileList = files.map((file) => `• ${file.name} (${(file.size / 1024).toFixed(1)} KB)`).join("\n")
    toast.success(`Selected Files (${files.length}):\n${fileList}`)
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">
          {files.length}/{maxFiles} files selected
        </p>
      </div>

      {files.length > 0 && (
        <Button onClick={showFiles} className="w-full mt-3" variant="outline">
          Show Selected Files
        </Button>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-2 bg-muted rounded-md">
              <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size).toFixed(1)} </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
