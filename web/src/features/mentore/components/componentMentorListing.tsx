"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AvailabilitySlot,
  MentorListType,
} from "@/features/mentore/server/types";
import { daysInWeek } from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Eye, Loader2, Save, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  handleProfileAvatarState,
  handleProfilePublishState,
  saveMentorListing,
} from "../server/action";
import { mentorListingFormData, mentorListingSchema } from "../server/types";
import AvailbleTimeSelection from "./AvailbleTimeSelection";
import { ProfileSelection } from "./ProfileSelection";

export function MentorProfile({
  intialMentorData,
}: {
  intialMentorData: NonNullable<MentorListType>;
}) {
  const [mentorData, setMentorData] = useState(intialMentorData);
  const from = useForm<mentorListingFormData>({
    resolver: zodResolver(mentorListingSchema),
    defaultValues: {
      displayName: intialMentorData.displayName,
      ratePerHour: Number(intialMentorData.ratePerHour),
      description: intialMentorData.description,
      title: intialMentorData.title,
    },
    mode: "onChange",
  });
  const { mutate: prfileVisiblityMutate } = useMutation({
    mutationFn: handleProfilePublishState,
    onSuccess: () => {
      toast.success(
        mentorData.isPublished
          ? "Your profile is now visible to mentees."
          : "Your profile is now hidden from mentees.",
        { id: "publish-profile" },
      );
    },
    onError: () => {
      toast.error(
        mentorData.isPublished
          ? "failed to make your profile visible"
          : "failed to make your profile hidden",
        { id: "publish-profile" },
      );
    },
  });
  const { mutateAsync: mentorListingMutate, isPending } = useMutation({
    mutationFn: saveMentorListing,
    onSuccess: () => {
      toast.success("Your mentor profile has been successfully updated.", {
        id: "save-mentor",
      });
    },
    onError: (err) => {
      toast.error("failed to update your mentor profile", {
        id: "save-mentor",
      });
    },
  });
  const { mutateAsync: mentorAvatarMutate, isPending: isSaving } = useMutation({
    mutationFn: handleProfileAvatarState,
    onSuccess: () => {
      toast.success("Your profile avatar has been changed", {
        id: "save-avatar",
      });
    },
    onError: (err) => {
      toast.error("failed to update your avatar profile", {
        id: "save-avatar",
      });
      setMentorData(intialMentorData);
    },
  });

  function addAvailabilitySlot() {
    const usedDays = mentorData.availableTimes.map((slot) => slot.day);
    const availableDay =
      daysInWeek.find((day) => !usedDays.includes(day)) || "monday";
    setMentorData((prev) => ({
      ...prev,
      availableTimes: [
        ...prev.availableTimes,
        { day: availableDay, start: "09:00", end: "17:00" },
      ],
    }));
  }

  function removeAvailabilitySlot(index: number) {
    setMentorData((prev) => ({
      ...prev,
      availableTimes: prev.availableTimes.filter((_, i) => i !== index),
    }));
  }

  function updateAvailabilitySlot(
    index: number,
    field: keyof AvailabilitySlot,
    value: string,
  ) {
    setMentorData((prev) => ({
      ...prev,
      availableTimes: prev.availableTimes.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    }));
  }

  async function handleSave(data: mentorListingFormData) {
    toast.loading("saving..", { id: "save-mentor" });
    await mentorListingMutate({
      title: data.title,
      displayName: data.displayName,
      ratePerHour: Number(data.ratePerHour),
      description: data.description,
      avatar: mentorData.avatar,
      availableTimes: mentorData.availableTimes,
    });
  }

  const handlePublishToggle = (published: boolean) => {
    setMentorData((prev) => ({ ...prev, isPublished: published }));
    toast.loading("updating..", { id: "publish-profile" });
    prfileVisiblityMutate(published);
  };

  async function handleAvatarUpdate(avatarUrl: string) {
    setMentorData((prev) => ({ ...prev, avatar: avatarUrl }));
    toast.loading("saving profile...", { id: "save-avatar" });
    await mentorAvatarMutate(avatarUrl);
  }
  const { isValid } = from.formState;
  return (
    <Form {...from}>
      <form
        onSubmit={from.handleSubmit(handleSave)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileSelection
                currentAvatar={mentorData.avatar}
                displayName={mentorData.displayName}
                onAvatarChange={handleAvatarUpdate}
              />
              <FormField
                control={from.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Your display name" />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
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
                    disabled={!isValid}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Profile Overview</Label>
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hourly Rate</span>
                    <span className="font-medium">
                      RM{mentorData.ratePerHour}/hour
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Active Mentees
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Sessions
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </div>

              <div className="cursor-not-allowed">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  disabled
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={from.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title & Specialization</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Senior React Developer & Mentor"
                      />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={from.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio & Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell mentees about your experience, expertise, and how you can help them..."
                        className="min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      {" "}
                      {field.value.length ?? 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={from.control}
                name="ratePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate per hour</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 min-w-0 text-muted-foreground">
                          RM
                        </span>
                        <Input {...field} type="number" className="pl-10" />
                      </div>
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AvailbleTimeSelection
                addAvailabilitySlot={addAvailabilitySlot}
                availableTimes={mentorData.availableTimes}
                removeAvailabilitySlot={removeAvailabilitySlot}
                updateAvailabilitySlot={updateAvailabilitySlot}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending || isSaving}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPending && <Loader2 className="animate-spine" />}Save
                  Changes
                </Button>
                {false && (
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}
