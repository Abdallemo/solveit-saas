import { SessionsList } from "@/features/mentore/components/MentroSessionPageCompx";
import { getMentorBookingSessions } from "@/features/mentore/server/action";

export default async function Page() {
  const bookings = await getMentorBookingSessions();
  console.log((bookings));
  return (
    <div className="w-full h-full mx-auto p-10   ">
      <h1 className="text-2xl font-semibold mb-6">Your Sessions</h1>
      <SessionsList booking={bookings} />
    </div>
  );
}
