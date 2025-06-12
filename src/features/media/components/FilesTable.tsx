"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  File,
  FileText,
  ImageIcon,
  FileVideo,
  FileAudio,
  Archive,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Copy,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FileData {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  storageLocation: string
  filePath: string
  uploadedAt: Date | null
}

interface FilesTableProps {
  files: FileData[]
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase()

  if (type.includes("image")) return <ImageIcon className="h-4 w-4 text-blue-500" />
  if (type.includes("video")) return <FileVideo className="h-4 w-4 text-purple-500" />
  if (type.includes("audio")) return <FileAudio className="h-4 w-4 text-green-500" />
  if (type.includes("pdf")) return <FileText className="h-4 w-4 text-red-500" />
  if (type.includes("zip") || type.includes("rar")) return <Archive className="h-4 w-4 text-orange-500" />

  return <File className="h-4 w-4 text-gray-500" />
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function handleFileAction(action: string, file: FileData) {
  switch (action) {
    case "view":
      window.open(file.storageLocation, "_blank")
      break
    case "download":
      const link = document.createElement("a")
      link.href = file.storageLocation
      link.download = file.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      break
    case "copy":
      navigator.clipboard.writeText(file.storageLocation)
      break
    case "delete":
      console.log("Delete file:", file.id)
      break
    default:
      break
  }
}

export function FilesTable({ files }: FilesTableProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-white rounded-md border">
        <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No files attached to this task</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-background/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="w-[20px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{getFileIcon(file.fileType)}</TableCell>
              <TableCell>
                <div className="font-medium">{file.fileName}</div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {file.fileType}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatFileSize(file.fileSize)}</TableCell>
              <TableCell className="text-muted-foreground">
                {file.uploadedAt ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true }) : "Unknown"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleFileAction("view", file)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileAction("download", file)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFileAction("copy", file)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFileAction("delete", file)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
