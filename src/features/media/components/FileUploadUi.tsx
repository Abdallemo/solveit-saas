"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload, X, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { NewuseTask } from "@/contexts/TaskContext";

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function FileUploadUi({
  onFilesChange,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  // const { selectedFiles, setSelectedFiles } = useTask(); // Migrated from
  const { selectedFiles, setSelectedFiles } = NewuseTask(); // migrated to

  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    console.log("files: " + newFiles);
    const fileArray = Array.from(newFiles).slice(
      0,
      maxFiles - selectedFiles.length
    );
    const updatedFiles = [...selectedFiles, ...fileArray];
    setSelectedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const showFiles = () => {
    if (selectedFiles.length === 0) {
      toast.info("No files selected");
      return;
    }

    const fileList = selectedFiles
      .map((file) => `• ${file.name} (${(file.size / 1024).toFixed(1)} KB)`)
      .join("\n");
    toast.success(`Selected Files (${selectedFiles.length}):\n${fileList}`);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        <Input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            e.preventDefault();
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 rounded-full bg-muted">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">
            Drop files here or click to browse
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleButtonClick}>
            Select Files
          </Button>
        </div>
      </div>
      {selectedFiles.length > 0 && (
        <ScrollArea className="flex-1 flex flex-col gap-3 h-50">
          <div className="mt-2 space-y-2  bg-amber-40 h-[120px] overflow-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-2 bg-muted rounded-md ">
                <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
