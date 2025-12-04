"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMentorshipSession } from "@/contexts/MentorSessionContext";
import { FileChatCardComps } from "@/features/media/components/FileHelpers";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { User2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { User } from "@/features/users/server/user-types";
import MentorChatBuble from "./MentorChatBuble";

export function MentorChatArea({
  user,
  filePreview,
  setFilePreview,
  isPostSession,
}: {
  user: User;
  filePreview: UploadedFileMeta | null;
  setFilePreview: (file: UploadedFileMeta) => void;

  isPostSession: boolean;
}) {
  const { uploadingFiles, chats } = useMentorshipSession();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerInstance = useRef<IntersectionObserver | null>(null);
  const messageRefs = useRef(new Map<string, HTMLElement>());
  const messageRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const seenRef = useRef(new Set<string>());

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("data-id");
        if (!id || seenRef.current.has(id)) return;

        // const chat = session?.chats?.find((c) => c.id === id);
        const chat = chats.find((c) => c.id === id);
        if (!chat) return;

        if (chat.chatOwner.id !== user?.id) {
          seenRef.current.add(id);
          console.log("Message from OTHER user visible:", chat.message);
          // TODO:  mark-as-read mutation
        }
      });
    },
    [chats, user?.id],
  );

  useEffect(() => {
    if (!chats.length) return;
    observerInstance.current = new IntersectionObserver(onIntersect, {
      threshold: 0.3,
    });

    messageRefs.current.forEach((el) => observerInstance.current?.observe(el));

    return () => observerInstance.current?.disconnect();
  }, [onIntersect, chats.length]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const viewport = scrollContainerRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLDivElement | null;

    if (!viewport) {
      console.warn("Viewport not found inside ScrollArea");
      return;
    }

    const handleScroll = (e: Event) => {
      const el = e.currentTarget as HTMLDivElement;
      const { scrollHeight, scrollTop, clientHeight } = el;

      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const nearBottom = distanceFromBottom < 150;
      setIsNearBottom(nearBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    if (isNearBottom) {
      messageRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, isNearBottom]);

  return (
    <ScrollArea
      className="flex-1 h-[500px] p-5 bg relative "
      ref={scrollContainerRef}
    >
      <div className="p-6 space-y-6 max-h-[500px]">
        {chats && chats.length > 0 ? (
          <>
            {chats.map((chat, index) => {
              const isCurrentUser = chat.chatOwner.id === user?.id;
              const isLastBuble = index === chats.length - 1;

              return (
                <MentorChatBuble
                  key={chat.id}
                  chat={chat}
                  filePreview={filePreview}
                  isCurrentUser={isCurrentUser}
                  isLastBuble={isLastBuble}
                  messageRef={messageRef}
                  setFilePreview={setFilePreview}
                  messageRefs={messageRefs}
                  user={user}
                  isPostSession={isPostSession}
                />
              );
            })}

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
              <User2 className="h-8 w-8 text-muted-foreground" />
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
      {!isNearBottom && (
        <button
          onClick={() =>
            messageRef.current?.scrollIntoView({ behavior: "smooth" })
          }
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-1.5 rounded-full shadow-md"
        >
          ↓ New messages
        </button>
      )}
    </ScrollArea>
  );
}
