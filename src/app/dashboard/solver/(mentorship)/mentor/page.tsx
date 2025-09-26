import { SessionsList } from "@/features/mentore/components/MentroSessionPageCompx";
import {
  getMentorBookingSessions
} from "@/features/mentore/server/action";

export default async function Page() {
  const bookings = await getMentorBookingSessions();
  return <SessionsList booking={bookings} />;
}
