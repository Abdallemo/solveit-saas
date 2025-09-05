"use server";

import db from "@/drizzle/db";
import {
  MentorshipBookingTable,
  MentorshipChatFilesTable,
  MentorshipChatTable,
  MentorshipProfileTable,
  MentorshipSessionTable,
  PaymentPorposeEnumType,
} from "@/drizzle/schemas";
import {
  getServerUserSession,
  isAuthorized,
} from "@/features/auth/server/actions";
import {
  getServerUserSubscriptionById,
  getUserById,
  UpdateUserField,
} from "@/features/users/server/actions";
import { MentorError, SubscriptionError } from "@/lib/Errors";
import { logger } from "@/lib/logging/winston";
import { and, count, eq, gte, or, sql } from "drizzle-orm";
import { addDays, startOfWeek, isFuture, format, set } from "date-fns";
import { calculateSlotDuration, daysInWeek } from "@/lib/utils";
import {
  AvailabilitySlot,
  BookingFormData,
  bookingSchema,
  MentorListigWithAvailbelDates,
} from "@/features/mentore/server/types";
import { getServerReturnUrl } from "@/features/subscriptions/server/action";
import { stripe } from "@/lib/stripe";
import { env } from "@/env/server";
import { redirect } from "next/navigation";
import { GoHeaders } from "@/lib/go-config";
import { UploadedFileMeta } from "@/features/media/server/media-types";
import { revalidatePath } from "next/cache";

export async function validateMentorAccess() {
  const user = (await getServerUserSession())!;
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  const usrSub = await getServerUserSubscriptionById(user.id);
  if (!usrSub || !usrSub.tier) {
    throw new Error("Unauthorized");
  }

  if (user.role !== "SOLVER") {
    throw new SubscriptionError();
  }

  if (usrSub.tier !== "SOLVER++") {
    throw new MentorError();
  }

  return { user, usrSub };
}

export async function getMentorListigProfile() {
  const { user, usrSub } = await validateMentorAccess();
  const result = await db.query.MentorshipProfileTable.findFirst({
    where: (tb, fn) => fn.eq(tb.userId, user.id!),
  });
  return {
    ...result!,
    displayName: result?.displayName || user.name!,
    description: result?.description ?? "",
    title: result?.title ?? "",
    avatar: result?.avatar ?? "",
    ratePerHour: result?.ratePerHour ?? 0,
    availableTimes: result?.availableTimes ?? [],
  };
}

export async function handleProfilePublishState(isPublished: boolean) {
  const { user, usrSub } = await validateMentorAccess();
  await db
    .insert(MentorshipProfileTable)
    .values({
      userId: user.id!,
      isPublished,
    })
    .onConflictDoUpdate({
      target: MentorshipProfileTable.userId,
      set: { isPublished },
    });
}
export async function handleProfileAvatarState(avatar: string) {
  const { user, usrSub } = await validateMentorAccess();
  await db
    .insert(MentorshipProfileTable)
    .values({
      userId: user.id!,
      avatar,
    })
    .onConflictDoUpdate({
      target: MentorshipProfileTable.userId,
      set: { avatar },
    });
}
export async function saveMentorListing(values: {
  displayName: string;
  title: string;
  avatar: string;
  description: string;
  availableTimes: AvailabilitySlot[];
  ratePerHour: number;
}) {
  const {
    displayName,
    title,
    description,
    availableTimes,
    ratePerHour,
    avatar,
  } = values;
  try {
    const { user, usrSub } = await validateMentorAccess();

    await db
      .insert(MentorshipProfileTable)
      .values({
        userId: user.id!,
        title,
        displayName,
        description,
        avatar,
        availableTimes: availableTimes,
        ratePerHour,
      })
      .onConflictDoUpdate({
        target: MentorshipProfileTable.userId!,
        set: {
          displayName,
          title,
          description,
          availableTimes: availableTimes,
          ratePerHour,
        },
      });
    logger.info("successfully saved mentor profile ");
  } catch (error) {
    logger.error("unable to save mentor listing", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    throw error;
  }
}

function toYMD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

const getSessionKey = (dateYMD: string, slot: AvailabilitySlot) =>
  `${dateYMD}-${slot.day}-${slot.start}-${slot.end}`;
export async function getMentorListigWithAvailbelDates() {
  const allMentors = await db.query.MentorshipProfileTable.findMany();

  const allBookedSessions = await db.query.MentorshipSessionTable.findMany({
    with: {
      bookedSessions: {
        with: {
          solver: { columns: { id: true } },
        },
      },
    },
  });
  const bookedKeys = new Set(
    allBookedSessions.map((session) => {
      const solverId = session.bookedSessions.solverId;
      return `${solverId}-${getSessionKey(
        session.sessionDate,
        session.timeSlot
      )}`;
    })
  );

  const mentorsWithFilteredAvailability = allMentors.map((mentor) => {
    const availableTimes = mentor.availableTimes as AvailabilitySlot[];
    const availableDates: { date: Date; slot: AvailabilitySlot }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });

    for (const slot of availableTimes) {
      const dayIndex = daysInWeek.indexOf(slot.day.toLowerCase());
      if (dayIndex === -1) continue;

      for (let week = 0; week < 12; week++) {
        const dateObj = addDays(weekStart, week * 7 + dayIndex);
        if (!isFuture(dateObj)) continue;

        const ymd = toYMD(dateObj);
        const key = `${mentor.userId}-${getSessionKey(ymd, slot)}`;

        if (!bookedKeys.has(key)) {
          availableDates.push({ date: dateObj, slot });
        }
      }
    }

    return { ...mentor, availableDates };
  });

  return mentorsWithFilteredAvailability;
}

