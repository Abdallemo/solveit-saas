"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { env } from "@/env/client";
import {
  FileChatCardComps,
  FileIconComponent,
} from "@/features/media/components/FileHelpers";
import MediaPreviewer from "@/features/media/components/MediaPreviewer";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { useIsMobile } from "@/hooks/use-mobile";
import useCurrentUser from "@/hooks/useCurrentUser";
import {
  useDeleteFileChat,
  useDownloadFile,
  useFileUpload,
} from "@/hooks/useFile";
import { useMentorshipCall } from "@/hooks/useVideoCall";
import { sessionTimeUtils, supportedExtentionTypes } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCheck,
  FileText,
  Paperclip,
  Send,
  User,
  User2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { sendMentorMessages } from "../../server/action";
import { FloatingVideo } from "../floating-video";

export default function MentorshipWorkspace({
  sidebar,
  controlled,
}: {
  sidebar: boolean;
  controlled: boolean;
}) {
  const {
    mentorshipSession: session,
    uploadingFiles,
    setUploadingFiles,
  } = useMentorshipSession();
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);
  const { uploadMutate, isUploading } = useFileUpload({ successMsg: false });
  const { user } = useCurrentUser();
  const isMobile = useIsMobile();
  const path = usePathname();
  const [filePreview, setFilePreview] = useState<UploadedFileMeta | null>(null);

  const {
    remoteStream,
    remoteVideo,
    cameraOn,
    micOn,
    setCameraOn,
    setMicOn,
    clearState,
    endCall,
  } = useMentorshipCall(user?.id!, session?.id!);
  const { mutateAsync: downloadFile, isPending: isRequestingDownload } =
    useDownloadFile();
  const { mutateAsync: deleteFile, isPending: isDeletingFile } =
    useDeleteFileChat();
  const handleFileDownload = async (key: string, fileName: string) => {
    toast.loading("preparing file downlad..", {
      id: `file-${fileName}-download`,
    });
    await downloadFile({ fileName, key });
  };
  const handleFiledelete = async (fileId: string, filePath: string) => {
    toast.loading("deleting..", {
      id: `delete-file-${fileId}`,
    });
    await deleteFile({ fileId, filePath });
  };

  const { mutate: sendMessage } = useMutation({
    mutationFn: sendMentorMessages,
    onError: (e) => {
      toast.error(e.message);
    },
  });

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session, uploadingFiles]);

  if (!session) {
    return (
      <main className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No session data available</p>
        </div>
      </main>
    );
  }
  const { sessionDate, timeSlot, sessionStart, sessionEnd } = session;
  const allFiles = session.chats?.flatMap((chat) => chat.chatFiles) || [];
  const isPreSession = sessionTimeUtils.isBeforeSession(
    { sessionStart: sessionStart! },
    new Date()
  );
  const isPostSession = sessionTimeUtils.isAfterSession(
    { sessionEnd },
    new Date()
  );

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && selectedFiles.length === 0) || isPostSession)
      return;
    const text = messageInput;
    const files = selectedFiles;
    setMessageInput("");
    setSelectedFiles([]);
    try {
      if (text.trim()) {
        sendMessage({
          message: text,
          sessionId: session.id,
          sentBy: user?.id!,
          uploadedFiles: [],
        });
      }
      if (files.length > 0) {
        setUploadingFiles(files);
        const uploadedMeta: UploadedFileMeta[] = await uploadMutate({
          files,
          scope: "mentorship",
          url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
        });
        sendMessage({
          message: "",
          sessionId: session.id,
          sentBy: user?.id!,
          uploadedFiles: uploadedMeta,
        });
      }
    } catch (err) {
      toast.error("Failed to send message");
      setUploadingFiles([]);
    }
  };
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };
  return (
    <main className="w-full h-full flex bg-background">
      <div className="flex-1 flex flex-col h-full">
        <div className="border-b bg-card px-6 py-2 flex items-center justify-between">
          <div className={`flex flex-col md:flex gap-2`}>
            <p className="font-medium">{sessionDate}</p>
            <p className="text-muted-foreground">
              {timeSlot?.start} - {timeSlot?.end}
            </p>
          </div>

          {isPreSession && (
            <div className="flex justify-center ">
              <div className="bg-sidebar px-3 py-1.5 rounded-full text-xs font-medium shadow-inner">
                <p>This is a pre-session</p>
              </div>
            </div>
          )}
          {isPostSession && (
            <div className="flex justify-center ">
              <div className="bg-sidebar px-3 py-1.5 rounded-full text-xs font-medium shadow-inner">
                <p>This Session is Ended and its now ReadOnly</p>
              </div>
            </div>
          )}

          {sidebar && (
            <Button size="sm" className="gap-2" asChild>
              <Link href={`${path}/video-call`}>
                <Video className="h-4 w-4" />
                Video Call
              </Link>
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1 h-[500px] p-5">
          <div className="p-6 space-y-6 max-h-[500px]">
            {session.chats && session.chats.length > 0 ? (
              <>
                {session.chats.map((chat, index) => {
                  const isCurrentUser = chat.chatOwner.id === user?.id;

                  return (
                    <div
                      key={chat.id}
                      ref={
                        index === session.chats.length - 1 ? messageRef : null
                      }
                      className={`flex gap-3 ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}>
                      <Avatar className="h-9 w-9 shadow-sm">
                        <AvatarFallback
                          className={
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
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
                                  chat.readAt
                                    ? "text-primary"
                                    : "text-muted-foreground"
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
                            <p className="text-sm leading-relaxed break-all">
                              {chat.message}
                            </p>
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
                              isRequestingDownload &&
                              file.fileName === filePreview?.fileName
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
                              deleteDisable:
                                isPostSession || user?.id !== file.uploadedById,
                            }}
                            downloadAction={async (file) => {
                              await handleFileDownload(
                                file.filePath,
                                file.fileName
                              );
                            }}
                            deleteAction={async (f) => {
                              await handleFiledelete(file.id, f.filePath);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageRef} />

                {uploadingFiles.map((file) => (
                  <div key={file.name} className="flex gap-3 flex-row-reverse">
                    <Avatar className="h-9 w-9 shadow-sm">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name ? (
                          user?.name.charAt(0).toUpperCase()
                        ) : (
                          <User2 className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                      <AvatarImage src={user?.image ?? ""} />
                    </Avatar>
                    <div className="flex-1 flex flex-col items-end space-y-2 ">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <p className="text-sm font-medium text-foreground">
                          {user?.name || "You"}
                        </p>
                      </div>
                      <FileChatCardComps
                        key={file.name}
                        loading
                        file={{
                          fileName: file.name,
                          filePath: "",
                          fileSize: file.size,
                          fileType: file.type,
                          storageLocation: "",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start the conversation by sending a message
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="relative border-t bg-card p-4 flex-shrink-0">
          {selectedFiles.length > 0 && (
            <div className="absolute bottom-full left-0 w-full mb-2 p-3 rounded-lg bg-muted border border-dashed max-h-[120px] overflow-y-auto z-10">
              <p className="text-sm font-medium mb-2">Selected files:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border shadow-sm">
                    <FileIconComponent
                      extension={
                        file.name?.split(".").at(-1) as supportedExtentionTypes
                      }
                      className="h-4 w-4 text-primary flex-shrink-0"
                    />
                    <span className="text-sm truncate max-w-[150px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Input
              placeholder="Type your message..."
              className="flex-1 h-10"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <div
              className={`relative ${
                isPostSession ? "cursor-not-allowed" : ""
              }`}>
              <input
                disabled={isPostSession}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                disabled={isPostSession}
                size="icon"
                variant="outline"
                className="h-10 w-10 bg-transparent">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="icon"
              onClick={handleSendMessage}
              className="h-10 w-10"
              disabled={
                (!messageInput.trim() && selectedFiles.length === 0) ||
                isPostSession
              }>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {!isMobile && sidebar && (
        <div className="w-80 border-l  flex flex-col h-full p-5 gap-2">
          <div className="border-b bg-card px-4 py-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Shared Files</h3>
              <Badge variant="secondary" className="ml-auto">
                {allFiles.length}
              </Badge>
            </div>
          </div>

          <ScrollArea className="flex-1 h-0">
            {allFiles.length > 0 ? (
              <div className="flex flex-col w-full h-100 gap-2  ">
                {allFiles.map((file) => (
                  <div key={file.id} className="w-70">
                    <FileChatCardComps
                      key={file.id}
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
                      downloadAction={async (file) => {
                        await handleFileDownload(file.filePath, file.fileName);
                      }}
                      disabled={
                        isRequestingDownload &&
                        file.fileName === filePreview?.fileName
                      }
                      opt={{
                        deleteDisable:
                          isPostSession || user?.id !== file.uploadedById,
                      }}
                      deleteAction={async (f) => {
                        await handleFiledelete(file.id, f.filePath);
                      }}
                    />
                  </div>
                ))}
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
      )}
      {sidebar && remoteStream && (
        <FloatingVideo
          videoRef={remoteVideo}
          isVisible={true}
          micOn={micOn}
          cameraOn={cameraOn}
          onToggleMute={setMicOn}
          onToggleCamera={setCameraOn}
          endCall={async () => {
            endCall();
            clearState();
          }}
        />
      )}

      <MediaPreviewer
        fileRecords={allFiles}
        filePreview={filePreview}
        onClose={() => {
          setFilePreview(null);
        }}
        onDownload={() => {
          setFilePreview(null);
        }}
      />
    </main>
  );
}
