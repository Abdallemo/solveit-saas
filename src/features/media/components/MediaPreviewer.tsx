"use client";
import { FileDialogDialog } from "@/components/FileDiaglogWraper";
import ZoomableImage from "@/components/ImageZoomble";
import { VideoPlayer } from "@/components/VidoePlayer";
import { MonacoEditor } from "@/components/editors/MonocaEditor";
import { CodeEditorDialog } from "@/components/editors/MonocaWraper";
import { useDownloadFile } from "@/hooks/useFile";
import {
  fileExtention,
  // isArchive,
  isAudio,
  isCode,
  isDoc,
  isImage,
  isUnsupportedExtention,
  isVideo,
} from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UploadedFileMeta } from "../server/media-types";

type MediaPreviewerProps = {
  filePreview: UploadedFileMeta | null;
  onClose?: () => void;
  onDownload?: () => void;
};

type Files = { [key: string]: string };

export default function MediaPreviewer({
  filePreview,
  onClose,
  onDownload,
}: MediaPreviewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [files, setFiles] = useState<Files>({ "index.js": "console.log" });
  const [isFileOpen, setIsFileOpen] = useState(false);
  const { mutate: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();

  useEffect(() => {
    if (filePreview) {
      setIsFileOpen(true);
    } else {
      setIsFileOpen(false);
    }
  }, [filePreview]);
  useEffect(() => {
    if (!filePreview) return;

    if (isUnsupportedExtention(fileExtention(filePreview.fileName))) {
      toast.loading("preparing file downlad..", {
        id: `file-${filePreview.fileName}-download`,
      });
      downloadFile({
        key: filePreview.filePath,
        fileName: filePreview.fileName,
      });
      onDownload?.();
    }

    return () => {};
  }, [filePreview, downloadFile, onDownload]);

  const handleClose = () => {
    setIsFileOpen(false);
    onClose?.();
  };

  const handleFilesChange = (filename: string, content: string) =>
    setFiles((prev) => ({ ...prev, [filename]: content }));

  const handleSave = (filename: string, content: string) =>
    console.log(`Saving ${filename}:`, content);

  const handleFileAdd = (filename: string) => {
    setFiles((prev) => ({ ...prev, [filename]: "" }));
    console.log(`Added new file: ${filename}`);
  };

  const handleFileDelete = (filename: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[filename];
      return newFiles;
    });
    console.log(`Deleted file: ${filename}`);
  };

  if (!filePreview) return null;

  const ext = fileExtention(filePreview.fileName);

  if (isVideo(ext)) {
    return (
      <FileDialogDialog
        isOpen={isFileOpen}
        onClose={handleClose}
        activeFile={{
          name: filePreview.fileName,
          type: filePreview.fileType,
        }}>
        <VideoPlayer
          src={filePreview.storageLocation}
          className="w-full aspect-video"
        />
      </FileDialogDialog>
    );
  }

  if (isAudio(ext)) {
    return (
      <FileDialogDialog
        isOpen={isFileOpen}
        onClose={handleClose}
        activeFile={{
          name: filePreview.fileName,
          type: filePreview.fileType,
        }}>
        <audio src={filePreview.storageLocation} autoPlay controls />
      </FileDialogDialog>
    );
  }

  if (isImage(ext)) {
    return (
      <FileDialogDialog
        isOpen={isFileOpen}
        onClose={handleClose}
        activeFile={{
          name: filePreview.fileName,
          type: filePreview.fileType,
        }}>
        <ZoomableImage
          alt={filePreview.fileName}
          src={filePreview.storageLocation}
        />
      </FileDialogDialog>
    );
  }

  if (isCode(ext)) {
    return (
      <CodeEditorDialog
        isOpen={isFileOpen}
        onClose={handleClose}
        isFullscreen={isFullscreen}
        setIsFullscreen={setIsFullscreen}
        activeFile={{
          name: filePreview.fileName,
          type: filePreview.fileType,
        }}
        mode="editor">
        <MonacoEditor
          files={files}
          onChange={handleFilesChange}
          onSave={handleSave}
          onFileAdd={handleFileAdd}
          onFileDelete={handleFileDelete}
          height="800px"
          theme="vs-dark"
          className="shadow-lg"
        />
      </CodeEditorDialog>
    );
  }
  if (isDoc(fileExtention(filePreview?.fileName!))) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          filePreview?.storageLocation!
        )}`}
        className="w-full h-full rounded-lg shadow-md border"
      />
    );
  }

  return null;
}
