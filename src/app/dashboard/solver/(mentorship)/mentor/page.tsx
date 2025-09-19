import { isAuthorized } from "@/features/auth/server/actions";
import { SessionsList } from "@/features/mentore/components/MentroSessionPageCompx";
import { getMentorAllSessionCount, getMentorBookingSessions } from "@/features/mentore/server/action";

export default async function Page() {
  const {user} = await isAuthorized(["SOLVER"])
  const data = await getMentorAllSessionCount(user.id)
  console.log(data)
  const bookings = await getMentorBookingSessions();
  return (
    <div className="w-full h-full mx-auto p-10   ">
      <h1 className="text-2xl font-semibold mb-6">Your Sessions</h1>
      <SessionsList booking={bookings} />
    </div>
  );
}
