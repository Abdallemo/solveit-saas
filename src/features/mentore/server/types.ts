import { z } from "zod";
import {
  getMentorListigProfile,
  getMentorListigWithAvailbelDates,
  getMentorBookingSessions,
  getMentorSession,
} from "@/features/mentore/server/action";
import { UploadedFileMeta } from "@/features/media/server/media-types";
export type AvailabilitySlot = {
  day: string;
  start: string;
  end: string;
};

export type MentorListType = Exclude<
  Awaited<ReturnType<typeof getMentorListigProfile>>,
  any[]
>;
export type MentorListigWithAvailbelDates = Awaited<
  ReturnType<typeof getMentorListigWithAvailbelDates>
>[number];
export type MentorBookingSessions = Awaited<
  ReturnType<typeof getMentorBookingSessions>
>;
export type MentorSession = Awaited<ReturnType<typeof getMentorSession>>;
export type MentorChatSession = Exclude<
  Awaited<ReturnType<typeof getMentorSession>>,
  undefined
>['chats'][number];

export const bookingSchema = z.object({
  sessions: z
    .array(
      z.object({
        date: z.date(),
        slot: z.object({
          day: z.string(),
          start: z.string(),
          end: z.string(),
        }),
      })
    )
    .min(1, "Please select at least one session."),
  notes: z.string().optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
export type mentorListingFormData = z.infer<typeof mentorListingSchema>;

export const mentorListingSchema = z.object({
  displayName: z
    .string()
    .min(5, { message: "names should be at least 5 charecter long" }),
  title: z
    .string()
    .min(5, { message: "title should be at least 5 charecter long" }),
  description: z
    .string()
    .min(5, { message: "description should be at least 5 charecter long" }),
  ratePerHour: z.coerce
    .number()
    .min(2, { message: "hourly rate should be at least RM2" }),
});
