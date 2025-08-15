"use client";
import type React from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Send,
  MessageCircle,
  Code2,
  Lock,
  RotateCcw,
  User2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Ref, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useCurrentUser from "@/hooks/useCurrentUser";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUploadSolver from "@/features/media/components/FileUploadSolver";
import { useRouter, usePathname } from "next/navigation";
import { useFeatureFlags } from "@/contexts/FeatureFlagContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation } from "@tanstack/react-query";
import { createTaskComment } from "../../server/action";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getColorClass } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import useWebSocket from "@/hooks/useWebSocket";
import { env } from "@/env/client";

export default function WorkspaceSidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          size="icon"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-sidebar hover:bg-background text-foreground cursor-pointer rounded-full shadow-lg">
          <FileText className="w-5 h-5" />
        </Button>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Solution Workspace</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <SideBarForm />
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="w-80 border-l bg-muted/20 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-background">
        <div className="flex justify-center gap-1">
          <h2 className="font-medium">Solution Workspace</h2>
        </div>
      </div>
      <SideBarForm />
    </div>
  );
}

export type commentType = {
  id: string;
  content: string;
  createdAt: Date | null;
  userId: string;
  taskId: string;
  owner: {
    name: string | null;
    id: string;
    role: "ADMIN" | "MODERATOR" | "POSTER" | "SOLVER" | null;
    image: string | null;
    email: string | null;
    password: string | null;
    emailVerified: Date | null;
    createdAt: Date | null;
  };
};

function SideBarForm() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const pathName = usePathname();
  const [comment, setComment] = useState("");
  const { currentWorkspace } = useWorkspace();
  const { monacoEditor } = useFeatureFlags();
  const latestCommentRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: createTaskCommentMuta, isPending } = useMutation({
    mutationFn: createTaskComment,
    onSuccess: () => {},
  });
  const [comments, setComments] = useState<commentType[]>(
    [...(currentWorkspace?.task.taskComments ?? [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
  );
  //on progress
  useWebSocket<commentType>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/comments?task_id=${currentWorkspace?.taskId}`,
    {
      onMessage: (comment) => {
        setComments((prev) => [...prev, comment]);
      },
    }
  );
  useEffect(() => {
    if (latestCommentRef.current) {
      latestCommentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  async function handleSendComment() {
    if (!comment.trim()) return;
    //old
    // const newComment: commentType = {
    //   id: crypto.randomUUID(),
    //   content: comment,
    //   createdAt: new Date(),
    //   userId: user!.id!,
    //   taskId: currentWorkspace!.taskId,
    //   owner: {
    //     name: user!.name ?? null,
    //     id: user!.id!,
    //     role: user!.role ?? null,
    //     image: user!.image ?? null,
    //     email: user!.email ?? null,
    //     password: null,
    //     emailVerified: null,
    //     createdAt: null,
    //   },
    // };
    setComment("");
    await createTaskCommentMuta({
      comment,
      taskId: currentWorkspace?.taskId!,
      userId: user?.id!,
    });
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };
  function onRefresh() {
    router.refresh();
  }
  return (
    <div className="p-2 space-y-4 flex flex-col h-full">
      <div className="space-y-1 ">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex w-full justify-between">
            <Label>Attachments</Label>
            {monacoEditor ? (
              <Button
                onClick={() => router.push(`${pathName}/codeEditor`)}
                className="cursor-pointer">
                Open Code Editor <Code2 />{" "}
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={false}
                    className="opacity-50 cursor-not-allowed">
                    Open Code Editor <Code2 /> <Lock />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>under construction</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <FileUploadSolver />
      </div>

      <Separator />
      <>
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <Label>Add Comment</Label>
          </div>
          <div className="flex gap-2">
            <TextareaAutosize
              minRows={1}
              maxRows={3}
              className="flex-1 min-h-[40px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all duration-200"
              placeholder="Type your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button
              size="sm"
              onClick={handleSendComment}
              disabled={!comment.trim() || isPending}
              className="self-end rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex-1 min-h-0">
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex-1 min-h-0">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No comments yet</p>
                    <p className="text-xs mt-1">Start the conversation above</p>
                  </div>
                ) : (
                  <ScrollArea className="h-85 w-full px-2">
                    {comments.map((commentItem, index) => {
                      const isLast = index === comments.length - 1;
                      return (
                        <CommentCard
                          key={commentItem.id}
                          comment={commentItem}
                          currentUserId={user?.id!}
                          ref={isLast ? latestCommentRef : null}
                          compact={true}
                        />
                      );
                    })}
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    </div>
  );
}

interface CommentCardProps {
  comment: commentType;
  currentUserId: string;
  ref: Ref<HTMLDivElement>;
  showRole?:boolean
  compact?:boolean
}

export function CommentCard (
  { comment, currentUserId, compact = false, showRole = false ,ref}:CommentCardProps){
    const isOwner = comment.owner.id === currentUserId
    const displayName = isOwner ? "You" : comment.owner.name?.split(" ")[0] 
    const createdAt = new Date(comment.createdAt as any)

    const formatDate = (date: Date) => {
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (diffInHours < 168) {
        // 7 days
        return date.toLocaleDateString([], { weekday: "short" })
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      }
    }

    if (compact) {
      return (
        <div ref={ref} className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={comment.owner.image || undefined} alt={displayName} />
            <AvatarFallback className="text-xs">
              {comment.owner.name ? comment.owner.name.charAt(0).toUpperCase() : <User2 className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-sm font-medium truncate ${isOwner ? "text-primary" : "text-foreground"}`}>
                  {displayName}
                </span>
                {showRole && comment.owner.role && (
                  <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 ${getColorClass(comment.owner.role)}`}>
                    {comment.owner.role.toLowerCase()}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">{formatDate(createdAt)}</span>
            </div>

            <p className="text-sm text-muted-foreground break-words w-40">{comment.content}</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className="flex items-start gap-4 p-4 border-b border-border/50 last:border-b-0">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.owner.image || undefined} alt={displayName} />
          <AvatarFallback>
            {comment.owner.name ? comment.owner.name.charAt(0).toUpperCase() : <User2 className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isOwner ? "text-primary" : "text-foreground"}`}>{displayName}</span>
              {showRole && comment.owner.role && (
                <Badge variant="secondary" className={`text-xs ${getColorClass(comment.owner.role)}`}>
                  {comment.owner.role.toLowerCase()}
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{formatDate(createdAt)}</span>
          </div>

          <p className="text-sm text-foreground break-words">{comment.content}</p>
        </div>
      </div>
    )
  }

