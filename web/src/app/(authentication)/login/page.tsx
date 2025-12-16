import { GuestOnly } from "@/features/auth/components/GustHanlder";
import LoginPage from "@/features/auth/login/components/LoginPageComps";

export default async function Page() {
  return (
    <GuestOnly>
      <LoginPage />
    </GuestOnly>
  );
}
