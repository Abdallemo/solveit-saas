"use client";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { env } from "@/env/client";
import MediaPreviewer from "@/features/media/components/MediaPreviewer";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useFileUpload } from "@/hooks/useFile";
import { useMentorshipCall } from "@/hooks/useVideoCall";
import { sessionTimeUtils } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { sendMentorMessages } from "@/features/mentore/server/action";
import { FloatingVideo } from "../floating-video";
import ChatInput from "./ChatInput";
import ChatSideBar from "./ChatSideBar";
import { MentorChatArea } from "./MentorChatArea";
import MentorChatHeader from "./MentorChatHeader";

export default function MentorshipWorkspace({
  sidebar,
  controlled,
}: {
  sidebar: boolean;
  controlled: boolean;
}) {
  const {
    mentorshipSession: session,
    setUploadingFiles,
    chats,
    sentTo,
    setChats,
    send
  } = useMentorshipSession();
  const [messageInput, setMessageInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMutate, isUploading } = useFileUpload({ successMsg: false });
  const { user } = useCurrentUser();

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

  const { mutate: sendMessage } = useMutation({
    mutationFn: sendMentorMessages,
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: (data) => {
      if (data) {
        setChats((prev) => [...prev, data]);
        send({...data,messageType:"chat_message"})
      }

    },
  });

  const allFiles = useMemo(() => {
    return chats.flatMap((chat) => chat.chatFiles);
  }, [chats]);

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

  const isPostSession = sessionTimeUtils.isAfterSession(
    { sessionEnd: session.sessionEnd },
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
          sentTo: sentTo!,
          uploadedFiles: [],
        });
      }
      if (files.length > 0) {
        setUploadingFiles(files);
        const uploadedMeta = await uploadMutate({
          files,
          scope: "mentorship",
          url: `${env.NEXT_PUBLIC_GO_API_URL}/media`,
        });
        sendMessage({
          message: "",
          sessionId: session.id,
          sentBy: user?.id!,
          sentTo: sentTo!,
          uploadedFiles: uploadedMeta,
        });
        setUploadingFiles([]);
      }
    } catch (err) {
      toast.error("Failed to send message");
      setUploadingFiles([]);
    }
  };
  return (
    <main className="w-full h-full flex bg-background">
      <div className="flex-1 flex flex-col h-full">
        <MentorChatHeader session={session} sideBar={sidebar} />

        <MentorChatArea
          filePreview={filePreview}
          isPostSession={isPostSession}
          setFilePreview={setFilePreview}
          user={user!}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isPostSession={isPostSession}
          messageInput={messageInput}
          selectedFiles={selectedFiles}
          setMessageInput={setMessageInput}
          setSelectedFiles={setSelectedFiles}
        />
      </div>
      <ChatSideBar
        allFiles={allFiles}
        chat={chats}
        filePreview={filePreview}
        isPostSession={isPostSession}
        setFilePreview={setFilePreview}
        sidebar={sidebar}
        user={user!}
      />
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
