"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Star, Filter, Search, ThumbsUp, MessageSquare } from "lucide-react"
import { toast } from "sonner"


interface Review {
  id: string
  menteeId: string
  menteeName: string
  menteeAvatar: string
  rating: number
  title: string
  content: string
  date: string
  helpful: number
  verified: boolean
  sessionType: string
}

const mockReviews: Review[] = [
  {
    id: "1",
    menteeId: "user1",
    menteeName: "Sarah Chen",
    menteeAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Exceptional guidance on React architecture",
    content:
      "John provided incredible insights into React best practices and helped me restructure my entire application. His explanations were clear and actionable. Highly recommend for anyone looking to level up their React skills.",
    date: "2024-01-15",
    helpful: 12,
    verified: true,
    sessionType: "1-on-1 Session",
  },
  {
    id: "2",
    menteeId: "user2",
    menteeName: "Michael Rodriguez",
    menteeAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    title: "Great mentor for career transition",
    content:
      "As someone transitioning from backend to full-stack, John's mentorship was invaluable. He provided a clear roadmap and practical exercises that helped me land my dream job.",
    date: "2024-01-10",
    helpful: 8,
    verified: true,
    sessionType: "Career Coaching",
  },
  {
    id: "3",
    menteeId: "user3",
    menteeName: "Emily Johnson",
    menteeAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    title: "Solid technical knowledge",
    content:
      "John knows his stuff when it comes to modern web development. The session was informative, though I would have liked more hands-on coding examples.",
    date: "2024-01-08",
    helpful: 5,
    verified: false,
    sessionType: "Technical Review",
  },
]

export default function MentorReviews() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews)
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    content: "",
    sessionType: "",
  })
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [searchTerm, setSearchTerm] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }))

  const filteredReviews = reviews
    .filter((review) => {
      if (filter === "verified") return review.verified
      if (filter === "recent") return new Date(review.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      return true
    })
    .filter(
      (review) =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.menteeName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === "highest") return b.rating - a.rating
      if (sortBy === "lowest") return a.rating - b.rating
      if (sortBy === "helpful") return b.helpful - a.helpful
      return 0
    })

  const handleSubmitReview = () => {
    if (!newReview.rating || !newReview.title || !newReview.content) {
      toast.error("Please fill in all required fields.")
      return
    }

    const review: Review = {
      id: Date.now().toString(),
      menteeId: "current-user",
      menteeName: "You",
      menteeAvatar: "/placeholder.svg?height=40&width=40",
      rating: newReview.rating,
      title: newReview.title,
      content: newReview.content,
      date: new Date().toISOString().split("T")[0],
      helpful: 0,
      verified: false,
      sessionType: newReview.sessionType,
    }

    setReviews([review, ...reviews])
    setNewReview({ rating: 0, title: "", content: "", sessionType: "" })
    setShowReviewForm(false)

    toast.success("Thank you for your feedback!")
  }

  const StarRating = ({
    rating,
    interactive = false,
    onRatingChange,
  }: {
    rating: number
    interactive?: boolean
    onRatingChange?: (rating: number) => void
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Mentor Reviews</h1>
        <p className="text-muted-foreground">See what mentees are saying about their experience</p>
      </div>

      {/* Overview Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Average Rating */}
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <StarRating rating={Math.round(averageRating)} />
              <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-8 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Verified Reviews</span>
                <span className="text-sm font-medium">{reviews.filter((r) => r.verified).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Recent Reviews</span>
                <span className="text-sm font-medium">
                  {reviews.filter((r) => new Date(r.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Response Rate</span>
                <span className="text-sm font-medium">95%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="recent">Recent (30 days)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowReviewForm(!showReviewForm)}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Write Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>Share your experience with this mentor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating *</label>
                <StarRating
                  rating={newReview.rating}
                  interactive
                  onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select
                  value={newReview.sessionType}
                  onValueChange={(value) => setNewReview({ ...newReview, sessionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-on-1 Session">1-on-1 Session</SelectItem>
                    <SelectItem value="Career Coaching">Career Coaching</SelectItem>
                    <SelectItem value="Technical Review">Technical Review</SelectItem>
                    <SelectItem value="Mock Interview">Mock Interview</SelectItem>
                    <SelectItem value="Project Review">Project Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Review Title *</label>
              <Input
                placeholder="Summarize your experience..."
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review *</label>
              <Textarea
                placeholder="Tell others about your experience with this mentor..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">{newReview.content.length}/500 characters</p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSubmitReview}>Submit Review</Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to leave a review!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.menteeAvatar || "/placeholder.svg"} />
                    <AvatarFallback>{review.menteeName.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{review.menteeName}</h4>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {review.sessionType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">{review.title}</h5>
                      <p className="text-muted-foreground leading-relaxed">{review.content}</p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      <span className="text-xs text-muted-foreground">Review #{review.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
