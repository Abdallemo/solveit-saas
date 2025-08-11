"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Mail,
  Search,
  MoreVertical,
  Check,
  Trash2,
  Settings,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatTimeAgo, getNotificationIcon } from "./notificationDropDown";
import {
  useNotificationDelete,
  useNotificationMarkAllAsRead,
  useNotificationRead,
} from "@/hooks/useNotification";
import { toast } from "sonner";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";

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

type FilterType = "all" | "unread" | "read";
type SortType = "newest" | "oldest" | "unread-first";

export default function NotificationsPage({
  initialNotifications,
}: {
  initialNotifications: Message[];
}) {
  const [notifications, setNotifications] =
    useState<Message[]>(initialNotifications);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("newest");
  const { deleteNotificationMuta } = useNotificationDelete();
  const { ReadMuta } = useNotificationRead();
  const { markAllAsReadMuta } = useNotificationMarkAllAsRead();
  const { user } = useCurrentUser();
  const router = useRouter()
  const filteredAndSortedNotifications = useMemo(() => {
    const filtered = notifications.filter((notification) => {
      const matchesSearch =
        notification.subject
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        notification.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "read" && notification.read) ||
        (filter === "unread" && !notification.read);

      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
          );
        case "unread-first":
          if (a.read !== b.read) return a.read ? 1 : -1;
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

    return filtered;
  }, [notifications, searchQuery, filter, sortBy]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const selectedCount = selectedIds.size;

  const handleSelectAll = () => {
    if (selectedIds.size === filteredAndSortedNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedNotifications.map((n) => n.id)));
    }
  };

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkAsRead = (ids: string[]) => {
    console.log("Mark as read:", ids);
    ids.forEach(async (id) => {
      await ReadMuta({ id, receiverId: user?.id!, read: true });
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelectedIds(new Set());
    router.refresh()
  };

  const handleMarkAsUnread = (ids: string[]) => {
    console.log("Mark as unread:", ids);
    ids.forEach(async (id) => {
      await ReadMuta({ id, receiverId: user?.id!, read: false });
    });
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n))
    );
    setSelectedIds(new Set());
    router.refresh()

  };

  const handleDelete = (ids: string[]) => {
    console.log("Delete:", ids);

    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    ids.forEach(async (id) => {
      await deleteNotificationMuta({ id, receiverId: user?.id! });
    });
    setSelectedIds(new Set());
    router.refresh()

  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    handleMarkAsRead(unreadIds);
  };

  return (
    <div className="min-h-full bg-background">
     
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/dashboard/${user?.role?.toLocaleLowerCase()}`}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/notifications/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>

              {unreadCount > 0 && (
                <Button onClick={handleMarkAllAsRead} className="gap-2">
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filter}
              onValueChange={(value: FilterType) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortType) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="unread-first">Unread first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

     
        {selectedCount > 0 && (
          <Card className="p-4 mb-6 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedCount} notification{selectedCount > 1 ? "s" : ""}{" "}
                  selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-xs">
                  Clear selection
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsRead(Array.from(selectedIds))}
                  className="gap-2">
                  <Check className="h-3 w-3" />
                  Mark read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkAsUnread(Array.from(selectedIds))}
                  className="gap-2">
                  <Bell className="h-3 w-3" />
                  Mark unread
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(Array.from(selectedIds))}
                  className="gap-2 text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Select All */}
        {filteredAndSortedNotifications.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              checked={
                selectedIds.size === filteredAndSortedNotifications.length
              }
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-sm text-muted-foreground cursor-pointer">
              Select all visible notifications
            </label>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredAndSortedNotifications.length > 0 ? (
            filteredAndSortedNotifications.map((notification, index) => (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  !notification.read &&
                    "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-800/50",
                  selectedIds.has(notification.id) &&
                    "ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
                )}>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedIds.has(notification.id)}
                      onCheckedChange={() =>
                        handleSelectNotification(notification.id)
                      }
                      className="mt-1"
                    />

                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        notification.method === "EMAIL"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                      )}>
                      {getNotificationIcon(notification.method)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3
                          className={cn(
                            "font-medium text-base leading-tight",
                            !notification.read && "font-semibold"
                          )}>
                          {notification.subject || "Notification"}
                        </h3>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                          </span>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsRead([notification.id])
                                }
                                disabled={notification.read}>
                                <Check className="h-4 w-4 mr-2" />
                                Mark as read
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsUnread([notification.id])
                                }
                                disabled={!notification.read}>
                                <Bell className="h-4 w-4 mr-2" />
                                Mark as unread
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete([notification.id])}
                                className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {notification.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {notification.method.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            /* Empty State */
            <Card className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? (
                    <Search className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {searchQuery
                    ? "No matching notifications"
                    : "No notifications"}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "You're all caught up! New notifications will appear here when they arrive."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="mt-4">
                    Clear search
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {filteredAndSortedNotifications.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedNotifications.length} of{" "}
              {notifications.length} notifications
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
