"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMentorBookingPaymentCheckout } from "@/features/mentore/server/action";
import {
  AvailabilitySlot,
  MentorListigWithAvailbelDates,
} from "@/features/mentore/server/types";
import { calculateSlotDuration } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { format, isSameDay } from "date-fns";
import { CalendarIcon, Clock, DollarSign, Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { BookingFormData, bookingSchema } from "../server/types";

interface BookingModalProps {
  mentor: MentorListigWithAvailbelDates;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ mentor, isOpen, onClose }: BookingModalProps) {
  const [selectedDays, setSelectedDays] = useState<AvailabilitySlot[]>([]);
  const { mutateAsync: MentorBookingMutate, isPending: isSubmitting } =
    useMutation({
      mutationFn: createMentorBookingPaymentCheckout,
    });
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sessions: [],
      notes: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = form;

  const sessions = watch("sessions");

  const onFormSubmit = async (data: BookingFormData) => {
    if (!mentor) return;
    try {
      // toast.success("selecetd this object data:"+JSON.stringify(data,null,2))
      await MentorBookingMutate({ data, mentor });
      reset();
      setSelectedDays([]);
      onClose();
    } catch (error) {
      toast.error("Booking failed. Please try again.");
    }
  };

  const handleClose = useCallback(() => {
    reset();
    setSelectedDays([]);
    onClose();
  }, [reset, onClose]);

  const handleDayToggle = useCallback((slot: AvailabilitySlot) => {
    setSelectedDays((prev) => {
      const isSelected = prev.some(
        (s) =>
          s.day === slot.day && s.start === slot.start && s.end === slot.end
      );
      if (isSelected) {
        return prev.filter(
          (s) =>
            s.day !== slot.day || s.start !== slot.start || s.end !== slot.end
        );
      } else {
        return [...prev, slot];
      }
    });
    // todo allow users to not loose the chosen date
    // setValue("sessions", []);
  }, []);

  const handleDateSelect = useCallback(
    (session: MentorListigWithAvailbelDates["availableDates"][0]) => {
      const newSessions = [...sessions];
      const existingSessionIndex = newSessions.findIndex(
        (s) =>
          isSameDay(s.date, session.date) && s.slot.start === session.slot.start
      );

      if (existingSessionIndex > -1) {
        newSessions.splice(existingSessionIndex, 1);
      } else {
        newSessions.push(session);
      }

      setValue("sessions", newSessions);
    },
    [sessions, setValue]
  );

  const availableDatesForSelectedDays = useMemo(() => {
    if (selectedDays.length === 0) return [];

    return mentor.availableDates.filter((availableDate) =>
      selectedDays.some(
        (selectedDay) =>
          selectedDay.day.toLowerCase() ===
            availableDate.slot.day.toLowerCase() &&
          selectedDay.start === availableDate.slot.start &&
          selectedDay.end === availableDate.slot.end
      )
    );
  }, [mentor.availableDates, selectedDays]);

  const totalCost = useMemo(() => {
    if (!mentor || sessions.length === 0) return 0;
    return sessions.reduce((sum, session) => {
      const duration = calculateSlotDuration(session.slot);
      return sum + mentor.ratePerHour * duration;
    }, 0);
  }, [mentor, sessions]);

  if (!mentor) return null;

  const initials = mentor.displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
  const sortedSessions = [...sessions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={mentor.avatar || "/placeholder.svg"}
                alt={mentor.displayName}
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div>Book Session with {mentor.displayName}</div>
              <div className="text-sm font-normal text-muted-foreground">
                {mentor.title}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Select your preferred time slots and dates for your mentoring
            session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Time Slots
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mentor.availableTimes.map((slot, index) => {
                const isSelected = selectedDays.some(
                  (s) =>
                    s.day === slot.day &&
                    s.start === slot.start &&
                    s.end === slot.end
                );
                const slotKey = `${slot.day}-${slot.start}-${slot.end}`;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={slotKey}
                      checked={isSelected}
                      onCheckedChange={() => handleDayToggle(slot)}
                    />
                    <Label htmlFor={slotKey} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="capitalize font-medium">
                          {slot.day}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {slot.start} - {slot.end}
                        </span>
                      </div>
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDays.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Dates
              </h3>
              <div className="space-y-2">
                <Label>Available Dates (Next 12 weeks)</Label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                  {availableDatesForSelectedDays.length > 0 ? (
                    availableDatesForSelectedDays.map((session, index) => {
                      const isSelected = sessions.some(
                        (s) =>
                          isSameDay(s.date, session.date) &&
                          s.slot.start === session.slot.start
                      );
                      return (
                        <Button
                          key={index}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="text-xs h-auto py-2 px-2"
                          onClick={() => handleDateSelect(session)}>
                          <div className="text-center">
                            <div>{format(session.date, "MMM dd")}</div>
                            <div className="text-xs opacity-75">
                              {format(session.date, "EEE")}
                            </div>
                          </div>
                        </Button>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-center text-muted-foreground">
                      No available dates found for the selected time slots.
                    </p>
                  )}
                </div>
                {errors.sessions && (
                  <p className="text-sm text-red-500">
                    {errors.sessions.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Sessions ({sessions.length})</Label>
              <div className="flex flex-wrap gap-2">
                {sortedSessions.map((session, index) => (
                  <Badge key={index} variant="secondary">
                    {format(session.date, "MMM dd, yyyy")} ({session.slot.start}{" "}
                    - {session.slot.end})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Any specific topics or questions you'd like to discuss?"
              rows={3}
            />
          </div>

          {sessions.length > 0 && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Booking Summary
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Number of sessions:</span>
                  <span>{sessions.length}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Total Cost:</span>
                  <span>RM{totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || sessions.length === 0}
              className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Booking...
                </>
              ) : (
                " Book Session"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
