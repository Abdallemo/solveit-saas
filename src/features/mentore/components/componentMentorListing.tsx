"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Save,
  Star,
  CheckCircle,
  Camera,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AvailabilitySlot, MentorListType } from "../server/action";
import { daysOfWeek, timeOptions } from "@/lib/utils";

interface MentorData {
  name: string;
  avatar: string;
  title: string;
  description: string;
  hourlyRate: string;
  availability: AvailabilitySlot[];
  isPublished: boolean;
}

const defaultAvatars = [
  "https://api.multiavatar.com/mentorA.svg",
  "https://api.multiavatar.com/mentorB.svg",
  "https://api.multiavatar.com/freelancerA.svg",
  "https://api.multiavatar.com/freelancerB.svg",
  "https://api.multiavatar.com/studentA.svg",
  "https://api.multiavatar.com/studentB.svg",
  "https://api.multiavatar.com/academicA.svg",
  "https://api.multiavatar.com/academicB.svg",
]


export function MentorProfile(MentorData1: { MentorData1: MentorListType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [mentorData, setMentorData] = useState<MentorData>({
    name: "Alex Johnson",
    avatar:
      "https://api.multiavatar.com/mentorA.svg",

    title: "Senior Full-Stack Developer & Tech Mentor",
    description:
      "I help developers level up their skills in React, Node.js, and system design. With 8+ years of experience at top tech companies, I provide practical guidance for career growth and technical excellence.",
    hourlyRate: "75",
    availability: [
      { day: "tuesday", start: "18:00", end: "21:00" },
      { day: "wednesday", start: "19:00", end: "22:00" },
      { day: "saturday", start: "10:00", end: "14:00" },
    ],
    isPublished: true,
  });

  const addAvailabilitySlot = () => {
    const usedDays = mentorData.availability.map((slot) => slot.day);
    const availableDay =
      daysOfWeek.find((day) => !usedDays.includes(day)) || "monday";

    setMentorData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: availableDay, start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeAvailabilitySlot = (index: number) => {
    setMentorData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };

  const updateAvailabilitySlot = (
    index: number,
    field: keyof AvailabilitySlot,
    value: string
  ) => {
    setMentorData((prev) => ({
      ...prev,
      availability: prev.availability.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast.success("Your mentor profile has been successfully updated.");
    toast.success("data:" + JSON.stringify(mentorData.availability));
  };

  const handlePublishToggle = (published: boolean) => {
    setMentorData((prev) => ({ ...prev, isPublished: published }));
    toast.success(
      published
        ? "Your profile is now visible to mentees."
        : "Your profile is now hidden from mentees."
    );
  };

  const handlePreview = () => {
    toast.success("Opening mentor profile preview...");
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setMentorData((prev) => ({ ...prev, avatar: avatarUrl }));
    setShowAvatarSelector(false);
    toast.success("Your profile avatar has been changed");
  };

  const getValidEndTimes = (startTime: string) => {
    const startIndex = timeOptions.indexOf(startTime);
    return timeOptions.filter((_, index) => index > startIndex);
  };

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
                    <AvatarImage
                      src={mentorData.avatar || "/placeholder.svg"}
                      alt={mentorData.name}
                    />
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
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}>
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
                        onClick={() => setShowAvatarSelector(false)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {defaultAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => handleAvatarSelect(avatar)}
                          className="relative group">
                          <Avatar className="h-12 w-12 transition-all group-hover:ring-2 group-hover:ring-primary">
                            <AvatarImage
                              src={avatar || "/placeholder.svg"}
                              alt={`Avatar ${index + 1}`}
                            />
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
                onChange={(e) =>
                  setMentorData((prev) => ({ ...prev, name: e.target.value }))
                }
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
                    className={`h-4 w-4 ${
                      mentorData.isPublished
                        ? "text-green-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {mentorData.isPublished ? "Published" : "Unpublished"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mentorData.isPublished
                        ? "Visible to mentees"
                        : "Hidden from mentees"}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={mentorData.isPublished}
                  onCheckedChange={handlePublishToggle}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Profile Overview</Label>
              <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-medium">
                    ${mentorData.hourlyRate}/hour
                  </span>
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

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handlePreview}>
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
                onChange={(e) =>
                  setMentorData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Senior React Developer & Mentor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Bio & Description</Label>
              <Textarea
                id="description"
                value={mentorData.description}
                onChange={(e) =>
                  setMentorData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Tell mentees about your experience, expertise, and how you can help them..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {mentorData.description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Hourly Rate (RM)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-4 text-muted-foreground">
                  RM
                </span>
                <Input
                  id="rate"
                  type="number"
                  value={mentorData.hourlyRate}
                  onChange={(e) =>
                    setMentorData((prev) => ({
                      ...prev,
                      hourlyRate: e.target.value,
                    }))
                  }
                  className="pl-10"
                  placeholder="75"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Available Times</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAvailabilitySlot}
                  disabled={mentorData.availability.length >= 7}
                  className="h-8 bg-transparent">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Time Slot
                </Button>
              </div>

              {mentorData.availability.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No availability slots added yet.</p>
                  <p className="text-xs">
                    Click "Add Time Slot" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mentorData.availability.length >= 7 && (
                    <div className="text-center py-2 text-muted-foreground">
                      <p className="text-xs">
                        All days of the week have been added.
                      </p>
                    </div>
                  )}
                  {mentorData.availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                      <Select
                        value={slot.day}
                        onValueChange={(value) =>
                          updateAvailabilitySlot(index, "day", value)
                        }>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek
                            .filter(
                              (day) =>
                                day === slot.day ||
                                !mentorData.availability.some(
                                  (otherSlot, otherIndex) =>
                                    otherIndex !== index &&
                                    otherSlot.day === day
                                )
                            )
                            .map((day) => (
                              <SelectItem key={day} value={day}>
                                {formatDayName(day)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={slot.start}
                        onValueChange={(value) =>
                          updateAvailabilitySlot(index, "start", value)
                        }>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <span className="text-muted-foreground">to</span>

                      <Select
                        value={slot.end}
                        onValueChange={(value) =>
                          updateAvailabilitySlot(index, "end", value)
                        }>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getValidEndTimes(slot.start).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {mentorData.availability.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Current Availability:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {mentorData.availability.map((slot, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs">
                        {formatDayName(slot.day)} {slot.start}-{slot.end}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Set your available time slots for mentoring sessions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                className="flex-1 bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
