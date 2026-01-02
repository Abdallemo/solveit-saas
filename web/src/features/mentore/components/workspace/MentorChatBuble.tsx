import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileChatCardComps } from "@/features/media/components/FileHelpers";
import { UploadedFileMeta } from "@/features/media/media-types";
import { useDeleteFileGeneric, useDownloadFile } from "@/hooks/useFile";
import { CheckCheck, User2 } from "lucide-react";
import type React from "react";

import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { User } from "@/features/users/server/user-types";
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
  user: User;
  setFilePreview: (file: UploadedFileMeta) => void;
  isPostSession: boolean;

  isLastBuble: boolean;
  filePreview: UploadedFileMeta | null;
  messageRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const { setChats } = useMentorshipSession();
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
      }`}
    >
      <Avatar className="h-9 w-9 shadow-sm">
        <AvatarFallback
          className={
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }
        >
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
        }`}
      >
        {/* Header (Name + Time) */}
        <div
          className={`flex items-center gap-2 ${
            isCurrentUser ? "flex-row-reverse" : ""
          }`}
        >
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

        {!chat.isDeleted && (
          <div
            className={`flex flex-col gap-1 ${
              isCurrentUser ? "items-end" : "items-start"
            }`}
          >
            {chat.message && (
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md ${
                  isCurrentUser
                    ? `bg-primary text-primary-foreground ${
                        chat.chatFiles.length > 0
                          ? "rounded-br-sm rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                          : "rounded-br-md rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl"
                      }`
                    : `bg-muted ${
                        chat.chatFiles.length > 0
                          ? "rounded-bl-sm rounded-tr-2xl rounded-tl-2xl rounded-br-2xl"
                          : "rounded-bl-md rounded-tr-2xl rounded-tl-2xl rounded-br-2xl"
                      }`
                }`}
              >
                <p className="text-sm leading-relaxed break-all">
                  {chat.message}
                </p>
              </div>
            )}

            {chat.chatFiles.length > 0 && (
              <div
                className={`flex flex-col gap-2 w-full ${
                  isCurrentUser
                    ? "items-end border-r-2 border-primary/40 pr-3 mr-1"
                    : "items-start border-l-2 border-muted-foreground/20 pl-3 ml-1"
                }`}
              >
                {chat.chatFiles.map((file) => (
                  <>
                    {!file.isDeleted ? (
                      <FileChatCardComps
                        key={file.id}
                        disabled={
                          isRequestingDownload &&
                          file.fileName === filePreview?.fileName
                        }
                        file={{
                          fileName: file.fileName,
                          filePath: file.filePath,
                          fileSize: file.fileSize,
                          fileType: file.fileType,
                        }}
                        action={() => {
                          setFilePreview(file);
                        }}
                        opt={{
                          deleteDisable:
                            isPostSession || user?.id !== file.uploadedById,
                        }}
                        downloadAction={async (f) => {
                          await downloadFile({
                            fileName: f.fileName,
                            key: f.filePath,
                          });
                        }}
                        deleteAction={async (f) => {
                          try {
                            await deleteFile({
                              filePath: f.filePath,
                              chatId: chat.id,
                            });
                          } catch (error) {}
                        }}
                      />
                    ) : (
                      file.isDeleted && (
                        <div
                          className={`rounded-2xl px-4 py-3 hover:shadow-md ${
                            isCurrentUser
                              ? "bg-primary/50 text-primary-foreground rounded-br-md"
                              : "bg-muted/50 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-all">
                            {isCurrentUser
                              ? "you deleted this file"
                              : "this file is deleted"}
                          </p>
                        </div>
                      )
                    )}
                  </>
                ))}
              </div>
            )}
          </div>
        )}

        {chat.isDeleted && (
          <div
            className={`rounded-2xl px-4 py-3 hover:shadow-md ${
              isCurrentUser
                ? "bg-primary/50 text-primary-foreground rounded-br-md"
                : "bg-muted/50 rounded-bl-md"
            }`}
          >
            <p className="text-sm leading-relaxed break-all">
              {isCurrentUser
                ? "you deleted this message"
                : "this message is deleted"}
            </p>
          </div>
        )}

        {isLastBuble && <div ref={messageRef} />}
      </div>
    </div>
  );
}
