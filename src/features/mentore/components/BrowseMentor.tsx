"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Clock, Search, Star, Users, DollarSign } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { MentorListigWithAvailbelDates } from "@/features/mentore/server/types";
import { BookingModal } from "./booking-modal";

interface MentorCardProps {
  mentor: MentorListigWithAvailbelDates;
  onBookMentor?: (mentorId: string) => void;
  isBooking?: boolean;
}

export function MentorsBrowser({
  mentors,
}: {
  mentors: MentorListigWithAvailbelDates[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">(
    "name"
  );
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>(
    {}
  );

  const ITEMS_PER_PAGE = 6;
  const currentPage = Number(searchParams.get("page") || 1);

  const filteredAndSortedMentors = useMemo(() => {
    const filtered = mentors.filter(
      (mentor) =>
        mentor.isPublished &&
        (mentor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.ratePerHour - b.ratePerHour;
        case "price-high":
          return b.ratePerHour - a.ratePerHour;
        default:
          return a.displayName.localeCompare(b.displayName);
      }
    });
  }, [mentors, searchQuery, sortBy]);

  const totalPages = Math.ceil(
    filteredAndSortedMentors.length / ITEMS_PER_PAGE
  );
  const paginatedMentors = filteredAndSortedMentors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleBookMentor = async (mentorId: string) => {
    setBookingStates((prev) => ({ ...prev, [mentorId]: true }));
    try {
      // Logic for booking can go here
    } finally {
      setBookingStates((prev) => ({ ...prev, [mentorId]: false }));
    }
  };

  const paginationLinks = useMemo(() => {
    const links = [];
    const ellipsis = (
      <PaginationItem key="ellipsis">
        <PaginationEllipsis />
      </PaginationItem>
    );

    links.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) {
      links.push(ellipsis);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPages - 2) {
      links.push(ellipsis);
      links.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return links;
  }, [currentPage, totalPages, handlePageChange]);

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No mentors available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Browse Mentors</h2>
          <p className="text-muted-foreground">
            Find the perfect mentor for your learning journey
          </p>
        </div>
        <Badge variant="outline">
          {filteredAndSortedMentors.length} mentor
          {filteredAndSortedMentors.length !== 1 ? "s" : ""} available
        </Badge>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mentors by name, title, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAndSortedMentors.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No mentors found matching your search.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onBookMentor={handleBookMentor}
                isBooking={bookingStates[mentor.id] || false}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {paginationLinks}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const MentorCard = ({ mentor, isBooking }: MentorCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayAvailability = mentor.availableDates.find((session) =>
    isSameDay(session.date, new Date())
  );

  const formattedAvailableDates = mentor.availableDates
    .map(
      (session) =>
        `${format(session.date, "EEEE")} ${session.slot.start}-${
          session.slot.end
        }`
    )
    .join(", ");

  const initials = mentor.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={mentor.avatar || "/placeholder.svg"}
                  alt={mentor.displayName}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight">
                {mentor.displayName}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {mentor.title}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {mentor.description}
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <Badge variant="secondary" className="text-xs font-medium">
                RM{mentor.ratePerHour}/hour
              </Badge>
            </div>
            <div className="space-y-1">
              {todayAvailability && (
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3 text-green-600" />
                  <Badge
                    variant="default"
                    className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                    Today {todayAvailability.slot.start}-
                    {todayAvailability.slot.end}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="line-clamp-2">
                  {formattedAvailableDates || "No availability"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>4.9</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>127 sessions</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            className="w-full"
            onClick={() => setIsModalOpen(true)}
            disabled={isBooking}>
            {isBooking ? "Booking..." : "Book Session"}
          </Button>
        </CardFooter>
      </Card>
      <BookingModal
        mentor={mentor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