export async function createMentorBookingPaymentCheckout(values: {
  data: BookingFormData;
  mentor: MentorListigWithAvailbelDates;
}) {
  const referer = await getServerReturnUrl();
  try {
    const { user: currentUser, authorized } = await isAuthorized(["POSTER"]);
    const { data, mentor } = values;
    if (!authorized || !currentUser?.id) throw new Error("unAuthorized");
    const validData = bookingSchema.safeParse(data);
    const userId = currentUser.id;
    if (!validData.success) throw new Error("all fields are requred");
    if (validData.data.sessions.length === 0) return;

    const totalPrice = validData.data.sessions.reduce((sum, session) => {
      const duration = calculateSlotDuration(session.slot);
      return sum + mentor.ratePerHour * duration;
    }, 0);

    const user = await getUserById(userId);

    if (!user || !user.id) return;
    let customerId = user.stripeCustomerId;
    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: currentUser.email!,
        name: user.name ?? "",
        metadata: {
          userId: userId,
        },
      });
      customerId = newCustomer.id;
      await UpdateUserField({
        id: user.id,
        data: { stripeCustomerId: customerId },
      });
    }
    let bookingId = "";
    await db.transaction(async (tx) => {
      const result = await tx
        .insert(MentorshipBookingTable)
        .values({
          posterId: userId,
          solverId: mentor.userId,
          price: totalPrice,
          notes: data.notes,
          status: "PENDING",
        })
        .returning({ bookingId: MentorshipBookingTable.id });
      bookingId = result[0].bookingId;
      logger.warn(
        "when assigned from the db transaction bookingId: " + bookingId
      );

      await Promise.all(
        data.sessions.map((session) =>
          tx.insert(MentorshipSessionTable).values({
            bookingId: bookingId,
            sessionDate: format(session.date, "yyyy-MM-dd"),
            timeSlot: session.slot,
          })
        )
      );
    });
    logger.warn("before creating checkout sessoin bookingId: " + bookingId);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId!,

      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: {
              name: "Mentor Booking" as PaymentPorposeEnumType,
            },
            unit_amount: totalPrice * 100,
          },

          quantity: 1,
        },
      ],

      payment_method_types: ["card"],
      payment_method_options: {
        card: {
          setup_future_usage: "off_session",
        },
      },
      payment_intent_data: {
        setup_future_usage: "off_session",
      },

      metadata: {
        userId,
        type: "Mentor Booking" as PaymentPorposeEnumType,
        bookingId,
      },
      cancel_url: `${referer}?booking_id=${bookingId}`,
      success_url: `${env.NEXTAUTH_URL}/dashboard/poster/bookings/?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      saved_payment_method_options: {
        allow_redisplay_filters: ["always", "limited", "unspecified"],
        payment_method_save: "enabled",
      },
    });

    if (!session.url) throw new Error("Failed to create checkout session");
    redirect(session.url);
  } catch (error) {
    throw error;
  }
}

export async function updateMentorBooking(
  bookingId: string,
  paymentId: string
) {
  try {
    const result = await db
      .update(MentorshipBookingTable)
      .set({
        status: "PAID",
        paymentId,
      })
      .where(eq(MentorshipBookingTable.id, bookingId))
      .returning({ bookingId: MentorshipBookingTable.id });
    return result;
  } catch (error) {
    logger.error(
      "failed to update Mentor Temperory Booking\n" + (error as Error).message
    );
    throw new Error("failed to update Mentor Temperory Booking");
  }
}

export async function getMentorBookingSessions() {
  const user = (await getServerUserSession())!;
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }
  const where = and(
    or(
      eq(MentorshipBookingTable.posterId, user.id!),
      eq(MentorshipBookingTable.solverId, user.id!)
    ),
    eq(MentorshipBookingTable.status, "PAID")
  );
  const result = await db.query.MentorshipBookingTable.findMany({
    where,
    with: { bookedSessions: true, solver: true, poster: true },
    orderBy: (tb, fn) => fn.desc(tb.createdAt),
  });
  const totol =
    result.length > 0
      ? result
          .map((r) => {
            return r.bookedSessions.length;
          })
          .reduce((a, b) => a + b)
      : 0;

  return { result, totalCount: totol };
}
export async function getMentorSession(sessionId: string) {
  if (!sessionId) return;
  try {
    const session = await db.query.MentorshipSessionTable.findFirst({
      where: (tb, fn) => fn.eq(tb.id, sessionId),
      with: {
        chats: {
          with: { chatFiles: true, chatOwner: true },
        },
      },
    });
    return session;
  } catch (error) {
    logger.error("unable to fetch the session info", {
      message: (error as Error).message,
      cause: (error as Error).cause,
      stack: (error as Error).stack,
    });
  }
}
export async function sendMentorMessages(values: {
  seesionId: string;
  sentBy: string;
  message: string;
  uploadedFiles: UploadedFileMeta[];
}) {
  const { message, seesionId, sentBy, uploadedFiles } = values;
  console.warn("passed uploadedFile :\n", uploadedFiles);
  if (!seesionId || !sentBy) return;

  try {
    // allways send these data
    //Todo
    // await fetch(`${env.GO_API_URL}/send-messages`, {
    //   method: "POST",
    //   headers: GoHeaders,
    //   body: JSON.stringify(values),
    // });

    const newChat = await db.transaction(async (dx) => {
      const chat = await dx
        .insert(MentorshipChatTable)
        .values({
          seesionId,
          sentBy: sentBy,
          message,
        })
        .returning();
      await fetch(`${env.GO_API_URL}/send-messages`, {
        method: "POST",
        headers: GoHeaders,
        body: JSON.stringify(values),
      });
      if (uploadedFiles && uploadedFiles.length > 0) {
        console.warn("files ");
        await Promise.all(
          uploadedFiles.map((file) =>
            dx.insert(MentorshipChatFilesTable).values({
              chatId: chat[0].id,
              fileName: file.fileName,
              filePath: file.filePath,
              fileSize: file.fileSize,
              fileType: file.fileType,
              storageLocation: file.storageLocation,
              uploadedById: sentBy,
            })
          )
        );
      }
      return chat[0];
    });
    const result = await db.query.MentorshipChatTable.findFirst({
      where: eq(MentorshipChatTable.id, newChat.id),
      with: {
        chatFiles: true,
        chatOwner: {
          columns: {
            password:false,
            stripeCustomerId:false
          },
        },
      },
    });
    await fetch(`${env.GO_API_URL}/send-mentorshipChats`, {
      method: "POST",
      headers: GoHeaders,
      body: JSON.stringify(result),
    });
  } catch (error) {
    logger.error("unable to send message. cause:" + (error as Error).message);
    throw new Error("unable to send message");
  }
}
