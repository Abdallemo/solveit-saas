"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Inbox } from "lucide-react"
import Link from "next/link"

export default function NotificationDropDown() {
  const notificationMockData = [
    {
      id: 1,
      Title: "Email notification",
      date: "01/11/2026",
      Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    },
    {
      id: 2,
      Title: "Task completion",
      date: "02/06/2026",
      Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-8 relative bg-transparent">
          <Inbox className="size-5" />
          {notificationMockData.length > 0 && (
            <Badge
              variant="success"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notificationMockData.length}
            </Badge>
          )}
          <span className="sr-only">Toggle notification</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <p className="text-xs text-muted-foreground">You have {notificationMockData.length} unread notifications</p>
        </div>
        <DropdownMenuGroup className="max-h-64 overflow-y-auto">
          {notificationMockData.map((notification) => (
            <DropdownMenuItem key={notification.id} asChild className="p-0">
              <Link href="#" className="block p-3 hover:bg-accent">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{notification.Title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.Description}</p>
                  <p className="text-xs text-muted-foreground">{notification.date}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {notificationMockData.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
