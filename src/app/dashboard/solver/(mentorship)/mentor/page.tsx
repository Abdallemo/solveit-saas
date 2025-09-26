import { isAuthorized } from "@/features/auth/server/actions";
import { SessionsList } from "@/features/mentore/components/MentroSessionPageCompx";
import {
  getMentorBookingSessions
} from "@/features/mentore/server/action";

export default async function Page() {
  const { user } = await isAuthorized(["SOLVER"]);

  const bookings = await getMentorBookingSessions();
  return <SessionsList booking={bookings} />;
}
