import { Star, TrendingUp, MessageSquare, Search, MoreVertical, Reply, Flag, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function MyReviewsPage() {
  const overallStats = {
    averageRating: 4.8,
    totalReviews: 127,
    responseRate: 89,
    monthlyGrowth: 12,
  } 
 
  const ratingBreakdown = [
    { stars: 5, count: 89, percentage: 70 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 8, percentage: 6 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 2, percentage: 2 },
  ]

  const reviews = [
    {
      id: 1,
      mentee: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      rating: 5,
      date: "2024-01-15",
      sessionType: "Career Guidance",
      content:
        "Absolutely fantastic mentor! Sarah provided incredible insights into product management career paths. Her advice on transitioning from engineering to PM was spot-on and actionable. The session exceeded my expectations.",
      helpful: 12,
      responded: false,
      tags: ["Career Transition", "Product Management"],
    },
    {
      id: 2,
      mentee: {
        name: "Michael Rodriguez",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      rating: 5,
      date: "2024-01-12",
      sessionType: "Technical Interview",
      content:
        "Great technical interview preparation session. The mock interview was challenging but fair, and the feedback was constructive. Really helped me identify areas for improvement.",
      helpful: 8,
      responded: true,
      response: "Thank you Michael! I'm glad the mock interview helped. Best of luck with your upcoming interviews!",
      tags: ["Interview Prep", "Technical Skills"],
    },
    {
      id: 3,
      mentee: {
        name: "Emily Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: false,
      },
      rating: 4,
      date: "2024-01-10",
      sessionType: "Resume Review",
      content:
        "Very helpful resume review session. Got specific feedback on how to better highlight my achievements. The before/after comparison was eye-opening.",
      helpful: 6,
      responded: false,
      tags: ["Resume", "Job Search"],
    },
    {
      id: 4,
      mentee: {
        name: "David Park",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      rating: 5,
      date: "2024-01-08",
      sessionType: "Startup Advice",
      content:
        "Incredible session on startup strategy and fundraising. The insights on pitch deck structure and investor relations were invaluable. Highly recommend!",
      helpful: 15,
      responded: true,
      response:
        "Thanks David! Excited to see how your startup progresses. Feel free to reach out for follow-up questions!",
      tags: ["Startup", "Fundraising", "Strategy"],
    },
  ]

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-gray-600 mt-1">See what mentees are saying about your sessions</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <TrendingUp className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold text-gray-900">{overallStats.averageRating}</span>
                    {renderStars(Math.floor(overallStats.averageRating), "md")}
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overallStats.totalReviews}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{overallStats.responseRate}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Reply className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">+{overallStats.monthlyGrowth}%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Rating Breakdown */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratingBreakdown.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-sm font-medium">{item.stars}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 min-w-[30px]">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input placeholder="Search reviews..." className="w-full"  />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.mentee.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {review.mentee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{review.mentee.name}</h4>
                            {review.mentee.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-500">{review.date}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <Badge variant="outline" className="text-xs">
                              {review.sessionType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Reply className="h-4 w-4 mr-2" />
                            Respond
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {review.responded && review.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-200 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Reply className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Your Response</span>
                        </div>
                        <p className="text-sm text-blue-800">{review.response}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Heart className="h-4 w-4" />
                          <span>{review.helpful} found helpful</span>
                        </div>
                      </div>
                      {!review.responded && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                              <Reply className="h-4 w-4" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Respond to Review</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">{review.mentee.name}</span>
                                  {renderStars(review.rating)}
                                </div>
                                <p className="text-sm text-gray-700">{review.content}</p>
                              </div>
                              <Textarea placeholder="Write your response..." className="min-h-[100px]" />
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button>Send Response</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
