"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Eye, Save, Star, CheckCircle, Camera, X } from "lucide-react"
import { toast } from "sonner"

interface MentorData {
  name: string
  avatar: string
  title: string
  description: string
  hourlyRate: string
  availability: string
  isPublished: boolean
}

const defaultAvatars = [
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
  "/placeholder.svg?height=80&width=80",
]

export function MentorProfile() {
  
  const [isLoading, setIsLoading] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [mentorData, setMentorData] = useState<MentorData>({
    name: "Alex Johnson",
    avatar: "/placeholder.svg?height=80&width=80",
    title: "Senior Full-Stack Developer & Tech Mentor",
    description:
      "I help developers level up their skills in React, Node.js, and system design. With 8+ years of experience at top tech companies, I provide practical guidance for career growth and technical excellence.",
    hourlyRate: "75",
    availability: "Weekdays 6-9 PM EST, Weekends 10 AM - 2 PM EST",
    isPublished: true,
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    
    toast.success("Your mentor profile has been successfully updated.")
  }

  const handlePublishToggle = (published: boolean) => {
    setMentorData((prev) => ({ ...prev, isPublished: published }))
    toast.success(published ? "Your profile is now visible to mentees." : "Your profile is now hidden from mentees.")
  }

  const handlePreview = () => {
    toast.success("Opening mentor profile preview...")
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setMentorData((prev) => ({ ...prev, avatar: avatarUrl }))
    setShowAvatarSelector(false)
    toast.success("Your profile avatar has been changed")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Profile Avatar</Label>
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={mentorData.avatar || "/placeholder.svg"} alt={mentorData.name} />
                    <AvatarFallback className="text-lg">
                      {mentorData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                {showAvatarSelector && (
                  <div className="w-full p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Choose Avatar</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowAvatarSelector(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {defaultAvatars.map((avatar, index) => (
                        <button key={index} onClick={() => handleAvatarSelect(avatar)} className="relative group">
                          <Avatar className="h-12 w-12 transition-all group-hover:ring-2 group-hover:ring-primary">
                            <AvatarImage src={avatar || "/placeholder.svg"} alt={`Avatar ${index + 1}`} />
                            <AvatarFallback>A{index + 1}</AvatarFallback>
                          </Avatar>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={mentorData.name}
                onChange={(e) => setMentorData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your display name"
              />
            </div>

            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Star className="h-3 w-3 mr-1" />
                Solver++ Premium
              </Badge>
            </div>

            <div className="space-y-3">
              <Label>Profile Status</Label>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <CheckCircle
                    className={`h-4 w-4 ${mentorData.isPublished ? "text-green-500" : "text-muted-foreground"}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{mentorData.isPublished ? "Published" : "Unpublished"}</span>
                    <span className="text-xs text-muted-foreground">
                      {mentorData.isPublished ? "Visible to mentees" : "Hidden from mentees"}
                    </span>
                  </div>
                </div>
                <Switch checked={mentorData.isPublished} onCheckedChange={handlePublishToggle} />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Profile Overview</Label>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium">${mentorData.hourlyRate}/hour</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Mentees</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Sessions</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title & Specialization</Label>
              <Input
                id="title"
                value={mentorData.title}
                onChange={(e) => setMentorData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Senior React Developer & Mentor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Bio & Description</Label>
              <Textarea
                id="description"
                value={mentorData.description}
                onChange={(e) => setMentorData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Tell mentees about your experience, expertise, and how you can help them..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{mentorData.description.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (RM)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-4 text-muted-foreground" >RM</span>
                <Input
                  id="rate"
                  type="number"
                  value={mentorData.hourlyRate}
                  onChange={(e) => setMentorData((prev) => ({ ...prev, hourlyRate: e.target.value }))}
                  className="pl-10"
                  placeholder="75"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Available Times</Label>
              <Textarea
                id="availability"
                value={mentorData.availability}
                onChange={(e) => setMentorData((prev) => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., Weekdays 6-9 PM EST, Weekends 10 AM - 2 PM EST"
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Describe when you're typically available for mentoring sessions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handlePreview} className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
