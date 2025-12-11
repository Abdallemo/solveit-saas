"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCurrentUser from "@/hooks/useCurrentUser";
import { getColorClass } from "@/lib/utils/utils";
import { useWebRTCStore } from "@/store/webRtcStore";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { MentorBookingSessions } from "../server/types";

export function SessionsList({
  booking: { result: bookings, totalCount },
}: {
  booking: MentorBookingSessions;
}) {
  useEffect(() => {
    const { manager } = useWebRTCStore.getState();
    if (manager) {
      manager.leaveCall();
    }
  }, []);

  const { user } = useCurrentUser();
  const [globalFilter, setGlobalFilter] = useState("");
  const [collapsedBookings, setCollapsedBookings] = useState<Set<string>>(
    new Set(),
  );
  const path = usePathname();
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const toggleBookingCollapse = (bookingId: string) => {
    const newCollapsed = new Set(collapsedBookings);
    if (newCollapsed.has(bookingId)) {
      newCollapsed.delete(bookingId);
    } else {
      newCollapsed.add(bookingId);
    }
    setCollapsedBookings(newCollapsed);
  };

  const filteredBookings = useMemo(() => {
    if (!globalFilter) return bookings;

    return bookings.filter((booking) => {
      const searchTerm = globalFilter.toLowerCase();
      return (
        `rm${booking.price}` === searchTerm.trim() ||
        booking.price === Number(searchTerm.trim()) ||
        booking.id.toLowerCase().includes(searchTerm) ||
        booking.status.toLowerCase().includes(searchTerm) ||
        booking.bookedSessions.some((session) =>
          session.sessionDate.toLowerCase().includes(searchTerm),
        )
      );
    });
  }, [bookings, globalFilter]);

  return (
    <div className="h-full w-full">
      <div className=" mx-auto px-10 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Your Sessions
          </h1>
          <Badge variant="outline" className="text-xs">
            {totalCount} {totalCount === 1 ? "session" : "sessions"}
          </Badge>
        </div>

        <div className="mb-4 flex gap-2">
          <Input
            type="text"
            placeholder="Search sessions by price, status or date"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="flex-1 h-9"
          />
          <Button type="submit" size="sm" className="whitespace-nowrap">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="flex flex-col w-full gap-2">
          {filteredBookings.map((booking) => {
            const isCollapsed = collapsedBookings.has(booking.id);

            return (
              <div
                key={booking.id}
                className="border rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleBookingCollapse(booking.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                        {user?.role === "POSTER" && (
                          <AvatarImage
                            src={booking.solver.avatar || "/placeholder.svg"}
                          />
                        )}
                        {user?.role === "SOLVER" && (
                          <AvatarImage src={booking.poster.image ?? ""} />
                        )}
                      </Avatar>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="font-medium text-sm">
                        #{booking.id.slice(-8)}
                      </span>
                      <Badge
                        className={`${getColorClass(booking.status)} text-xs`}
                      >
                        {booking.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">
                          {booking.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <div className="font-semibold text-sm">
                      RM{booking.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.bookedSessions.length} session
                      {booking.bookedSessions.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="border-t bg-muted/20">
                    {booking.bookedSessions.map((session, index) => {
                      const localStart = toZonedTime(
                        session.sessionStart!,
                        userTz,
                      );
                      const localEnd = toZonedTime(session.sessionEnd!, userTz);
                      return (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
                            index !== booking.bookedSessions.length - 1
                              ? "border-b"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="relative flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground w-16">
                                Session {index + 1}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 flex-wrap text-sm min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="font-medium text-muted-foreground">
                                  {format(localStart, "EEEE")}
                                </span>
                                <span className="font-medium">
                                  {format(localStart, "HH:mm")} -{" "}
                                  {format(localEnd, "HH:mm")}
                                </span>
                                <span className="font-medium text-muted-foreground">
                                  {localStart.toLocaleDateString(undefined)}
                                </span>
                              </div>

                              {/* <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  {getSessionEndDateTime(
                                    session.sessionDate,
                                    session.timeSlot
                                  )}
                                </span>
                              </div> */}
                            </div>
                          </div>

                          <div className="ml-4 shrink-0">
                            <Button asChild size="sm" className="h-8 text-xs">
                              <Link
                                className="transition-colors duration-200"
                                href={`${path}/${session.id}`}
                              >
                                Join →
                              </Link>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-muted">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">No sessions found</h3>
          <p className="text-sm text-muted-foreground">
            {globalFilter
              ? "Try adjusting your search terms."
              : "No bookings available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}
