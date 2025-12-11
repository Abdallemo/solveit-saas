import UserPageComponent from "@/features/users/components/admin/UsersPageComponent";
import { getAllUsers } from "@/features/users/server/actions";

export default async function page() {
  const allUsersList = await getAllUsers();

  return <UserPageComponent users={allUsersList} />;
}
