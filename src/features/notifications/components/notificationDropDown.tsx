"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dot, DotIcon, Inbox } from "lucide-react";
import Link from "next/link";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { logger } from "@/lib/logging/winston";
import { env } from "@/env/client";
type Message = {
  id: string;
  createdAt: Date | null;
  content: string;
  senderId: string;
  receiverId: string;
  subject: string | null;
  method: "SYSTEM" | "EMAIL";
  read: boolean;
};

export default function NotificationDropDown({
  initailAllNotifications,
}: {
  initailAllNotifications: Message[];
}) {
  console.log("intial notificaion:", initailAllNotifications);
  const { user } = useCurrentUser();
  const [Messages, setMessages] = useState<Message[]>(
    initailAllNotifications ?? []
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const userId = user?.id;
  useEffect(() => {
    const ws = new WebSocket(
      `${env.NEXT_PUBLIC_GO_API_WS_URL}/notification?user_id=${userId}`
    );

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const msg: Message = JSON.parse(event.data);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [msg, ...prev];
      });
      console.log("Notification for me:", msg);
    };

    ws.onerror = (error) => {
      setIsConnected(false);
    };
    return () => {
      ws.close();
    };
  }, [userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-8 relative bg-transparent">
          <Inbox className="size-5" />
          {Messages.length > 0 && (
            <Badge
              variant="success"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {Messages.length}
            </Badge>
          )}
          <span className="sr-only">Toggle notification</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 border-b">
          <h4 className="font-semibold text-sm flex items-center gap-1">
            Notifications
            {isConnected && (
              <DotIcon
                size={10}
                className="bg-blue-500 rounded-full animate-pulse "
              />
            )}
          </h4>
          <p className="text-xs text-muted-foreground">
            You have {Messages.length} unread notifications
          </p>
        </div>
        <DropdownMenuGroup className="max-h-64 overflow-y-auto">
          {Messages.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild className="p-0">
              <Link href="#" className="block p-3 hover:bg-accent">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.content}
                  </p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {Messages.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
