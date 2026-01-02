import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileChatCardComps } from "@/features/media/components/FileHelpers";
import { UploadedFileMeta } from "@/features/media/media-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteFileGeneric, useDownloadFile } from "@/hooks/useFile";
import { FileText } from "lucide-react";

import { User } from "@/features/users/server/user-types";
import { MentorChatSession } from "../../server/types";

type allFilesType = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  uploadedAt: Date | null;
  uploadedById: string;
  isDeleted: boolean | null;
  chatId: string;
}[];
export default function ChatSideBar({
  sidebar,
  allFiles,
  filePreview,

  setFilePreview,

  user,
  isPostSession,
  chat,
}: {
  sidebar: boolean;
  allFiles: allFilesType;
  chat: MentorChatSession[];
  user: User;
  setFilePreview: (file: UploadedFileMeta) => void;
  isPostSession: boolean;

  filePreview: UploadedFileMeta | null;
}) {
  const { mutateAsync: deleteFile, isPending: isDeletingFile } =
    useDeleteFileGeneric("mentorship_chat");

  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const isMobile = useIsMobile();
  if (isMobile || !sidebar) {
    return <></>;
  }
  return (
    <div className="w-80 border-l  flex flex-col h-full p-5 gap-2">
      <div className="border-b bg-card px-4 py-4">
        <div className="flex items-center gap-3">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-medium">Shared Files</h3>
          <Badge variant="secondary" className="ml-auto">
            {allFiles.filter((f) => f.isDeleted == false).length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 h-0">
        {allFiles.length > 0 ? (
          <div className="flex flex-col w-full h-100 gap-2  ">
            {allFiles.map(
              (file) =>
                !file.isDeleted && (
                  <div key={file.id} className="w-70">
                    <FileChatCardComps
                      key={file.id}
                      file={{
                        fileName: file.fileName,
                        filePath: file.filePath,
                        fileSize: file.fileSize,
                        fileType: file.fileType,
                      }}
                      action={() => {
                        setFilePreview(file);
                      }}
                      downloadAction={async (f) => {
                        await downloadFile({
                          fileName: f.fileName,
                          key: f.filePath,
                        });
                      }}
                      disabled={
                        isRequestingDownload &&
                        file.fileName === filePreview?.fileName
                      }
                      opt={{
                        deleteDisable:
                          isPostSession ||
                          user?.id !== file.uploadedById ||
                          isDeletingFile,
                      }}
                      deleteAction={async (f) => {
                        await deleteFile({ filePath: f.filePath });
                      }}
                    />
                  </div>
                ),
            )}
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No files shared</p>
              <p className="text-sm text-muted-foreground">
                Files will appear here when shared
              </p>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
