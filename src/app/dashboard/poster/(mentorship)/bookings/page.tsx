import { MentorsBrowser } from "@/features/mentore/components/BrowseMentor";
import {
  cleanPendingBookign,
  getMentorListigWithAvailbelDates,
  getMentorListigWithAvailbelDatesV2,
} from "@/features/mentore/server/action";
import { redirect } from "next/navigation";

export default async function MentorsPage({
  searchParams,
}: {
  searchParams: Promise<{ booking_id: string }>;
}) {
  const { booking_id } = await searchParams;
  const mentorWithj = await getMentorListigWithAvailbelDates();
  const mentorWithjV2 = await getMentorListigWithAvailbelDatesV2();
  // console.log(mentorWithjV2[0].availableDates)
  if (booking_id) {
    await cleanPendingBookign(booking_id);
    redirect("/dashboard/poster/bookings");
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <MentorsBrowser mentors={mentorWithjV2} />
    </div>
  );
}
