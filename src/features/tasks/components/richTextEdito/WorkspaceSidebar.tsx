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
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
function SideBarForm() {
  const { user } = useCurrentUser();
  const router = useRouter();
  const pathName = usePathname();
  const [comment, setComment] = useState("");
  const { currentWorkspace } = useWorkspace();
  const { monacoEditor } = useFeatureFlags();
  const [comments] = useState(
    [...(currentWorkspace?.task.taskComments ?? [])].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {mutateAsync:createTaskCommentMuta,isPending} = useMutation({
    mutationFn: createTaskComment,
    onSuccess: () => {},
  });
  async function handleSendComment  ()  {
    if (comment.trim()) {
    await  createTaskCommentMuta({
        comment,
        taskId: currentWorkspace?.taskId!,
        userId: user?.id!,
      });
      setComment("");
      router.refresh();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };
  function onRefresh() {}
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
              disabled={!comment.trim()||isPending}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="ml-auto h-7 w-7 p-0 hover:bg-muted/50 rounded-full">
                  <RotateCcw
                    className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[300px] overflow-hidden">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No comments yet</p>
                    <p className="text-xs mt-1">Start the conversation above</p>
                  </div>
                ) : (
                  <ScrollArea className="h-60 px-2">
                    <div className="space-y-4 pr-2">
                      {comments.map((commentItem) => (
                        <CommentCard
                          key={commentItem.id}
                          comment={commentItem}
                          currentUserId={user?.id!}
                        />
                      ))}
                    </div>
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
  comment: {
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
  currentUserId: string;
}

export function CommentCard({ comment, currentUserId }: CommentCardProps) {
  const isOwner = comment.owner.id === currentUserId;

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isOwner ? "flex-row-reverse" : "flex-row"
      )}>
      <div className="flex-shrink-0">
        <Avatar className={cn("h-8 w-8", isOwner && "ring-2 ring-primary/20")}>
          <AvatarImage src={comment.owner.image || "/placeholder.svg"} />
          <AvatarFallback
            className={cn(
              "text-xs font-medium",
              isOwner ? "bg-primary/10 text-primary" : "bg-muted"
            )}>
            {comment.owner.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div
        className={cn("flex-1 min-w-0", isOwner && "flex flex-col items-end")}>
        <div
          className={cn(
            "flex items-center gap-2 mb-1",
            isOwner ? "flex-row-reverse" : "flex-row"
          )}>
          <div
            className={cn(
              "flex items-center gap-1.5",
              isOwner && "flex-row-reverse"
            )}>
            <span className="text-xs font-medium text-foreground truncate">
              {comment.owner.name?.split(" ")[0]}
            </span>
            {isOwner && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                You
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {comment.createdAt!.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div
          className={cn(
            "relative rounded-2xl px-3 py-2 max-w-[85%] shadow-sm",
            isOwner
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-muted/80 text-foreground rounded-bl-md",
            "group-hover:shadow-md transition-shadow duration-200"
          )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div
            className={cn(
              "absolute top-0 w-3 h-3",
              isOwner
                ? "right-0 translate-x-1 bg-primary"
                : "left-0 -translate-x-1 bg-muted/80",
              "clip-path-triangle"
            )}
            style={{
              clipPath: isOwner
                ? "polygon(0 0, 100% 0, 0 100%)"
                : "polygon(100% 0, 0 0, 100% 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
