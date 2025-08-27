import { z } from "zod";

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
