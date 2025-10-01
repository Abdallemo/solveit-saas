import ModeratorsPageComponent from "@/features/users/components/admin/moderator-page-component";
import { getAllModerators } from "@/features/users/server/actions";

export default async function page() {
  const allModeratorsList = await getAllModerators();
  console.log(allModeratorsList);
  return <ModeratorsPageComponent modertors={allModeratorsList} />;
}
