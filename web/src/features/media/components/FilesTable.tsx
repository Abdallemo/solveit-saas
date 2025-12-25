"use client";

import { AuthGate } from "@/components/GateComponents";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { taskTableType } from "@/drizzle/schemas";
import { SolutionById } from "@/features/tasks/server/task-types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useDownloadFile } from "@/hooks/useFile";
import { supportedExtentionTypes } from "@/lib/utils/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Archive,
  Copy,
  Download,
  Eye,
  File,
  FileAudio,
  FileText,
  FileVideo,
  ImageIcon,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FileIconComponent } from "./FileHelpers";
//import MediaPreviewer from "./MediaPreviewer";

import dynamic from "next/dynamic";

const MediaPreviewer = dynamic(
  () => import("@/features/media/components/MediaPreviewer"),
  {
    ssr: false,
  },
);
interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storageLocation: string;
  filePath: string;
  uploadedAt: Date | null;
}

function getFileIcon(fileType: string) {
  const type = fileType.toLowerCase();

  if (type.includes("image"))
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
  if (type.includes("video"))
    return <FileVideo className="h-4 w-4 text-purple-500" />;
  if (type.includes("audio"))
    return <FileAudio className="h-4 w-4 text-green-500" />;
  if (type.includes("pdf"))
    return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes("zip") || type.includes("rar"))
    return <Archive className="h-4 w-4 text-orange-500" />;

  return <File className="h-4 w-4 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

type FilesTablePropss =
  | { files: FileData[]; scopeType: "task"; scope?: taskTableType }
  | { files: FileData[]; scopeType: "solution"; scope?: SolutionById };
// | { files: FileData[]; scopeType: "free"; scope?: SolutionById };

export function FilesTable({ files, scope, scopeType }: FilesTablePropss) {
  const currentUser = useCurrentUser();
  const [filePreview, setFilePreview] = useState<FileData | null>(null);
  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const handleFileDownload = async ({
    fileName,
    key,
  }: {
    key: string;
    fileName: string;
  }) => {
    toast.loading("preparing file downlad..", {
      id: `file-${fileName}-download`,
    });
    await downloadFile({ fileName, key });
  };

  if (!currentUser) return <AuthGate />;

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-sidebar rounded-md border w-full">
        <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No files attached to this task</p>
      </div>
    );
  }
  async function handleFileAction(action: string, file: FileData) {
    switch (action) {
      case "view":
        setFilePreview(file);
        break;
      case "download":
        handleFileDownload({ key: file.filePath, fileName: file.fileName });
        break;
      case "copy":
        await navigator.clipboard.writeText(file.storageLocation);
        toast.success("Link copied to clipboard", { duration: 2000 });
        break;
      case "delete":
        break;
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col rounded-md border w-full max-w-full overflow-hidden">
      <div className="flex-1 w-full overflow-x-auto overflow-y-auto">
        <Table className="bg-card min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20px] overflow-auto"></TableHead>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Type</TableHead>
              <TableHead className="whitespace-nowrap">Size</TableHead>
              <TableHead className="whitespace-nowrap">Uploaded</TableHead>
              <TableHead className="w-[20px] "></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <FileIconComponent
                    extension={
                      file.fileName
                        ?.split(".")
                        .at(-1) as supportedExtentionTypes
                    }
                    className="h-4 w-4 text-primary flex-shrink-0"
                  />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="font-medium">{file.fileName}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sidebar-foreground text-muted">
                    {file.fileType}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatFileSize(file.fileSize)}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {file.uploadedAt
                    ? formatDistanceToNow(new Date(file.uploadedAt), {
                        addSuffix: true,
                      })
                    : "Unknown"}
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
                      <DropdownMenuItem
                        onClick={() => handleFileAction("view", file)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleFileAction("download", file)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleFileAction("copy", file)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                      {scope &&
                        scopeType === "task" &&
                        currentUser.user?.id === scope.posterId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleFileAction("delete", file)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <MediaPreviewer
        filePreview={filePreview}
        fileRecords={files}
        codeEditorOptions={{ readOnly: true }}
        onClose={() => setFilePreview(null)}
        onDownload={() => setFilePreview(null)}
      />
    </div>
  );
}
