"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useCurrentUser from "@/hooks/useCurrentUser";
import { formatDate, formatDateAndTimeNUTC, getColorClass } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AvailabilitySlot, MentorBookingSessions } from "../server/types";

export function SessionsList({
  booking: { result: bookings, totalCount },
}: {
  booking: MentorBookingSessions;
}) {
  const { user } = useCurrentUser();
  const [globalFilter, setGlobalFilter] = useState("");
  const [collapsedBookings, setCollapsedBookings] = useState<Set<string>>(
    new Set()
  );
  const path = usePathname();

  const toggleBookingCollapse = (bookingId: string) => {
    const newCollapsed = new Set(collapsedBookings);
    if (newCollapsed.has(bookingId)) {
      newCollapsed.delete(bookingId);
    } else {
      newCollapsed.add(bookingId);
    }
    setCollapsedBookings(newCollapsed);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getSessionEndDateTime = (
    sessionDate: string,
    timeSlot: AvailabilitySlot
  ) => {
    return `${formatTime(timeSlot.end)} ${formatDate(sessionDate)}`;
  };

  const filteredBookings = useMemo(() => {
    if (!globalFilter) return bookings;

    return bookings.filter((booking) => {
      const searchTerm = globalFilter.toLowerCase();
      return (
        booking.price === Number(searchTerm.trim()) ||
        booking.id.toLowerCase().includes(searchTerm) ||
        booking.status.toLowerCase().includes(searchTerm) ||
        booking.bookedSessions.some((session) =>
          session.sessionDate.toLowerCase().includes(searchTerm)
        )
      );
    });
  }, [bookings, globalFilter]);

  return (
    <div className="h-full w-full">
      <div className="max-w-8xl mx-auto px-6 py-8 ">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">Your Session</h1>
          <Badge variant="outline" className="text-foreground">
            Total Session: {totalCount}
          </Badge>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between  p-4 rounded-md">
          <div className="flex flex-col sm:flex-row flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="sm:flex-1 w-full"
            />
            <Button
              type="submit"
              className="w-full sm:w-auto whitespace-nowrap">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="flex flex-col w-full gap-4">
          {filteredBookings.map((booking) => {
            const isCollapsed = collapsedBookings.has(booking.id);

            return (
              <div key={booking.id} className="">
                <Card
                  className="w-full p-4 border cursor-pointer hover:bg-muted/50 transition-colors "
                  onClick={() => toggleBookingCollapse(booking.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Avatar>
                          <AvatarFallback>
                            <Users className="h-4 w-4 text-muted-foreground" />
                          </AvatarFallback>
                          {user?.role === "POSTER" && (
                            <AvatarImage src={booking.solver.avatar} />
                          )}
                          {user?.role === "SOLVER" && (
                            <AvatarImage src={booking.poster.image ?? ""} />
                          )}
                        </Avatar>
                        <span className="font-semibold">
                          Booking #{booking.id.slice(-8)}
                        </span>
                      </div>
                      <Badge className={`${getColorClass(booking.status)} `}>
                        {booking.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Booked {formatDateAndTimeNUTC(booking.createdAt!)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {booking.bookedSessions.length} session
                        {booking.bookedSessions.length !== 1 ? "s" : ""}
                      </div>
                      <div className="font-semibold">RM{booking.price}</div>
                    </div>
                  </div>
                </Card>

                {!isCollapsed && (
                  <div className="ml-4 space-y-2">
                    {booking.bookedSessions.map((session, index) => {
                      return (
                        <Card
                          key={session.id}
                          className={`p-4 transition-all duration-200 hover:shadow-sm border`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-3 h-3 rounded-full bg-sidebar-foreground`}
                                  />
                                  {index <
                                    booking.bookedSessions.length - 1 && (
                                    <div className="absolute top-3 left-1/2 w-px h-6 bg-border transform -translate-x-1/2" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">
                                      Session {index + 1}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {session.timeSlot.start} -{" "}
                                    {session.timeSlot.end}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground text-xs">
                                      Session ends
                                    </span>
                                  </div>
                                  <div className="font-medium">
                                    {getSessionEndDateTime(
                                      session.sessionDate,
                                      session.timeSlot
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="ml-4">
                              <Button asChild size="sm">
                                <Link
                                  className="transition-colors duration-200"
                                  href={`${path}/${session.id}`}>
                                  Join Session →
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </Card>
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
        <div className="text-center py-12 ">
          <div className="mx-auto w-16 h-16  rounded-full flex items-center justify-center mb-4 bg-foreground">
            <Search className="h-6 w-6 stroke-background" />
          </div>
          <h3 className="text-lg font-medium  mb-2">No sessions found</h3>
          <p className="">
            {globalFilter
              ? "Try adjusting your search terms."
              : "No bookings available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}
