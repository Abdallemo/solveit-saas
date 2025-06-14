import { isAuthorized } from "@/features/auth/server/actions";
import AdminDashboardComponent from "@/features/users/components/admin/AdminHomePageComponent";

export default async function page() {
  await isAuthorized("ADMIN");
  
  return (
    <AdminDashboardComponent/>
  );
}
