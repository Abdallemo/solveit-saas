"use client";
import { MonacoEditor } from "@/components/editors/MonocaEditor";
import { CodeEditorDialog } from "@/components/editors/MonocaWraper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { env } from "@/env/client";
import {
  FileChatCardComps,
  FileIconComponent,
} from "@/features/media/components/FileHelpers";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import type {
  MentorChatSession,
  MentorSession,
} from "@/features/mentore/server/types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFileUpload } from "@/hooks/useFile";
import useWebSocket from "@/hooks/useWebSocket";
import { isBeforeSession, supportedExtentions } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCheck,
  Clock,
  FileText,
  Paperclip,
  Send,
  User,
  User2,
  Video,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { sendMentorMessages } from "../../server/action";

type Files = { [key: string]: string };
export default function MentorshipWorkspace({
  mentorWorkspace: session,
}: {
  mentorWorkspace: MentorSession;
}) {
  const [chats, setChats] = useState(session?.chats);
  const [messageInput, setMessageInput] = useState("");
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const messageRef = useRef<HTMLDivElement>(null);
  const { uploadMutate, isUploading } = useFileUpload({ successMsg: false });
  const { user } = useCurrentUser();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [filePreview, setFilePreview] = useState<UploadedFileMeta>();
  const [files, setFiles] = useState<Files>({ "index.js": "console.log" });
  const handleFilesChange = (filename: string, content: string) => {
    setFiles((prev) => ({ ...prev, [filename]: content }));
  };

  const handleSave = (filename: string, content: string) => {
    console.log(`Saving ${filename}:`, content);
  };

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
  useWebSocket<MentorChatSession>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/mentorship?session_id=${session?.id}`,
    {
      onMessage: (msg) => {
        setChats((prev) => [
          ...prev!,
          {
            ...msg,
            createdAt: new Date(msg.createdAt!),
            readAt: null,
          },
        ]);
        if (msg.chatFiles?.length > 0 && msg.sentBy === user?.id) {
          setUploadingFiles([]);
        }
      },
    }
  );

  const { mutate: sendMessage } = useMutation({
    mutationFn: sendMentorMessages,
    onError: () => {
      toast.error("failed to send Message");
    },
  });
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, session, uploadingFiles]);
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
  const { sessionDate, timeSlot } = session;
  const allFiles = chats?.flatMap((chat) => chat.chatFiles) || [];
  const isPreSession = isBeforeSession({
    sessionDate,
    session: timeSlot,
    now: new Date(),
  });

  const handleSendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    const text = messageInput;
    const files = selectedFiles;
    setMessageInput("");
    setSelectedFiles([]);
    try {
      if (text.trim()) {
        sendMessage({
          message: text,
          seesionId: session.id,
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
          seesionId: session.id,
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
        <div className="border-b bg-card px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <p className="font-medium">{sessionDate}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {timeSlot?.start} - {timeSlot?.end}
                </span>
              </div>
            </div>
          </div>
          {/*  */}

          {isPreSession && (
            <Badge variant={"success"} className="h-6">
              this is a pre-session chat. Use this space to confirm details and
              share resources.
            </Badge>
          )}

          <Button
            size="sm"
            className="gap-2"
            onClick={() => router.push(`${path}/video-call`)}>
            <Video className="h-4 w-4" />
            Video Call
          </Button>
        </div>
        <ScrollArea className="flex-1 h-[500px] p-5">
          <div className="p-6 space-y-6 max-h-[500px]">
            {chats && chats.length > 0 ? (
              <>
                {chats.map((chat, index) => {
                  const isCurrentUser = chat.chatOwner.id === user?.id;

                  return (
                    <div
                      key={chat.id}
                      ref={index === chats.length - 1 ? messageRef : null}
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
                        className={`flex-1 max-w-md space-y-2 flex flex-col ${
                          isCurrentUser ? "items-end" : "items-start"
                        }`}>
                        <div
                          className={`flex items-center gap-2 ${
                            isCurrentUser ? "flex-row-reverse" : ""
                          }`}>
                          <p className="text-sm font-medium text-foreground">
                            {chat.chatOwner.name}
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
                            <p className="text-sm leading-relaxed">
                              {chat.message}
                            </p>
                          </div>
                        )}
                        {chat.chatFiles.map((file) => (
                          <FileChatCardComps
                            opt={
                              <Image
                                src={file.storageLocation!}
                                alt={file.fileName!}
                                className="w-10 h-10"
                              />
                            }
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
                              setOpen((prev) => !prev);
                              setIsCodeEditorOpen((prev) => !prev);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageRef} />
                {/* <Dialog open={open} onOpenChange={setOpen}>
                  <DialogContent className="sm:max-w-[calc(100vw-300px)] lg:max-w-[calc(100vw-500px)] xl:max-w-[calc(100vw-600px)] h-[calc(100vh-100px)] flex flex-col justify-center items-center p-4">
                    <DialogHeader className="w-full h-full">
                      <DialogTitle></DialogTitle>

                      {isImage(fileExtention(filePreview?.fileName!)) && (
                        <Image
                          alt={filePreview?.fileName!}
                          src={filePreview?.storageLocation!}
                          width={0}
                          height={0}
                          sizes="100vw"
                          style={{ width: "100%", height: "auto" }}
                          className="object-contain max-h-full max-w-full"
                        />
                      )}
                      {isVideo(fileExtention(filePreview?.fileName!)) && (
                        <video
                          src={filePreview?.storageLocation!}
                          autoPlay
                          controls
                        />
                      )}
                      {isCode(fileExtention(filePreview?.fileName!)) && (
                        <div className="w-full h-full">
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
                        </div>
                      )}
                      {isDoc(fileExtention(filePreview?.fileName!)) && (
                        <iframe
                          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                            filePreview?.storageLocation!
                          )}`}
                          className="w-full h-full rounded-lg shadow-md border"
                        />
                      )}
                    </DialogHeader>
                  </DialogContent>
                </Dialog> */}
                <CodeEditorDialog
                  isOpen={isCodeEditorOpen}
                  onClose={() => setIsCodeEditorOpen(false)}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={setIsFullscreen}
                  activeFile={{
                    name: filePreview?.fileName!,
                    type: filePreview?.fileType!,
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
                    <div className="flex-1 max-w-md flex flex-col items-end space-y-2">
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
        <div className="border-t bg-card p-4 flex-shrink-0">
          {selectedFiles.length > 0 && (
            <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-dashed max-h-[120px] overflow-y-auto">
              <p className="text-sm font-medium mb-2">Selected files:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-background border shadow-sm">
                    <FileIconComponent
                      extension={
                        file.name?.split(".").at(-1) as supportedExtentions
                      }
                      className="h-4 w-4 text-primary flex-shrink-0"
                    />
                    <span className="text-sm">{file.name}</span>
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
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
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
              disabled={!messageInput.trim() && selectedFiles.length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
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
            <div className="flex flex-col w-fit h-100 gap-2 ">
              {allFiles.map((file) => (
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
                    setOpen((prev) => !prev);
                  }}
                />
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
    </main>
  );
}
