import { GuestOnly } from "@/features/auth/components/GustHanlder";
import RegisterPage from "@/features/auth/register/components/registerPageComps";

export default async function Page() {
  return (
    <GuestOnly>
      <RegisterPage />
    </GuestOnly>
  );
}
