"use client";
import type React from "react";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Send, MessageCircle, Code2 } from "lucide-react";
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
import { useRouter ,usePathname} from "next/navigation";

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
  const router = useRouter()
  const pathName = usePathname()
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    Array<{ id: string; text: string; timestamp: Date; author: string }>
  >([]);

  const handleSendComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: Date.now().toString(),
        text: comment,
        timestamp: new Date(),
        author: user?.name || "Anonymous",
      };
      setComments((prev) => [...prev, newComment]);
      setComment("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  return (
    <div className="p-2 space-y-4 flex flex-col h-full">
      <div className="space-y-1 ">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex w-full justify-between">
          <Label>Attachments</Label>
          <Button onClick={()=>router.push(`${pathName}/codeEditor`)} className="cursor-pointer">Open Code Editor <Code2/> </Button>
          </div>
        </div>
        <FileUploadSolver />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <Label>Add Comment</Label>
        </div>
        <div className="flex gap-2">
          <TextareaAutosize
            minRows={1}
            maxRows={3}
            className="flex-1 min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            placeholder="Type your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button
            size="sm"
            onClick={handleSendComment}
            disabled={!comment.trim()}
            className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 min-h-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs">Start the conversation above</p>
                </div>
              ) : (
                comments.map((commentItem) => (
                  <div key={commentItem.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        {commentItem.author}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {commentItem.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {commentItem.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
