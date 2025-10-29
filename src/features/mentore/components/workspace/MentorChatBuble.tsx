import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileChatCardComps } from "@/features/media/components/FileHelpers";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { useDeleteFileGeneric, useDownloadFile } from "@/hooks/useFile";
import { CheckCheck, User2 } from "lucide-react";
import type React from "react";

import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { userSessionType } from "@/features/users/server/user-types";
import { MentorChatSession } from "../../server/types";

export default function MentorChatBuble({
  chat,
  messageRefs,
  isCurrentUser,
  user,
  setFilePreview,
  isPostSession,
  filePreview,
  isLastBuble,
  messageRef,
}: {
  chat: MentorChatSession;
  messageRefs: React.RefObject<Map<string, HTMLElement>>;
  isCurrentUser: boolean;
  user: userSessionType;
  setFilePreview: (file: UploadedFileMeta) => void;
  isPostSession: boolean;

  isLastBuble: boolean;
  filePreview: UploadedFileMeta | null;
  messageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const { send } = useMentorshipSession();
  const { mutateAsync: deleteFile, isPending: isDeletingFile } =
    useDeleteFileGeneric("mentorship_chat");

  return (
    <div
      ref={(el) => {
        if (el) {
          messageRefs.current.set(chat.id, el);
        } else {
          messageRefs.current.delete(chat.id);
        }
      }}
      data-id={chat.id}
      key={chat.id}
      className={`flex gap-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}>
      <Avatar className="h-9 w-9 shadow-sm">
        <AvatarFallback
          className={
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }>
          {chat?.chatOwner ? (
            chat?.chatOwner.name?.charAt(0).toUpperCase()
          ) : (
            <User2 className="h-4 w-4" />
          )}
        </AvatarFallback>
        <AvatarImage src={chat.chatOwner.image ?? ""} />
      </Avatar>
      <div
        className={`flex-1 space-y-2 flex flex-col min-w-0 max-w-sm md:max-w-lg xl:max-w-xl ${
          isCurrentUser ? "items-end" : "items-start"
        }`}>
        <div
          className={`flex items-center gap-2 ${
            isCurrentUser ? "flex-row-reverse" : ""
          }`}>
          <p className="text-sm font-medium text-foreground">
            {chat.chatOwner.name.split(" ")[0]}
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">
              {chat.createdAt!.toLocaleTimeString(undefined)}
            </p>
            {isCurrentUser && (
              <CheckCheck
                className={`h-3 w-3 ${
                  chat.readAt ? "text-primary" : "text-muted-foreground"
                }`}
              />
            )}
          </div>
        </div>
        {chat.message && (
          <div
            className={`rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted rounded-bl-md"
            }`}>
            <p className="text-sm leading-relaxed break-all">{chat.message}</p>
          </div>
        )}
        {chat.isDeleted && (
          <div
            className={`rounded-2xl px-4 py-3  hover:shadow-md ${
              isCurrentUser
                ? "bg-primary/50 text-primary-foreground rounded-br-md"
                : "bg-muted/50 rounded-bl-md"
            }`}>
            <p className="text-sm leading-relaxed break-all">
              {isCurrentUser
                ? "you deleted this message"
                : "this message is deleted"}
            </p>
          </div>
        )}
        {chat.chatFiles.map((file) => (
          <FileChatCardComps
            key={file.id}
            disabled={
              isRequestingDownload && file.fileName === filePreview?.fileName
            }
            file={{
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize,
              fileType: file.fileType,
              storageLocation: file.storageLocation,
            }}
            action={() => {
              setFilePreview(file);
            }}
            opt={{
              deleteDisable: isPostSession || user?.id !== file.uploadedById,
            }}
            downloadAction={async (f) => {
              await downloadFile({ fileName: f.fileName, key: f.filePath });
            }}
            deleteAction={async (f) => {
              try {
                await deleteFile({ filePath: f.filePath });
                send({ ...chat, messageType: "chat_deleted" });
              } catch (error) {
                console.log("failed to delte")
              }
            }}
          />
        ))}
        {isLastBuble && <div ref={messageRef} />}
      </div>
    </div>
  );
}
