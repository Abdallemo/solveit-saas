"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { env } from "@/env/client";
import { cn } from "@/lib/utils";
import { AlertCircle, Bell, Mail, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { userSessionType } from "@/features/users/server/user-types";
import {
  useNotificationDelete,
  useNotificationMarkAllAsRead,
  useNotificationRead,
} from "@/hooks/useNotification";
import useWebSocket from "@/hooks/useWebSocket";
export function getNotificationIcon(method: "SYSTEM" | "EMAIL") {
  switch (method) {
    case "EMAIL":
      return <Mail className="h-4 w-4" />;
    case "SYSTEM":
      return <Bell className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

export function formatTimeAgo(date: Date | null) {
  if (!date) return "Unknown";

  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - new Date(date).getTime()) / 1000
  );

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return new Date(date).toLocaleDateString();
}
export type Message = {
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
  user,
}: {
  initailAllNotifications: Message[];
  user: userSessionType;
}) {
  const [messages, setMessages] = useState<Message[]>(
    (initailAllNotifications ?? []).slice(0, 3)
  );
  const [isOpen, setIsOpen] = useState(false);
  const userId = user?.id;
  const unreadCount = messages.filter((msg) => !msg.read).length;
  const urlPrfix = `/dashboard/notifications`; //${user?.role?.toLocaleLowerCase()}
  const { deleteNotificationMuta } = useNotificationDelete();
  const { ReadMuta } = useNotificationRead();
  const { markAllAsReadMuta } = useNotificationMarkAllAsRead();

  useWebSocket<Message>(
    `${env.NEXT_PUBLIC_GO_API_WS_URL}/notification?user_id=${userId}`,
    {
      onMessage: (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) {
            return prev;
          }
          return [msg, ...prev].slice(0, 3);
        });
      },
    }
  );

  const handleNotificationClick = async (notificationId: string) => {
    toast.loading("loading..", { id: "mark-as-read" });
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === notificationId ? { ...msg, read: true } : msg
      )
    );
    await ReadMuta({ id: notificationId, receiverId: userId!, read: true });
  };

  const handleMarkAllAsRead = async () => {
    console.log("Mark all as read clicked");
    toast.loading("loading..", { id: "mark-all-as-read" });
    setMessages((prev) =>
      prev.map((msg) => {
        return { ...msg, read: true };
      })
    );
    await markAllAsReadMuta({ receiverId: userId! });
  };

  const handleDeleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== notificationId));

    e.preventDefault();
    e.stopPropagation();
    console.log("Delete notification:", notificationId);
    toast.loading("deleting..", { id: "delete-notification" });
    await deleteNotificationMuta({ id: notificationId, receiverId: userId! });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-9 w-9 rounded-full transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium animate-in zoom-in-50">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-96 p-0 shadow-lg border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        sideOffset={8}>
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-base">Notifications</h4>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
              Mark all read
            </Button>
          )}
        </div>
        <div>
          <ScrollArea className="max-h-96 ">
            {messages.length > 0 ? (
              <div className="flex flex-col justify-between">
                {messages.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "group relative p-4 cursor-pointer transition-colors",
                      "hover:bg-accent/50",
                      !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                    onClick={() => handleNotificationClick(notification.id)}>
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                          notification.method === "EMAIL"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        )}>
                        {getNotificationIcon(notification.method)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium leading-tight",
                              !notification.read && "font-semibold"
                            )}>
                            {notification.subject || "New notification"}
                          </p>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={(e) =>
                                handleDeleteNotification(notification.id, e)
                              }>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.content}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </span>

                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 h-5">
                            {notification.method.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <DropdownMenuSeparator />

                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-sm h-9"
                    asChild>
                    <Link
                      href={urlPrfix}
                      onClick={() => setIsOpen((prev) => !prev)}>
                      View all notifications
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-base mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm">
                  New notifications will appear here when they arrive.
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        {messages.length > 0 && <></>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
