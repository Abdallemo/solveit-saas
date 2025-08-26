"use client"

import { useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Clock, Search, Star, Users, DollarSign } from "lucide-react"

type AvailabilitySlot = {
  day: string
  start: string
  end: string
}

type Mentor = {
  id: string
  userId: string
  displayName: string
  avatar: string
  title: string
  description: string
  ratePerHour: number
  availableTimes: AvailabilitySlot[]
  isPublished: boolean
}

interface MentorsBrowserProps {
  mentors: Mentor[]
}

function formatAvailability(slots: AvailabilitySlot[]): string {
  if (slots.length === 0) return "No availability"

  const formattedSlots = slots.map((slot) => {
    return `${slot.day} ${slot.start}-${slot.end}`
  })

  return formattedSlots.join(", ")
}


export function MentorsBrowser({ mentors, }: MentorsBrowserProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
function onBookMentor(mentorId:string){}
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name")
  const [bookingStates, setBookingStates] = useState<Record<string, boolean>>({})

  const ITEMS_PER_PAGE = 9
  const currentPage = Number.parseInt(searchParams.get("page") || "1", 10)

  const publishedMentors = mentors.filter((mentor) => mentor.isPublished)

  const filteredAndSortedMentors = useMemo(() => {
    const filtered = publishedMentors.filter(
      (mentor) =>
        mentor.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.ratePerHour - b.ratePerHour
        case "price-high":
          return b.ratePerHour - a.ratePerHour
        case "name":
        default:
          return a.displayName.localeCompare(b.displayName)
      }
    })
  }, [publishedMentors, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredAndSortedMentors.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedMentors = filteredAndSortedMentors.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }
    const newUrl = params.toString() ? `?${params.toString()}` : ""
    router.push(newUrl, { scroll: false })
  }

  const handleBookMentor = async (mentorId: string) => {
    setBookingStates((prev) => ({ ...prev, [mentorId]: true }))
    try {
      await onBookMentor?.(mentorId)
    } finally {
      setBookingStates((prev) => ({ ...prev, [mentorId]: false }))
    }
  }

  if (publishedMentors.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No mentors available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Browse Mentors</h2>
          <p className="text-muted-foreground">Find the perfect mentor for your learning journey</p>
        </div>
        <Badge variant="outline">
          {filteredAndSortedMentors.length} mentor{filteredAndSortedMentors.length !== 1 ? "s" : ""} available
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
          <p className="text-muted-foreground">No mentors found matching your search.</p>
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
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )
                    }
                    return null
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MentorCard({
  mentor,
  onBookMentor,
  isBooking,
}: {
  mentor: Mentor
  onBookMentor?: (mentorId: string) => void
  isBooking?: boolean
}) {
  const initials = mentor.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()

  const getTodayAvailability = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const todayName = days[new Date().getDay()]

    const todaySlot = mentor.availableTimes.find((slot) => slot.day.toLowerCase() === todayName)

    return todaySlot ? `Today ${todaySlot.start}-${todaySlot.end}` : null
  }

  const todayAvailability = getTodayAvailability()

  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg leading-tight">{mentor.displayName}</h3>
            <p className="text-sm text-muted-foreground mt-1">{mentor.title}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{mentor.description}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="text-xs font-medium">
              ${mentor.ratePerHour}/hour
            </Badge>
          </div>

          <div className="space-y-1">
            {todayAvailability && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3 text-green-600" />
                <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                  {todayAvailability}
                </Badge>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="line-clamp-2">{formatAvailability(mentor.availableTimes)}</span>
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
        <Button className="w-full" onClick={() => onBookMentor?.(mentor.id)} disabled={isBooking}>
          {isBooking ? "Booking..." : "Book Session"}
        </Button>
      </CardFooter>
    </Card>
  )
}
